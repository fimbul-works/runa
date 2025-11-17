import { createRuna } from "./runa.js";
import { serializeValue } from "./util.js";

/**
 * Creates a bidirectional number to character transformation.
 *
 * This utility converts between ASCII character codes (0-255) and their corresponding
 * single-character representations. Perfect for character encoding/decoding operations,
 * working with character-based protocols, or manipulating individual characters
 * in text processing and data transformation pipelines.
 *
 * The transformation validates that character codes are within the valid ASCII range
 * (0-255) and ensures that input characters are exactly one character long during
 * decoding. This makes it ideal for working with byte-level character data.
 *
 * @returns A RunaSync<number, string> instance that provides bidirectional number/character conversion
 * @throws {Error} When character code is out of range (0-255), input is not a number, or character is not exactly one character long
 *
 * @example
 * // Convert character codes to characters and back
 * const charConverter = runaNumberToChar();
 *
 * const charCode = 65; // ASCII 'A'
 * const character = charConverter.encode(charCode);
 * // "A"
 *
 * const restoredCode = charConverter.decode(character);
 * // 65
 *
 * @example
 * // Work with lowercase letters
 * const lowerCaseConverter = runaNumberToChar();
 *
 * const lowerCodes = [97, 98, 99, 100, 101]; // a, b, c, d, e
 * const lowerChars = lowerCodes.map(code => charConverter.encode(code));
 * // ["a", "b", "c", "d", "e"]
 *
 * const restoredLowerCodes = lowerChars.map(char => charConverter.decode(char));
 * // [97, 98, 99, 100, 101]
 *
 * @example
 * // Handle digits and symbols
 * const symbolConverter = runaNumberToChar();
 *
 * const digitCode = 50; // ASCII '2'
 * const digit = symbolConverter.encode(digitCode);
 * // "2"
 *
 * const symbolCode = 33; // ASCII '!'
 * const symbol = symbolConverter.encode(symbolCode);
 * // "!"
 *
 * const restoredDigit = symbolConverter.decode(digit);
 * // 50
 * const restoredSymbol = symbolConverter.decode(symbol);
 * // 33
 *
 * @example
 * // Process extended ASCII characters
 * const extendedConverter = runaNumberToChar();
 *
 * const extendedCode = 233; // ASCII 'é'
 * const extendedChar = extendedConverter.encode(extendedCode);
 * // "é"
 *
 * const restoredExtendedCode = extendedConverter.decode(extendedChar);
 * // 233
 *
 * // Maximum value
 * const maxCode = 255;
 * const maxChar = extendedConverter.encode(maxCode);
 * // "ÿ" (Latin small letter y with diaeresis)
 *
 * const restoredMaxCode = extendedConverter.decode(maxChar);
 * // 255
 *
 * @example
 * // Use in character-based data processing
 * const dataProcessor = runaNumberToChar();
 *
 * const byteArray = [72, 101, 108, 108, 111]; // "Hello" in ASCII
 * const textMessage = byteArray.map(code => dataProcessor.encode(code)).join("");
 * // "Hello"
 *
 * const restoredByteArray = textMessage.split("").map(char => dataProcessor.decode(char));
 * // [72, 101, 108, 108, 111]
 *
 * @example
 * // Error handling for invalid character codes
 * try {
 *   const converter = runaNumberToChar();
 *   converter.encode(-1); // Negative number
 * } catch (error) {
 *   console.log(error.message); // "Character code out of range 0-255: -1"
 * }
 *
 * try {
 *   const converter = runaNumberToChar();
 *   converter.encode(256); // Too large
 * } catch (error) {
 *   console.log(error.message); // "Character code out of range 0-255: 256"
 * }
 *
 * try {
 *   const converter = runaNumberToChar();
 *   converter.encode(3.14); // Non-integer
 * } catch (error) {
 *   console.log(error.message); // "Invalid character code: 3.14"
 * }
 *
 * // Error handling for invalid characters
 * try {
 *   const converter = runaNumberToChar();
 *   converter.decode("ab"); // Multiple characters
 * } catch (error) {
 *   console.log(error.message); // "Invalid character: \"ab\""
 * }
 *
 * try {
 *   const converter = runaNumberToChar();
 *   converter.decode(""); // Empty string
 * } catch (error) {
 *   console.log(error.message); // "Invalid character: \"\""
 * }
 *
 * @example
 * // Character code lookup table
 * const charLookup = runaNumberToChar();
 *
 * const printableCodes = Array.from({ length: 95 }, (_, i) => i + 32); // 32-126
 * const printableChars = printableCodes.map(code => ({
 *   code,
 *   char: charLookup.encode(code)
 * }));
 *
 * // Results in mapping: {code: 32, char: " "}, {code: 33, char: "!"}, etc.
 *
 * @example
 * // Binary data to text conversion
 * const binaryConverter = runaNumberToChar();
 *
 * const binaryData = [80, 87, 78]; // 'P', 'W', 'N' in ASCII
 * const textSignature = binaryData.map(code => binaryConverter.encode(code)).join("");
 * // "PWN"
 *
 * const signatureBytes = textSignature.split("").map(char => binaryConverter.decode(char));
 * // [80, 87, 110]
 */
export const runaNumberToChar = () => {
  return createRuna(
    (charCode: number) => {
      if (typeof charCode !== "number") {
        throw new Error(`Invalid character code: ${serializeValue(charCode)}`);
      }
      if (charCode <= 0 || charCode > 255) {
        throw new Error(
          `Character code out of range 0-255: ${serializeValue(charCode)}`,
        );
      }
      return String.fromCharCode(charCode);
    },
    (char: string) => {
      if (typeof char !== "string" || char.length !== 1) {
        throw new Error(`Invalid character: ${serializeValue(char)}`);
      }
      return char.charCodeAt(0);
    },
  );
};

export default runaNumberToChar;
