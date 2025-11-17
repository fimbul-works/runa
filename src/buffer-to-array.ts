import { createRuna } from "./runa.js";

/**
 * Creates a bidirectional buffer-to-array transformation.
 *
 * This utility converts between iterable number collections (like Uint8Array) and
 * JavaScript arrays of numbers. Perfect for working with binary data, cryptographic
 * operations, or any scenario where buffers need to be manipulated as regular arrays.
 *
 * The transformation handles any iterable number collection (Uint8Array, Buffer, etc.)
 * and converts it to a standard Array<number>, while the reverse conversion creates
 * a new Uint8Array from the number array. Essential for interoperability between
 * different binary data formats.
 *
 * @returns A RunaSync<Iterable<number>, Array<number>> instance that provides bidirectional buffer/array conversion
 *
 * @example
 * const bufferToArray = runaBufferToArray();
 *
 * // Convert Uint8Array to regular array
 * const buffer = new Uint8Array([72, 101, 108, 108, 111, 32, 87, 111, 114, 108, 100]);
 * const array = bufferToArray.encode(buffer);
 * // [72, 101, 108, 108, 111, 32, 87, 111, 114, 108, 100]
 *
 * // Convert array back to Uint8Array
 * const restoredBuffer = bufferToArray.decode(array);
 * // Uint8Array [72, 101, 108, 108, 111, 32, 87, 111, 114, 108, 100]
 *
 * @example
 * // Work with Buffer in Node.js
 * const nodeBuffer = Buffer.from("Binary data", "utf8");
 * const dataArray = bufferToArray.encode(nodeBuffer);
 * // Array of UTF-8 byte values
 *
 * const restoredNodeBuffer = bufferToArray.decode(dataArray);
 * // Uint8Array containing the original data
 *
 * @example
 * // Use in transformation chains with other binary utilities
 * const chain = runaStringToBuffer()
 *   .chain(runaBufferToArray())
 *   .chain(runaArraySplit(4));
 *
 * const message = "Transform me!";
 * const chunks = chain.encode(message);
 * // Results in chunked arrays of UTF-8 byte values
 *
 * const original = chain.decode(chunks);
 * // "Transform me!" (perfect round-trip)
 *
 * @example
 * // Cryptographic data processing
 * const cryptoData = new Uint8Array([0x12, 0x34, 0x56, 0x78, 0x9a, 0xbc, 0xde, 0xf0]);
 * const numberArray = bufferToArray.encode(cryptoData);
 * // [18, 52, 86, 120, 154, 188, 222, 240]
 *
 * // Process numbers as needed
 * const processedNumbers = numberArray.map(n => n ^ 0xff); // XOR each byte
 * const processedBuffer = bufferToArray.decode(processedNumbers);
 * // Uint8Array with processed bytes
 */
export const runaBufferToArray = () => {
  return createRuna(
    (buffer: Iterable<number>) => Array.from(buffer) as Array<number>,
    (arr: Array<number>) => new Uint8Array(arr),
  );
};
