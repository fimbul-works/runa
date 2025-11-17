import { createRuna } from "./runa";
import { serializeValue } from "./util";

/**
 * Creates a bidirectional string start padding transformation.
 *
 * This utility provides reversible string padding at the beginning using a fill character
 * or string. Perfect for aligning text, formatting IDs, or creating fixed-width displays
 * while maintaining the ability to perfectly restore original strings.
 *
 * The transformation pads the string to the specified maximum length by adding the fill
 * character to the beginning during encoding, and removes the fill characters during
 * decoding. Ensures perfect bidirectional conversion even when the original string
 * contains the fill character.
 *
 * @param maxLength - The target length for the padded string. Must be positive integer.
 * @param fillString - The character(s) to use for padding. Must be non-empty string.
 * @returns A RunaSync<string, string> instance that provides bidirectional start padding/unpadding
 * @throws {Error} When maxLength is not a positive integer or fillString is invalid
 * @throws {Error} When inputs are not valid strings during transformation
 *
 * @example
 * // Create zero-padded number formatter
 * const zeroPad = runaStringPadStart(5, "0");
 *
 * const number = "42";
 * const padded = zeroPad.encode(number);
 * // "00042"
 *
 * const original = zeroPad.decode(padded);
 * // "42"
 *
 * @example
 * // Format IDs with leading characters
 * const idFormatter = runaStringPadStart(8, "X");
 *
 * const shortId = "123";
 * const formattedId = idFormatter.encode(shortId);
 * // "XXXXX123"
 *
 * const restoredId = idFormatter.decode(formattedId);
 * // "123"
 *
 * @example
 * // Handle strings that already contain fill characters
 * const spacePad = runaStringPadStart(10, " ");
 *
 * const message = "  hello"; // Already starts with spaces
 * const padded = spacePad.encode(message);
 * // "        hello"
 *
 * const original = spacePad.decode(padded);
 * // "  hello" (perfectly preserved)
 *
 * @example
 * // Use multi-character fill strings
 * const dotPad = runaStringPadStart(12, "..");
 *
 * const filename = "data";
 * const padded = dotPad.encode(filename);
 * // "........data"
 *
 * const original = dotPad.decode(padded);
 * // "data"
 *
 * @example
 * // Handle edge cases - string longer than maxLength
 * const shortPad = runaStringPadStart(3, "0");
 *
 * const longString = "12345";
 * const padded = shortPad.encode(longString);
 * // "12345" (unchanged, as it's already longer than maxLength)
 *
 * const original = shortPad.decode(padded);
 * // "12345"
 *
 * @example
 * // Error handling
 * try {
 *   runaStringPadStart(0, "0"); // Zero length
 * } catch (error) {
 *   console.log(error.message); // Error about maxLength
 * }
 *
 * try {
 *   runaStringPadStart(5, ""); // Empty fill string
 * } catch (error) {
 *   console.log(error.message); // Error about fillString
 * }
 *
 * try {
 *   const padder = runaStringPadStart(5, "0");
 *   padder.encode(123); // Not a string
 * } catch (error) {
 *   console.log(error.message); // "Invalid string: 123"
 * }
 */

export const runaStringPadStart = (maxLength: number, fillString: string) => {
  if (!Number.isInteger(maxLength) || maxLength <= 0) {
    throw new Error(`maxLength must be a positive integer: ${maxLength}`);
  }
  if (typeof fillString !== "string" || fillString.length === 0) {
    throw new Error(
      `fillString must be a non-empty string: ${JSON.stringify(fillString)}`,
    );
  }

  return createRuna(
    (str: string) => {
      if (typeof str !== "string") {
        throw new Error(`Invalid string: ${JSON.stringify(str)}`);
      }
      // Standard padStart behavior - pads to reach maxLength if shorter, leaves unchanged if longer
      return str.padStart(maxLength, fillString);
    },
    (paddedStr: string) => {
      if (typeof paddedStr !== "string") {
        throw new Error(`Invalid string: ${JSON.stringify(paddedStr)}`);
      }

      // Don't truncate - padStart doesn't truncate strings longer than maxLength
      const workingStr = paddedStr;

      // Count how many characters from the start match the fill pattern
      let paddingLength = 0;
      for (let i = 0; i < workingStr.length; i++) {
        const expectedFillChar = fillString[i % fillString.length];
        if (workingStr[i] === expectedFillChar) {
          paddingLength++;
        } else {
          break;
        }
      }

      // If the entire string is padding and matches the pattern exactly, return empty string
      if (paddingLength === workingStr.length) {
        // Check if it's a complete fill pattern (not just coincidentally matching)
        if (paddingLength % fillString.length === 0) {
          return "";
        }
        // Otherwise, treat it as a regular string with no padding
        return workingStr;
      }

      // Return the substring starting after the padding
      return workingStr.substring(paddingLength);
    },
  );
};

/**
 * Creates a bidirectional string end padding transformation.
 *
 * This utility provides reversible string padding at the end using a fill character
 * or string. Perfect for aligning text, formatting data, creating fixed-width displays,
 * or preparing strings for display while maintaining the ability to perfectly restore original values.
 *
 * The transformation pads the string to the specified maximum length by adding the fill
 * character to the end during encoding, and removes the fill characters during decoding.
 * Ensures perfect bidirectional conversion even when the original string contains the fill character.
 *
 * @param maxLength - The target length for the padded string. Must be positive integer.
 * @param fillString - The character(s) to use for padding. Must be non-empty string.
 * @returns A RunaSync<string, string> instance that provides bidirectional end padding/unpadding
 * @throws {Error} When maxLength is not a positive integer or fillString is invalid
 * @throws {Error} When inputs are not valid strings during transformation
 *
 * @example
 * // Create right-aligned text formatter
 * const rightAlign = runaStringPadEnd(10, " ");
 *
 * const text = "hello";
 * const aligned = rightAlign.encode(text);
 * // "hello     " (right-aligned in 10-character field)
 *
 * const original = rightAlign.decode(aligned);
 * // "hello"
 *
 * @example
 * // Format data with trailing dots
 * const dotFill = runaStringPadEnd(15, ".");
 *
 * const label = "Status";
 * const formatted = dotFill.encode(label);
 * // "Status........."
 *
 * const restored = dotFill.decode(formatted);
 * // "Status"
 *
 * @example
 * // Handle strings that already contain fill characters
 * const spacePad = runaStringPadEnd(12, " ");
 *
 * const message = "hello   "; // Already ends with spaces
 * const padded = spacePad.encode(message);
 * // "hello        "
 *
 * const original = spacePad.decode(padded);
 * // "hello   " (perfectly preserved)
 *
 * @example
 * // Use multi-character fill strings
 * const hashPad = runaStringPadEnd(16, "##");
 *
 * const content = "END";
 * const padded = hashPad.encode(content);
 * // "END##############"
 *
 * const original = hashPad.decode(padded);
 * // "END"
 *
 * @example
 * // Handle edge cases - string longer than maxLength
 * const shortPad = runaStringPadEnd(4, " ");
 *
 * const longString = "123456";
 * const padded = shortPad.encode(longString);
 * // "123456" (unchanged, as it's already longer than maxLength)
 *
 * const original = shortPad.decode(padded);
 * // "123456"
 *
 * @example
 * // Format currency with trailing spaces
 * const currencyFormat = runaStringPadEnd(12, " ");
 *
 * const amount = "$42.50";
 * const formatted = currencyFormat.encode(amount);
 * // "$42.50      " (right-aligned for display)
 *
 * const original = currencyFormat.decode(formatted);
 * // "$42.50"
 *
 * @example
 * // Error handling
 * try {
 *   runaStringPadEnd(-1, " "); // Negative length
 * } catch (error) {
 *   console.log(error.message); // Error about maxLength
 * }
 *
 * try {
 *   runaStringPadEnd(5, null); // Invalid fill string
 * } catch (error) {
 *   console.log(error.message); // Error about fillString
 * }
 *
 * try {
 *   const padder = runaStringPadEnd(5, " ");
 *   padder.encode(["array"]); // Not a string
 * } catch (error) {
 *   console.log(error.message); // "Invalid string: [\"array\"]"
 * }
 */
export const runaStringPadEnd = (maxLength: number, fillString: string) => {
  if (!Number.isInteger(maxLength) || maxLength <= 0) {
    throw new Error(`maxLength must be a positive integer: ${maxLength}`);
  }
  if (typeof fillString !== "string" || fillString.length === 0) {
    throw new Error(
      `fillString must be a non-empty string: ${serializeValue(fillString)}`,
    );
  }

  return createRuna(
    (str: string) => {
      if (typeof str !== "string") {
        throw new Error(`Invalid string: ${serializeValue(str)}`);
      }
      // Standard padEnd behavior - pads to reach maxLength if shorter, leaves unchanged if longer
      return str.padEnd(maxLength, fillString);
    },
    (paddedStr: string) => {
      if (typeof paddedStr !== "string") {
        throw new Error(`Invalid string: ${serializeValue(paddedStr)}`);
      }

      // Handle Unicode properly for emoji and other multi-byte characters
      // Convert to array of actual characters (not UTF-16 code units)
      const chars = [...paddedStr];
      const fillChars = [...fillString];

      // Check if the entire string forms complete repetitions of the fill pattern
      // This handles ambiguous cases where original string equals fill string
      if (chars.length % fillChars.length === 0) {
        let isCompletePattern = true;
        for (let i = 0; i < chars.length; i++) {
          const expectedChar = fillChars[i % fillChars.length];
          if (chars[i] !== expectedChar) {
            isCompletePattern = false;
            break;
          }
        }
        if (isCompletePattern) {
          return "";
        }
      }

      // Work backwards and find where the fill pattern breaks
      for (let i = chars.length - 1; i >= 0; i--) {
        const positionFromEnd = chars.length - 1 - i;
        const expectedChar = fillChars[positionFromEnd % fillChars.length];

        if (chars[i] !== expectedChar) {
          // Return everything after this position (non-matching char + everything after)
          return chars.slice(0, i + 1).join("");
        }
      }

      // If we get here, all characters match the fill pattern but it's not a complete repetition
      // This should be treated as all padding (e.g., empty string case)
      return "";
    },
  );
};
