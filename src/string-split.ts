import { createRuna } from "./runa.js";
import { serializeValue } from "./util.js";

/**
 * Creates a bidirectional string splitting transformation.
 *
 * This utility converts between strings and arrays of strings using a specified delimiter.
 * Perfect for parsing CSV-style data, processing command-line arguments, or any scenario
 * where strings need to be broken into structured components and rejoined perfectly.
 *
 * The transformation maintains perfect reversibility, ensuring that splitting a string
 * and then joining the resulting array will reproduce the original string exactly.
 *
 * @param delimiter - The string or regex used to split the string and join the array
 * @returns A RunaSync<string, string[]> instance that provides bidirectional splitting/joining
 *
 * @example
 * const csvSplit = runaStringSplit(",");
 *
 * // Split CSV string into array
 * const csvLine = "John,Doe,john@example.com,true";
 * const fields = csvSplit.encode(csvLine);
 * // ["John", "Doe", "john@example.com", "true"]
 *
 * // Join array back into CSV string
 * const restoredCsv = csvSplit.decode(fields);
 * // "John,Doe,john@example.com,true"
 *
 * @example
 * // Split by whitespace for word processing
 * const wordSplit = runaStringSplit(" ");
 * const sentence = "The quick brown fox";
 * const words = wordSplit.encode(sentence);
 * // ["The", "quick", "brown", "fox"]
 * const restored = wordSplit.decode(words);
 * // "The quick brown fox"
 *
 * @example
 * // Split by pipe for configuration parsing
 * const configSplit = runaStringSplit("|");
 * const config = "database|localhost|5432";
 * const parts = configSplit.encode(config);
 * // ["database", "localhost", "5432"]
 * const reassembled = configSplit.decode(parts);
 * // "database|localhost|5432"
 */
export const runaStringSplit = (delimiter: string) =>
  createRuna(
    (str: string) => {
      if (typeof str !== "string") {
        throw new Error(`Invalid string: ${serializeValue(str)}`);
      }
      return str.split(delimiter);
    },
    (arr: string[]) => {
      if (!Array.isArray(arr)) {
        throw new Error(`Invalid array: ${serializeValue(arr)}`);
      }
      return arr.join(delimiter);
    },
  );
