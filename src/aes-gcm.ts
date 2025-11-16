import { getCrypto } from "./crypto.js";
import type { AsyncRuna, Uint8ArrayLike } from "./types.js";
import { concatBuffers } from "./util.js";

export const runaAesGcm = async (
  keyMaterial: string | BufferSource,
  salt?: BufferSource,
): Promise<AsyncRuna<string, Uint8ArrayLike>> => {
  const crypto = await getCrypto();
  const key = await crypto.deriveKey(keyMaterial, salt);
  const encoder = new TextEncoder();
  const decoder = new TextDecoder();

  return {
    encode: async (plaintext: string) => {
      const iv = crypto.randomBytes(12);
      const encoded = encoder.encode(plaintext);
      const ciphertext = new Uint8Array(
        await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, encoded),
      );
      // Return IV + ciphertext combined
      return concatBuffers(iv, ciphertext);
    },
    decode: async (encoded: Uint8Array) => {
      const iv = encoded.slice(0, 12);
      const ciphertext = encoded.slice(12);
      const plaintext = await crypto.subtle.decrypt(
        { name: "AES-GCM", iv },
        key,
        ciphertext,
      );
      return decoder.decode(plaintext);
    },
  } as AsyncRuna<string, Uint8ArrayLike>;
};
