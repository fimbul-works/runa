import { createFF1 } from "ff1-js";
import { createRuna } from "./runa.js";

export const runaFF1 = (
  key: string | Buffer,
  tweak: string | Buffer,
  alphabet?: string,
  minLength?: number,
  maxLength?: number,
) => {
  // Check that all characters are unique
  if (alphabet && new Set(alphabet.split("")).size !== alphabet?.length) {
    throw new Error("Alphabet must contain unique characters");
  }

  const ff1 = createFF1(key, tweak, alphabet, minLength, maxLength);

  return createRuna(
    (plaintext: string) => {
      if (plaintext === null || plaintext === undefined) {
        throw new Error("Input cannot be null or undefined");
      }
      return ff1.encrypt(plaintext);
    },
    (encoded: string) => {
      if (encoded === null || encoded === undefined) {
        throw new Error("Input cannot be null or undefined");
      }
      return ff1.decrypt(encoded);
    },
  );
};
