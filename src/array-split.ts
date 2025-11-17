import { createRuna } from "./runa.js";

/**
 * Creates a bidirectional array chunking transformation.
 *
 * This utility converts between flat arrays and 2D chunked arrays by splitting
 * arrays into fixed-size chunks and rejoining them perfectly. Essential for
 * data processing pipelines, cryptographic operations, or any scenario where
 * arrays need to be processed in fixed-size batches.
 *
 * The transformation validates chunk sizes during decoding to ensure data integrity,
 * preventing silent corruption from mismatched chunk dimensions. The final chunk
 * may be smaller than the specified chunk size if the array length isn't evenly
 * divisible.
 *
 * @template T - The type of elements in the array
 * @param chunkSize - Size of each chunk (default: 1). Must be a positive integer.
 * @returns A RunaSync<Array<T>, Array<Array<T>>> instance that provides bidirectional array chunking/flattening
 * @throws {Error} When chunkSize is less than 1 or when input validation fails
 *
 * @example
 * // Split array into pairs
 * const pairSplitter = runaArraySplit<string>(2);
 *
 * const flatArray = ["a", "b", "c", "d", "e", "f"];
 * const chunked = pairSplitter.encode(flatArray);
 * // [["a", "b"], ["c", "d"], ["e", "f"]]
 *
 * const restored = pairSplitter.decode(chunked);
 * // ["a", "b", "c", "d", "e", "f"]
 *
 * @example
 * // Split numbers into groups of 3
 * const numberGrouper = runaArraySplit<number>(3);
 *
 * const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
 * const groups = numberGrouper.encode(numbers);
 * // [[1, 2, 3], [4, 5, 6], [7, 8, 9], [10]]
 *
 * const flattened = numberGrouper.decode(groups);
 * // [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
 *
 * @example
 * // Use in cryptographic transformations
 * const cryptoChunker = runaArraySplit<number>(16); // 16-byte blocks
 *
 * const data = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17];
 * const blocks = cryptoChunker.encode(data);
 * // [[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16], [17]]
 *
 * // Validation prevents corruption
 * try {
 *   const invalidChunks = [[1, 2, 3], [4, 5, 6, 7, 8]]; // Second chunk too large
 *   cryptoChunker.decode(invalidChunks);
 * } catch (error) {
 *   console.log(error.message); // "Array length exceeds chunkSize: [...]"
 * }
 *
 * @example
 * // Process characters in text
 * const charChunker = runaArraySplit<string>(4);
 *
 * const chars = ["H", "e", "l", "l", "o", " ", "W", "o", "r", "l", "d"];
 * const charGroups = charChunker.encode(chars);
 * // [["H", "e", "l", "l"], ["o", " ", "W", "o"], ["r", "l", "d"]]
 *
 * const rejoined = charChunker.decode(charGroups);
 * // ["H", "e", "l", "l", "o", " ", "W", "o", "r", "l", "d"]
 *
 * // Error handling for invalid chunk size
 * try {
 *   runaArraySplit(0);
 * } catch (error) {
 *   console.log(error.message); // "Chunk size must be a positive integer"
 * }
 */
export const runaArraySplit = <T>(chunkSize = 1) => {
  if (chunkSize < 1) {
    throw new Error("Chunk size must be a positive integer");
  }

  return createRuna(
    (arr: Array<T>) => {
      if (!Array.isArray(arr)) {
        throw new Error(`Invalid array: ${arr}`);
      }
      const chunks = Math.ceil(arr.length / chunkSize);
      const output: Array<Array<T>> = [];
      for (let i = 0; i < chunks; i++) {
        output.push(arr.slice(i * chunkSize, i * chunkSize + chunkSize));
      }
      return output;
    },
    (arr: Array<Array<T>>) => {
      if (!Array.isArray(arr)) {
        throw new Error(`Invalid array: ${arr}`);
      }
      let output: Array<T> = [];
      for (let i = 0; i < arr.length; i++) {
        if (!Array.isArray(arr[i])) {
          throw new Error(`Invalid array: ${JSON.stringify(arr[i])}`);
        }
        if (arr[i].length > chunkSize) {
          throw new Error(
            `Array length exceeds chunkSize: ${JSON.stringify(arr[i])}`,
          );
        }
        output = output.concat(arr[i]);
      }
      return output;
    },
  );
};
