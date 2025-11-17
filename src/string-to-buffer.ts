import { createRuna } from "./runa.js";

/**
 * Creates a bidirectional string-to-Uint8Array buffer transformation.
 *
 * This utility converts between UTF-8 strings and Uint8Array buffers using the
 * standard TextEncoder and TextDecoder APIs. Perfect for handling binary data,
 * file operations, network protocols, or any scenario where strings need to be
 * converted to binary representation and back.
 *
 * The transformation uses UTF-8 encoding, ensuring proper handling of Unicode
 * characters including emojis, accented characters, and other international text.
 * Empty strings and buffers are rejected to prevent data loss in transformation chains.
 *
 * @returns A RunaSync<string, Uint8Array<ArrayBufferLike>> instance that provides bidirectional string/buffer conversion
 * @throws {Error} When input string or buffer is null, undefined, or empty
 *
 * @example
 * const stringToBuffer = runaStringToBuffer();
 *
 * // Encode text to binary buffer
 * const text = "Hello, 世界! 🌍";
 * const buffer = stringToBuffer.encode(text);
 * // Uint8Array [72, 101, 108, 108, 111, 44, 32, 228, 184, 150, 231, 149, 140, 33, 32, 240, 159, 140, 143]
 *
 * // Decode buffer back to text
 * const restoredText = stringToBuffer.decode(buffer);
 * // "Hello, 世界! 🌍"
 *
 * @example
 * // Handle different character encodings
 * const unicodeText = "Café résumé naïve";
 * const binaryData = stringToBuffer.encode(unicodeText);
 * const decodedText = stringToBuffer.decode(binaryData);
 * console.log(decodedText); // "Café résumé naïve"
 *
 * @example
 * // Use in transformation chains
 * const chain = runaStringToBuffer()
 *   .chain(runaBufferToArray())
 *   .chain(runaArraySplit(4));
 *
 * const message = "Binary data test";
 * const processed = chain.encode(message);
 * const original = chain.decode(processed); // Perfect round-trip
 *
 * // Error handling for empty inputs
 * try {
 *   stringToBuffer.encode("");
 * } catch (error) {
 *   console.log(error.message); // "String cannot be empty"
 * }
 *
 * try {
 *   stringToBuffer.decode(new Uint8Array(0));
 * } catch (error) {
 *   console.log(error.message); // "Buffer cannot be empty"
 * }
 */
export const runaStringToBuffer = () => {
  const encoder = new TextEncoder();
  const decoder = new TextDecoder();
  return createRuna(
    (str: string) => {
      if (str === null || str === undefined || str.length === 0) {
        throw new Error("String cannot be empty");
      }
      return encoder.encode(str) as Uint8Array<ArrayBufferLike>;
    },
    (buffer: Uint8Array<ArrayBufferLike>) => {
      if (buffer === null || buffer === undefined || buffer.length === 0) {
        throw new Error("Buffer cannot be empty");
      }
      return decoder.decode(buffer);
    },
  );
};
