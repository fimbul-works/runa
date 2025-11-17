import { runaNumberCharset } from "./number-charset.js";
import { createRuna } from "./runa.js";

/**
 * Creates a bidirectional number array to string transformation using custom character sets.
 *
 * This utility converts between arrays of numbers and strings using a custom alphabet (character set),
 * similar to how runaNumberCharset works but handles multiple numbers. Perfect for encoding sequences
 * of values into compact strings, creating batch IDs, or serializing numeric arrays for storage
 * and transmission.
 *
 * Each number in the array is encoded separately using the specified character set, and the results
 * are joined with a "|" separator. The separator is automatically excluded from the character set
 * validation to prevent conflicts during encoding/decoding operations.
 *
 * @param alphabet - String of unique characters to use as the digit set (must contain at least 2 unique ASCII characters)
 * @param minLength - Minimum length for each encoded number (default: 1). Pads with first character if needed.
 * @returns A RunaSync<number[], string> instance that provides bidirectional number array/string conversion using the custom alphabet
 * @throws {Error} When alphabet validation fails, numbers are invalid, or strings contain invalid characters
 *
 * @example
 * // Create base62 encoding for number arrays
 * const arrayEncoder = runaNumberArrayCharset("0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ");
 *
 * const numbers = [123, 456, 789];
 * const encoded = arrayEncoder.encode(numbers);
 * // "1z7|s0|lh"
 *
 * const decoded = arrayEncoder.decode(encoded);
 * // [123, 456, 789]
 *
 * @example
 * // Encode coordinate pairs or vectors
 * const coordinateEncoder = runaNumberArrayCharset("0123456789", 3); // 3-digit padding
 *
 * const coordinates = [10, 25, 7];
 * const encodedCoords = coordinateEncoder.encode(coordinates);
 * // "010|025|007" (each number padded to 3 digits)
 *
 * const decodedCoords = coordinateEncoder.decode(encodedCoords);
 * // [10, 25, 7]
 *
 * @example
 * // Create compact user permission bitmasks
 * const permissionEncoder = runaNumberArrayCharset("ABCDEFGHIJKLMNOPQRSTUVWXYZ");
 *
 * const userPermissions = [1, 5, 12, 20]; // Read, Write, Delete, Admin
 * const encodedPermissions = permissionEncoder.encode(userPermissions);
 * // "B|F|M|U"
 *
 * const restoredPermissions = permissionEncoder.decode(encodedPermissions);
 * // [1, 5, 12, 20]
 *
 * @example
 * // Handle single number arrays
 * const singleNumberEncoder = runaNumberArrayCharset("01", 8);
 *
 * const singleNumber = [42];
 * const encodedSingle = singleNumberEncoder.encode(singleNumber);
 * // "00101010"
 *
 * const decodedSingle = singleNumberEncoder.decode(encodedSingle);
 * // [42]
 *
 * @example
 * // Work with binary data representation
 * const binaryEncoder = runaNumberArrayCharset("01");
 *
 * const byteArray = [1, 0, 1, 1, 0, 1, 0, 0];
 * const binaryString = binaryEncoder.encode(byteArray);
 * // "1|0|1|1|0|1|0|0"
 *
 * const restoredArray = binaryEncoder.decode(binaryString);
 * // [1, 0, 1, 1, 0, 1, 0, 0]
 *
 * @example
 * // Error handling
 * try {
 *   // Invalid alphabet (duplicate characters)
 *   runaNumberArrayCharset("01234567890");
 * } catch (error) {
 *   console.log(error.message); // "Alphabet must contain unique characters"
 * }
 *
 * try {
 *   const encoder = runaNumberArrayCharset("01");
 *   encoder.decode("1|0|2|1"); // Contains '2' which is not in alphabet
 * } catch (error) {
 *   console.log(error.message); // "Invalid character '2' not found in alphabet"
 * }
 *
 * try {
 *   const encoder = runaNumberArrayCharset("01");
 *   encoder.decode("1||0"); // Contains empty chunk
 * } catch (error) {
 *   console.log(error.message); // "Empty chunk found in encoded string"
 * }
 */
export const runaNumberArrayCharset = (alphabet: string, minLength = 1) => {
  const charset = runaNumberCharset(alphabet, minLength);

  return createRuna(
    (numbers: number[]) => {
      if (!Array.isArray(numbers)) {
        throw new Error(`Invalid array: ${numbers}`);
      }
      // Join with a separator that's not in the alphabet
      const separator = "|";
      return numbers.map((num) => charset.encode(num)).join(separator);
    },
    (str: string) => {
      if (typeof str !== "string") {
        throw new Error(`Invalid string: ${str}`);
      }

      const separator = "|";
      if (str.includes(separator)) {
        return str.split(separator).map((chunk) => {
          if (chunk === "") {
            throw new Error("Empty chunk found in encoded string");
          }
          return charset.decode(chunk);
        });
      }
      // Handle case where there's only one number
      return [charset.decode(str)];
    },
  );
};
