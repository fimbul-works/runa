import { runaNumberCharset } from "./number-charset.js";
import { createRuna } from "./runa.js";

export const runaNumberArrayCharset = (alphabet: string, minLength = 1) => {
  const charset = runaNumberCharset(alphabet, minLength);

  return createRuna(
    (numbers: number[]) => {
      if (!Array.isArray(numbers)) {
        throw new Error(`Invalid array: ${numbers}`);
      }
      // Join with a separator that's not in the alphabet
      const separator = "|";
      return numbers.map((num) => charset.encode(num)).join(separator);
    },
    (str: string) => {
      if (typeof str !== "string") {
        throw new Error(`Invalid string: ${str}`);
      }

      const separator = "|";
      if (str.includes(separator)) {
        return str.split(separator).map((chunk) => {
          if (chunk === "") {
            throw new Error("Empty chunk found in encoded string");
          }
          return charset.decode(chunk);
        });
      }
      // Handle case where there's only one number
      return [charset.decode(str)];
    },
  );
};
