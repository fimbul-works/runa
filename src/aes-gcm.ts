import { getCrypto } from "./crypto.js";
import { createRunaAsync } from "./runa.js";
import type { RunaAsync, Uint8ArrayLike } from "./types.js";
import { concatBuffers } from "./util.js";

export const runaAesGcm = async (
  key: string | BufferSource,
  salt?: BufferSource,
): Promise<RunaAsync<string, Uint8ArrayLike>> => {
  const crypto = await getCrypto();
  const derivedKey = await crypto.deriveKey(key, salt);
  const encoder = new TextEncoder();
  const decoder = new TextDecoder();

  return createRunaAsync(
    async (plaintext: string) => {
      const iv = crypto.randomBytes(12);
      const encoded = encoder.encode(plaintext);
      const ciphertext = await crypto.subtle.encrypt(
        { name: "AES-GCM", iv },
        derivedKey,
        encoded,
      );
      // Return IV + ciphertext combined
      return concatBuffers(iv, new Uint8Array(ciphertext));
    },
    async (encoded: Uint8Array) => {
      // Extract IV + ciphertext
      const iv = encoded.slice(0, 12);
      const ciphertext = encoded.slice(12);
      const plaintext = await crypto.subtle.decrypt(
        { name: "AES-GCM", iv },
        derivedKey,
        ciphertext,
      );
      return decoder.decode(plaintext);
    },
  );
};
