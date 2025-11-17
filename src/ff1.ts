import { createFF1 } from "ff1-js";
import { createRuna } from "./runa.js";
import { serializeValue } from "./util.js";

/**
 * Creates a bidirectional FF1 (Format-Preserving Encryption) transformation.
 *
 * This utility provides FF1 format-preserving encryption using the ff1-js library, which
 * allows encryption of data while maintaining the original format and length. Perfect for
 * protecting sensitive numeric or alphanumeric data like social security numbers, credit
 * card numbers, or account IDs where the format must remain unchanged.
 *
 * FF1 is an NIST-approved format-preserving encryption mode that operates on strings
 * while preserving their length and character set. This makes it ideal for legacy systems
 * where changing data formats would be difficult or expensive.
 *
 * @param key - The encryption key as string or Buffer (must be cryptographically secure)
 * @param tweak - Additional input (tweak) for domain separation (string or Buffer)
 * @param alphabet - Optional custom character set (default: all digits 0-9)
 * @param minLength - Optional minimum length constraint for encrypted data
 * @param maxLength - Optional maximum length constraint for encrypted data
 * @returns A RunaSync<string, string> instance that provides bidirectional FF1 encryption/decryption
 * @throws {Error} When alphabet contains duplicate characters, key/tweak are invalid, or input constraints are violated
 *
 * @example
 * // Encrypt social security numbers (preserving format)
 * const ssnEncryptor = runaFF1(
 *   "encryption-key-123",
 *   "ssn-domain"
 * );
 *
 * const ssn = "123-45-6789";
 * const encryptedSsn = ssnEncryptor.encode(ssn);
 * // "876-09-4321" (still in SSN format)
 *
 * const decryptedSsn = ssnEncryptor.decode(encryptedSsn);
 * // "123-45-6789" (original value)
 *
 * @example
 * // Encrypt credit card numbers (digits only)
 * const cardEncryptor = runaFF1(
 *   "secure-key-here",
 *   "credit-cards",
 *   "0123456789" // Only digits
 * );
 *
 * const cardNumber = "4111222233334444";
 * const encryptedCard = cardEncryptor.encode(cardNumber);
 * // "9876555544443210" (16 digits, same format)
 *
 * const decryptedCard = cardEncryptor.decode(encryptedCard);
 * // "4111222233334444"
 *
 * @example
 * // Encrypt alphanumeric account IDs
 * const accountEncryptor = runaFF1(
 *   "master-key",
 *   "account-ids",
 *   "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789", // Alphanumeric
 *   8, // Min 8 characters
 *   12 // Max 12 characters
 * );
 *
 * const accountId = "ABC12345";
 * const encryptedId = accountEncryptor.encode(accountId);
 * // "XYZ98765" (same length and character set)
 *
 * const decryptedId = accountEncryptor.decode(encryptedId);
 * // "ABC12345"
 *
 * @example
 * // Use with Base64 character set for general encryption
 * const base64Encryptor = runaFF1(
 *   "secret-key",
 *   "general-purpose",
 *   "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/"
 * );
 *
 * const data = "HelloWorld123";
 * const encrypted = base64Encryptor.encode(data);
 * // "xYzAbC987Def" (same length, Base64 characters)
 *
 * const decrypted = base64Encryptor.decode(encrypted);
 * // "HelloWorld123"
 *
 * @example
 * // Encrypt user IDs with length constraints
 * const userIdEncryptor = runaFF1(
 *   "user-protection-key",
 *   "user-domain",
 *   "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789",
 *   6, // Minimum 6 chars
 *   10 // Maximum 10 chars
 * );
 *
 * const userId = "User123";
 * const encryptedId = userIdEncryptor.encode(userId);
 * // "Mno789" (valid length and character set)
 *
 * const originalId = userIdEncryptor.decode(encryptedId);
 * // "User123"
 *
 * @example
 * // Error handling for invalid alphabet
 * try {
 *   runaFF1("key", "tweak", "01234567890"); // Duplicate 0
 * } catch (error) {
 *   console.log(error.message); // "Alphabet must contain unique characters"
 * }
 *
 * // Error handling for null/undefined input
 * try {
 *   const encryptor = runaFF1("key", "tweak");
 *   encryptor.encode(null);
 * } catch (error) {
 *   console.log(error.message); // "Input cannot be null or undefined"
 * }
 *
 * try {
 *   const encryptor = runaFF1("key", "tweak");
 *   encryptor.decode(undefined);
 * } catch (error) {
 *   console.log(error.message); // "Input cannot be null or undefined"
 * }
 *
 * @example
 * // Use different tweaks for different data types
 * const addressEncryptor = runaFF1("key", "address-tweak");
 * const phoneEncryptor = runaFF1("key", "phone-tweak");
 * const emailEncryptor = runaFF1("key", "email-tweak");
 *
 * // Same key, different tweaks provide domain separation
 * const address = "123 Main St";
 * const phone = "555-1234";
 * const email = "user@example.com";
 *
 * // These will encrypt to different values even with same key
 */
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
      if (typeof plaintext !== "string") {
        throw new Error(`Invalid string: ${serializeValue(plaintext)}`);
      }
      return ff1.encrypt(plaintext);
    },
    (encoded: string) => {
      if (typeof encoded !== "string") {
        throw new Error(`Invalid string: ${serializeValue(encoded)}`);
      }
      return ff1.decrypt(encoded);
    },
  );
};
