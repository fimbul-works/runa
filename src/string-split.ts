import { createRuna } from "./runa.js";

export const runaStringSplit = (delimiter: string) =>
  createRuna(
    (str: string) => {
      if (typeof str !== "string") {
        throw new Error(`Invalid string: ${str}`);
      }
      return str.split(delimiter);
    },
    (arr: string[]) => {
      if (!Array.isArray(arr)) {
        throw new Error(`Invalid array: ${arr}`);
      }
      return arr.join(delimiter);
    },
  );
