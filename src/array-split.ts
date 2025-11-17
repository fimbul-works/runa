import { createRuna } from "./runa.js";

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
