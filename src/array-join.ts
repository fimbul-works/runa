import { createRuna } from "./runa.js";
import { serializeValue } from "./util.js";

/**
 * Creates a bidirectional array to string transformation using number joining/splitting.
 *
 * This utility converts between arrays of numbers and strings using customizable separators.
 * Perfect for serializing numeric data for storage/transmission or parsing numeric strings
 * back into arrays. The function supports both integer and floating-point numbers with
 * different parsing strategies based on the separator used.
 *
 * When no separator is provided (empty string), each character is treated as an individual
 * digit during decoding. With a separator, the string is split on that separator and each
 * part is parsed as a number. This makes the function versatile for different numeric
 * encoding formats.
 *
 * @param separator - The separator string to join numbers with (default: "" for character-level joining)
 * @returns A RunaSync<number[], string> instance that provides bidirectional array/string conversion
 * @throws {Error} When input validation fails or number parsing encounters invalid characters/parts
 *
 * @example
 * // Join numbers without separator (character-level)
 * const charJoiner = runaArrayJoin("");
 *
 * const digits = [1, 2, 3, 4, 5];
 * const digitString = charJoiner.encode(digits);
 * // "12345"
 *
 * const restoredDigits = charJoiner.decode(digitString);
 * // [1, 2, 3, 4, 5]
 *
 * @example
 * // Join numbers with comma separator
 * const commaJoiner = runaArrayJoin(",");
 *
 * const numbers = [1, 2.5, 3, 4.75, 5];
 * const csvString = commaJoiner.encode(numbers);
 * // "1,2.5,3,4.75,5"
 *
 * const restoredNumbers = commaJoiner.decode(csvString);
 * // [1, 2.5, 3, 4.75, 5]
 *
 * @example
 * // Use with custom separator for data encoding
 * const dataEncoder = runaArrayJoin("|");
 *
 * const dataPoints = [10, 20, 30, 40, 50];
 * const encodedData = dataEncoder.encode(dataPoints);
 * // "10|20|30|40|50"
 *
 * const decodedData = dataEncoder.decode(encodedData);
 * // [10, 20, 30, 40, 50]
 *
 * @example
 * // Join coordinates for geographic data
 * const coordinateEncoder = runaArrayJoin(",");
 *
 * const coordinates = [40.7128, -74.0060]; // NYC coordinates
 * const coordString = coordinateEncoder.encode(coordinates);
 * // "40.7128,-74.006"
 *
 * const restoredCoords = coordinateEncoder.decode(coordString);
 * // [40.7128, -74.006]
 *
 * @example
 * // Handle integer arrays with dash separator
 * const intEncoder = runaArrayJoin("-");
 *
 * const ids = [123, 456, 789, 101112];
 * const idString = intEncoder.encode(ids);
 * // "123-456-789-101112"
 *
 * const restoredIds = intEncoder.decode(idString);
 * // [123, 456, 789, 101112]
 *
 * @example
 * // Use in URL parameter encoding
 * const paramEncoder = runaArrayJoin("&");
 *
 * const queryParams = [1, 2, 3, 4, 5];
 * const paramString = paramEncoder.encode(queryParams);
 * // "1&2&3&4&5"
 *
 * const restoredParams = paramEncoder.decode(paramString);
 * // [1, 2, 3, 4, 5]
 *
 * @example
 * // Process numeric data from configuration files
 * const configParser = runaArrayJoin(";");
 *
 * const configValues = [8080, 3000, 5432, 6379]; // Port numbers
 * const configString = configParser.encode(configValues);
 * // "8080;3000;5432;6379"
 *
 * const parsedConfig = configParser.decode(configString);
 * // [8080, 3000, 5432, 6379]
 *
 * @example
 * // Handle mixed integer and float data
 * const mixedEncoder = runaArrayJoin(",");
 *
 * const mixedData = [1, 2.5, 3, 4.75, 5.0, 6];
 * const mixedString = mixedEncoder.encode(mixedData);
 * // "1,2.5,3,4.75,5,6"
 *
 * const restoredMixed = mixedEncoder.decode(mixedString);
 * // [1, 2.5, 3, 4.75, 5, 6]
 *
 * @example
 * // Error handling for invalid array input
 * try {
 *   const joiner = runaArrayJoin(",");
 *   joiner.encode("not an array");
 * } catch (error) {
 *   console.log(error.message); // "Invalid array: not an array"
 * }
 *
 * // Error handling for invalid string input
 * try {
 *   const joiner = runaArrayJoin(",");
 *   joiner.decode(123); // Not a string
 * } catch (error) {
 *   console.log(error.message); // "Invalid string: 123"
 * }
 *
 * // Error handling for invalid digit characters (empty separator)
 * try {
 *   const charJoiner = runaArrayJoin("");
 *   charJoiner.decode("12a34"); // Contains non-digit
 * } catch (error) {
 *   console.log(error.message); // "Invalid digit character: a"
 * }
 *
 * // Error handling for invalid number parts (with separator)
 * try {
 *   const commaJoiner = runaArrayJoin(",");
 *   commaJoiner.decode("1,2,abc,4"); // "abc" is not a number
 * } catch (error) {
 *   console.log(error.message); // "Invalid number part: abc"
 * }
 *
 * @example
 * // Use in data transformation chains
 * const numberProcessor = runaArraySplit(3)
 *   .chain(runaArrayJoin("-"));
 *
 * const flatNumbers = [1, 2, 3, 4, 5, 6, 7, 8, 9];
 * const chunkedString = numberProcessor.encode(flatNumbers);
 * // "123-456-789"
 *
 * const originalNumbers = numberProcessor.decode(chunkedString);
 * // [1, 2, 3, 4, 5, 6, 7, 8, 9]
 *
 * @example
 * // Create compact numeric identifiers
 * const idEncoder = runaArrayJoin("");
 *
 * const sequence = [1, 2, 3, 4, 5, 6, 7, 8, 9, 0];
 * const compactId = idEncoder.encode(sequence);
 * // "1234567890"
 *
 * const restoredSequence = idEncoder.decode(compactId);
 * // [1, 2, 3, 4, 5, 6, 7, 8, 9, 0]
 */
export const runaArrayJoin = (separator = "") => {
  return createRuna(
    (arr: number[]) => {
      if (!Array.isArray(arr)) {
        throw new Error(`Invalid array: ${serializeValue(arr)}`);
      }
      return arr.join(separator);
    },
    (str: string) => {
      if (typeof str !== "string") {
        throw new Error(`Invalid string: ${serializeValue(str)}`);
      }
      if (separator === "") {
        // For empty separator, treat each character as a digit
        return str.split("").map((char) => {
          const num = Number.parseInt(char, 10);
          if (Number.isNaN(num)) {
            throw new Error(`Invalid digit character: ${serializeValue(char)}`);
          }
          return num;
        });
      }
      return str.split(separator).map((part) => {
        const num = Number.parseFloat(part);
        if (Number.isNaN(num)) {
          throw new Error(`Invalid number part: ${serializeValue(part)}`);
        }
        return num;
      });
    },
  );
};
