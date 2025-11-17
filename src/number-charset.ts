import { createRuna } from "./runa.js";

/**
 * Creates a bidirectional number-to-string transformation using custom character sets.
 *
 * This utility converts between numbers and strings using a custom alphabet (character set),
 * similar to how number systems work but with any set of characters. Perfect for creating
 * compact ID systems, YouTube-style IDs, base64-like encodings, or any custom number
 * representation system.
 *
 * The function validates that the alphabet contains unique ASCII characters and provides
 * comprehensive error handling for edge cases. Supports padding to minimum lengths and
 * handles large integers up to MAX_SAFE_INTEGER.
 *
 * @param alphabet - String of unique characters to use as the digit set (must contain at least 2 unique ASCII characters)
 * @param minLength - Minimum length of encoded output (default: 1). Pads with first character if needed.
 * @returns A RunaSync<number, string> instance that provides bidirectional number/string conversion using the custom alphabet
 * @throws {Error} When alphabet validation fails, numbers are negative/non-finite/too large, or strings contain invalid characters
 *
 * @example
 * // Create base62 encoding (0-9, a-z, A-Z)
 * const base62 = runaNumberCharset("0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ");
 *
 * const num = 12345;
 * const encoded = base62.encode(num); // "3d7"
 * const decoded = base62.decode(encoded); // 12345
 *
 * @example
 * // Create YouTube-style ID encoding
 * const youtubeAlphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789_-";
 * const youtubeEncoder = runaNumberCharset(youtubeAlphabet, 8); // Minimum 8 characters
 *
 * const userId = 987654321;
 * const youtubeId = youtubeEncoder.encode(userId);
 * // "AAAAAABQ" (padded to 8 characters)
 *
 * const originalId = youtubeEncoder.decode(youtubeId);
 * // 987654321
 *
 * @example
 * // Create binary encoding
 * const binary = runaNumberCharset("01", 8); // 8-bit binary strings
 *
 * const byte = 42;
 * const binaryStr = binary.encode(byte); // "00101010" (padded to 8 bits)
 * const backToByte = binary.decode(binaryStr); // 42
 *
 * @example
 * // Create hexadecimal encoding
 * const hex = runaNumberCharset("0123456789ABCDEF");
 *
 * const colorValue = 255;
 * const hexColor = hex.encode(colorValue); // "FF"
 * const backToDecimal = hex.decode(hexColor); // 255
 *
 * @example
 * // Create base36 encoding for compact IDs
 * const base36 = runaNumberCharset("0123456789abcdefghijklmnopqrstuvwxyz");
 *
 * const largeNumber = 1234567890;
 * const compactId = base36.encode(largeNumber); // "kf12oi"
 * const restoredNumber = base36.decode(compactId); // 1234567890
 *
 * // Handle sequential IDs
 * for (let i = 1; i <= 5; i++) {
 *   const id = base36.encode(i);
 *   console.log(`User ${i} -> ID ${id}`); // 1, 2, 3, 4, 5
 * }
 *
 * @example
 * // Error handling
 * try {
 *   // Invalid alphabet (duplicate characters)
 *   runaNumberCharset("01234567890");
 * } catch (error) {
 *   console.log(error.message); // "Alphabet must contain unique characters"
 * }
 *
 * try {
 *   // Invalid character in decode
 *   const encoder = runaNumberCharset("01");
 *   encoder.decode("102"); // Contains '2' which is not in alphabet
 * } catch (error) {
 *   console.log(error.message); // "Invalid character '2' not found in alphabet"
 * }
 *
 * try {
 *   // Number too large
 *   const encoder = runaNumberCharset("01");
 *   encoder.encode(Number.MAX_SAFE_INTEGER + 1);
 * } catch (error) {
 *   console.log(error.message); // "Cannot encode numbers larger than Number.MAX_SAFE_INTEGER"
 * }
 */
export const runaNumberCharset = (alphabet: string, minLength = 1) => {
  const base = alphabet.length;
  if (base < 2) {
    throw new Error("Alphabet must have at least 2 characters");
  }
  if (minLength < 1) {
    throw new Error("Minimum length must be at least 1");
  }

  // Check that all characters are ASCII (code point <= 255)
  for (const char of alphabet) {
    if (char.charCodeAt(0) > 255) {
      throw new Error(
        "Alphabet must contain only ASCII characters (code point <= 255)",
      );
    }
  }

  // Check that all characters are unique
  const charset = alphabet.split("");
  const uniqueChars = new Set(charset);
  if (uniqueChars.size !== base) {
    throw new Error("Alphabet must contain unique characters");
  }

  return createRuna(
    (num: number) => {
      if (typeof num !== "number") {
        throw new Error(`Expected number, got ${typeof num}`);
      }
      if (num < 0) {
        throw new Error("Cannot encode negative numbers");
      }
      if (!Number.isFinite(num)) {
        throw new Error("Cannot encode non-finite numbers");
      }
      if (num > Number.MAX_SAFE_INTEGER) {
        throw new Error(
          "Cannot encode numbers larger than Number.MAX_SAFE_INTEGER",
        );
      }

      // Handle decimal numbers by flooring
      num = Math.floor(num);

      // Convert to base-n representation using standard algorithm
      let result = "";
      let quotient = num;

      if (quotient === 0) {
        result = charset[0];
      } else {
        do {
          result = charset[quotient % base] + result;
          quotient = Math.floor(quotient / base);
        } while (quotient > 0);
      }

      // Pad with leading characters to meet minimum length
      while (result.length < minLength) {
        result = charset[0] + result;
      }

      return result;
    },
    (str: string) => {
      if (typeof str !== "string") {
        throw new Error(`Expected string, got ${typeof str}`);
      }
      if (str.length === 0) {
        throw new Error("Cannot decode empty string");
      }

      let result = 0;

      for (let i = 0; i < str.length; i++) {
        const char = str[i];
        const charIndex = charset.indexOf(char);

        if (charIndex === -1) {
          throw new Error(`Invalid character '${char}' not found in alphabet`);
        }

        result = result * base + charIndex;
      }

      return result;
    },
  );
};
