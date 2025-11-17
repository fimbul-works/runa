import { getCrypto } from "./crypto.js";
import { createRunaAsync } from "./runa.js";
import type { RunaAsync, Uint8ArrayLike } from "./types.js";
import { concatBuffers, serializeValue } from "./util.js";

/**
 * Creates a bidirectional AES-GCM encryption transformation.
 *
 * This utility provides asynchronous AES-GCM (Advanced Encryption Standard with Galois/Counter Mode)
 * encryption and decryption for strings. It uses PBKDF2 key derivation with optional salt for secure
 * key generation from passwords or keys. Perfect for protecting sensitive data, secure storage,
 * or any scenario where confidentiality and authenticity are required.
 *
 * AES-GCM provides both confidentiality (encryption) and authenticity (authentication tag),
 * making it resistant to tampering and forgery attacks. The function generates a random
 * initialization vector (IV) for each encryption operation to ensure semantic security.
 *
 * @param key - The encryption key as string or BufferSource (password, passphrase, or raw key material)
 * @param salt - Optional salt for key derivation (default: random salt). Providing a salt enables deterministic key derivation.
 * @returns A Promise<RunaAsync<string, Uint8ArrayLike>> instance that provides bidirectional AES-GCM encryption/decryption
 * @throws {Error} When key derivation, encryption, or decryption fails
 *
 * @example
 * // Encrypt sensitive data with a password
 * const encryptor = await runaAesGcm("my-secret-password");
 *
 * const sensitiveData = "Social Security Number: 123-45-6789";
 * const encrypted = await encryptor.encode(sensitiveData);
 * // Uint8Array containing IV + ciphertext + authentication tag
 *
 * const decrypted = await encryptor.decode(encrypted);
 * // "Social Security Number: 123-45-6789"
 *
 * @example
 * // Use deterministic salt for consistent encryption
 * const deterministicEncryptor = await runaAesGcm(
 *   "master-key",
 *   new TextEncoder().encode("user123-salt")
 * );
 *
 * const userData = "Personal information";
 * const encryptedData = await deterministicEncryptor.encode(userData);
 * const restoredData = await deterministicEncryptor.decode(encryptedData);
 * console.log(restoredData); // "Personal information"
 *
 * @example
 * // Encrypt API keys or configuration
 * const configEncryptor = await runaAesGcm("config-encryption-key");
 *
 * const apiConfig = {
 *   apiKey: "sk-1234567890abcdef",
 *   secret: "my-webhook-secret"
 * };
 *
 * const encryptedConfig = await configEncryptor.encode(JSON.stringify(apiConfig));
 * const decryptedConfig = JSON.parse(await configEncryptor.decode(encryptedConfig));
 *
 * @example
 * // Store encrypted passwords securely
 * const passwordEncryptor = await runaAesGcm("database-master-key");
 *
 * const userPassword = "UserPassword123!";
 * const encryptedPassword = await passwordEncryptor.encode(userPassword);
 * // Store encryptedPassword in database
 *
 * // Later, verify user login
 * const storedEncryptedPassword = getEncryptedPasswordFromDatabase(); // fetch from database
 * const decryptedPassword = await passwordEncryptor.decode(storedEncryptedPassword);
 * const isValidLogin = decryptedPassword === providedLoginPassword;
 *
 * @example
 * // Handle encryption errors gracefully
 * try {
 *   const encryptor = await runaAesGcm("weak-key");
 *   const encrypted = await encryptor.encode("test data");
 * } catch (error) {
 *   console.error("Encryption failed:", error.message);
 * }
 *
 * // Decryption with wrong data or key
 * try {
 *   const encryptor = await runaAesGcm("correct-key");
 *   const wrongData = new Uint8Array([1, 2, 3]); // Invalid encrypted data
 *   const decrypted = await encryptor.decode(wrongData);
 * } catch (error) {
 *   console.error("Decryption failed:", error.message);
 * }
 */
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
      if (typeof plaintext !== "string") {
        throw new Error(`Invalid string: ${serializeValue(plaintext)}`);
      }
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
      if (!(encoded instanceof Uint8Array)) {
        throw new Error(`Invalid Uint8Array: ${serializeValue(encoded)}`);
      }
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
