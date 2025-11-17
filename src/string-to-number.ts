import { createRuna } from "./runa.js";

export const runaStringToNumber = (radix?: number) => {
  if (typeof radix === "number" && radix < 2) {
    throw new Error(`Radix must be 2 or greater: ${radix}`);
  }

  return createRuna(
    (str: string) => {
      const n =
        typeof radix === "number"
          ? Number.parseInt(str, radix)
          : Number.parseFloat(str);
      if (Number.isNaN(n)) {
        throw new Error(`Not a number: ${str}`);
      }
      return n;
    },
    (num: number) => {
      if (typeof num !== "number") {
        throw new Error(`Not a number: ${num}`);
      }
      return num.toString(radix);
    },
  );
};

export default runaStringToNumber;
