import { createRuna } from "./runa.js";

export const runaFlatten = <T>(chunkSize: number) => {
  if (chunkSize < 1) {
    throw new Error("Chunk size must be a positive integer");
  }

  return createRuna(
    (arr: Array<Array<T>>) => {
      if (!Array.isArray(arr)) {
        throw new Error(`Invalid array: ${arr}`);
      }

      // Validate that all chunks respect the expected size
      for (let i = 0; i < arr.length; i++) {
        const chunk = arr[i];
        if (!Array.isArray(chunk)) {
          throw new Error(`Invalid chunk at index ${i}: ${JSON.stringify(chunk)}`);
        }
        if (chunk.length > chunkSize) {
          throw new Error(`Chunk size ${chunk.length} exceeds expected ${chunkSize} at index ${i}`);
        }
      }

      return arr.flat();
    },
    (flat: Array<T>) => {
      if (!Array.isArray(flat)) {
        throw new Error(`Invalid array: ${flat}`);
      }

      // Re-chunk the flattened array
      const result: Array<Array<T>> = [];
      for (let i = 0; i < flat.length; i += chunkSize) {
        result.push(flat.slice(i, i + chunkSize));
      }
      return result;
    }
  );
};