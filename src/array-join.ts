import { createRuna } from "./runa.js";

export const runaArrayJoin = (separator = "") => {
  return createRuna(
    (arr: number[]) => {
      if (!Array.isArray(arr)) {
        throw new Error(`Invalid array: ${arr}`);
      }
      return arr.join(separator);
    },
    (str: string) => {
      if (typeof str !== "string") {
        throw new Error(`Invalid string: ${str}`);
      }
      if (separator === "") {
        // For empty separator, treat each character as a digit
        return str.split("").map((char) => {
          const num = Number.parseInt(char, 10);
          if (Number.isNaN(num)) {
            throw new Error(`Invalid digit character: ${char}`);
          }
          return num;
        });
      }
      return str.split(separator).map((part) => {
        const num = Number.parseFloat(part);
        if (Number.isNaN(num)) {
          throw new Error(`Invalid number part: ${part}`);
        }
        return num;
      });
    },
  );
};
