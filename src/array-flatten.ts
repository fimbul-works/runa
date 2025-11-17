import { createRuna } from "./runa.js";
import { serializeValue } from "./util.js";

/**
 * Creates a bidirectional array flattening transformation.
 *
 * This utility converts between 2D chunked arrays and flat arrays with validation
 * to ensure chunk sizes are respected during encoding. Perfect for reconstructing
 * chunked data, processing blocks of information, or any scenario where 2D arrays
 * need to be flattened and perfectly restored.
 *
 * The transformation validates that all chunks in the 2D array don't exceed the
 * specified chunk size, preventing data corruption during the encode/decode cycle.
 * It's essentially the reverse operation of array chunking functions.
 *
 * @template T - The type of elements in the arrays
 * @param chunkSize - Maximum allowed size for each chunk (must be positive integer)
 * @returns A RunaSync<Array<Array<T>>, Array<T>> instance that provides bidirectional array flattening/chunking
 * @throws {Error} When chunkSize is less than 1, input validation fails, or chunks exceed size limit
 *
 * @example
 * // Flatten and reconstruct character arrays
 * const charFlattener = runaFlatten<string>(4);
 *
 * const charChunks = [
 *   ["H", "e", "l", "l"],
 *   ["o", " ", "W", "o"],
 *   ["r", "l", "d"]
 * ];
 * const flatChars = charFlattener.encode(charChunks);
 * // ["H", "e", "l", "l", "o", " ", "W", "o", "r", "l", "d"]
 *
 * const reconstructedChunks = charFlattener.decode(flatChars);
 * // [
 * //   ["H", "e", "l", "l"],
 * //   ["o", " ", "W", "o"],
 * //   ["r", "l", "d"]
 * // ]
 *
 * @example
 * // Process number blocks in calculations
 * const numberFlattener = runaFlatten<number>(3);
 *
 * const numberBlocks = [
 *   [1, 2, 3],
 *   [4, 5, 6],
 *   [7, 8, 9],
 *   [10]
 * ];
 * const flatNumbers = numberFlattener.encode(numberBlocks);
 * // [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
 *
 * const restoredBlocks = numberFlattener.decode(flatNumbers);
 * // [
 * //   [1, 2, 3],
 * //   [4, 5, 6],
 * //   [7, 8, 9],
 * //   [10]
 * // ]
 *
 * @example
 * // Use in data processing pipelines
 * const processor = runaFlatten<number>(16); // 16-byte blocks
 *
 * const cryptoBlocks = [
 *   new Array(16).fill(0), // Block 1
 *   new Array(16).fill(1), // Block 2
 *   new Array(8).fill(2)   // Block 3 (partial)
 * ];
 *
 * const flatData = processor.encode(cryptoBlocks);
 * // Array of 40 bytes
 *
 * const chunkedData = processor.decode(flatData);
 * // Restores original block structure
 *
 * @example
 * // Handle mixed data types
 * interface DataItem {
 *   id: number;
 *   value: string;
 * }
 *
 * const dataFlattener = runaFlatten<DataItem>(2);
 *
 * const dataChunks = [
 *   [{ id: 1, value: "a" }, { id: 2, value: "b" }],
 *   [{ id: 3, value: "c" }, { id: 4, value: "d" }],
 *   [{ id: 5, value: "e" }]
 * ];
 *
 * const flatData = dataFlattener.encode(dataChunks);
 * // [{ id: 1, value: "a" }, { id: 2, value: "b" }, { id: 3, value: "c" }, { id: 4, value: "d" }, { id: 5, value: "e" }]
 *
 * const chunkedData = dataFlattener.decode(flatData);
 * // Restores original chunk structure
 *
 * @example
 * // Error handling for invalid chunks
 * try {
 *   const flattener = runaFlatten(3);
 *   const invalidChunks = [
 *     [1, 2, 3],
 *     [4, 5, 6, 7] // Too many elements (4 > chunkSize 3)
 *   ];
 *   flattener.encode(invalidChunks);
 * } catch (error) {
 *   console.log(error.message); // "Chunk size 4 exceeds expected 3 at index 1"
 * }
 *
 * // Error handling for invalid chunk size
 * try {
 *   runaFlatten(0);
 * } catch (error) {
 *   console.log(error.message); // "Chunk size must be a positive integer"
 * }
 *
 * // Error handling for invalid input types
 * try {
 *   const flattener = runaFlatten(2);
 *   flattener.encode("not an array");
 * } catch (error) {
 *   console.log(error.message); // "Invalid array: not an array"
 * }
 */
export const runaFlatten = <T>(chunkSize: number) => {
  if (chunkSize < 1) {
    throw new Error("Chunk size must be a positive integer");
  }

  return createRuna(
    (arr: Array<Array<T>>) => {
      if (!Array.isArray(arr)) {
        throw new Error(`Invalid array: ${serializeValue(arr)}`);
      }

      // Validate that all chunks respect the expected size
      for (let i = 0; i < arr.length; i++) {
        const chunk = arr[i];
        if (!Array.isArray(chunk)) {
          throw new Error(
            `Invalid chunk at index ${i}: ${serializeValue(chunk)}`,
          );
        }
        if (chunk.length > chunkSize) {
          throw new Error(
            `Chunk size ${chunk.length} exceeds expected ${chunkSize} at index ${i}`,
          );
        }
      }

      return arr.flat();
    },
    (flat: Array<T>) => {
      if (!Array.isArray(flat)) {
        throw new Error(`Invalid array: ${serializeValue(flat)}`);
      }

      // Re-chunk the flattened array
      const result: Array<Array<T>> = [];
      for (let i = 0; i < flat.length; i += chunkSize) {
        result.push(flat.slice(i, i + chunkSize));
      }
      return result;
    },
  );
};
