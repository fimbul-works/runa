import type { Runa } from "./types.js";

export const runaSplit = (delimiter: string) => {
  return {
    encode: (str: string) => {
      if (typeof str !== "string") {
        throw new Error(`Invalid string: ${str}`);
      }
      return str.split(delimiter);
    },
    decode: (arr: string[]) => {
      if (!Array.isArray(arr)) {
        throw new Error(`Invalid array: ${arr}`);
      }
      return arr.join(delimiter);
    },
  } as Runa<string, string[]>;
};
