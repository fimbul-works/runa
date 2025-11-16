import type { Runa } from "./types.js";

export const runaNumber = () => {
  return {
    encode: (str: string) => {
      const n = Number.parseFloat(str);
      if (Number.isNaN(n)) {
        throw new Error(`Not a number: ${str}`);
      }
      return n;
    },
    decode: (num: number) => {
      if (typeof num !== "number") {
        throw new Error(`Not a number: ${num}`);
      }
      return String(num);
    },
  } as Runa<string, number>;
};

export default runaNumber;
