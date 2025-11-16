import { getCrypto } from "./crypto.js";
import type { Runa } from "./types.js";

export const runaFF1 = async (
  keyMaterial: string | Buffer,
  tweak: string | Buffer,
  alphabet?: string,
  minLength?: number,
  maxLength?: number,
): Promise<Runa<string, string>> => {
  const crypto = await getCrypto();
  const ff1 = crypto.ff1(keyMaterial, tweak, alphabet, minLength, maxLength);
  return {
    encode: (plaintext: string) => {
      if (plaintext === null || plaintext === undefined) {
        throw new Error("Input cannot be null or undefined");
      }
      return ff1.encrypt(plaintext);
    },
    decode: (encoded: string) => {
      if (encoded === null || encoded === undefined) {
        throw new Error("Input cannot be null or undefined");
      }
      return ff1.decrypt(encoded);
    },
  } as Runa<string, string>;
};
