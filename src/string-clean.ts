import { createRuna } from "./runa.js";

/**
 * A reversible string cleaner that removes and restores separators.
 *
 * Note: This is only truly reversible when used with consistent chunking patterns.
 * For arbitrary strings, this may not restore the exact original separator positions.
 * Use with caution in bidirectional transformations.
 */
export const runaStringClean = (separator = "|") => {
  return createRuna(
    (str: string) => {
      if (str === null || str === undefined) {
        throw new Error("Input cannot be null or undefined");
      }
      if (typeof str !== "string") {
        throw new Error(`Expected string, got ${typeof str}`);
      }
      if (str.length === 0) {
        return "";
      }

      // Remove separators and return clean string
      return str.split(separator).join("");
    },
    (cleanStr: string) => {
      if (cleanStr === null || cleanStr === undefined) {
        throw new Error("Input cannot be null or undefined");
      }
      if (typeof cleanStr !== "string") {
        throw new Error(`Expected string, got ${typeof cleanStr}`);
      }
      if (cleanStr.length === 0) {
        return "";
      }

      // WARNING: This is not perfectly reversible since we lose information about separator positions
      // We attempt to reconstruct separators based on a heuristic, but this may not match the original

      // Try to infer chunk size based on typical charset encoding patterns
      // For most use cases, we'll use a default chunk size of 3-4 characters
      // This works well with typical base64 or charset encodings
      let chunkSize = 3;

      // If the string looks like base64, use chunk size 4
      if (/^[A-Za-z0-9+/]+$/.test(cleanStr)) {
        chunkSize = 4;
      }

      // If the string is very short, use smaller chunks
      if (cleanStr.length < 6) {
        chunkSize = Math.max(1, Math.floor(cleanStr.length / 2));
      }

      const result: string[] = [];
      for (let i = 0; i < cleanStr.length; i += chunkSize) {
        result.push(cleanStr.slice(i, i + chunkSize));
      }

      return result.join(separator);
    }
  );
};

/**
 * A truly reversible string separator utility that preserves exact positions.
 * This uses encoding to store separator positions invisibly.
 */
export const runaStringSeparator = (separator = "|") => {
  return createRuna(
    (str: string) => {
      if (str === null || str === undefined) {
        throw new Error("Input cannot be null or undefined");
      }
      if (typeof str !== "string") {
        throw new Error(`Expected string, got ${typeof str}`);
      }
      if (str.length === 0) {
        return "";
      }

      // Split by separator and encode positions using a special marker
      const parts = str.split(separator);

      // Use a completely different character set that doesn't include the separator
      // We'll use a URL-safe base64-like encoding for the separator position
      const separatorCode = separator.charCodeAt(0).toString(36);
      const marker = `__SEP_${separatorCode}__`;

      const encoded = parts.map((part) => {
        if (part.includes(marker)) {
          throw new Error("String contains encoding marker which conflicts with separator encoding");
        }
        return part;
      }).join(marker);

      return encoded;
    },
    (encodedStr: string) => {
      if (encodedStr === null || encodedStr === undefined) {
        throw new Error("Input cannot be null or undefined");
      }
      if (typeof encodedStr !== "string") {
        throw new Error(`Expected string, got ${typeof encodedStr}`);
      }
      if (encodedStr.length === 0) {
        return "";
      }

      // Decode the positions and restore separators
      const separatorCode = separator.charCodeAt(0).toString(36);
      const marker = `__SEP_${separatorCode}__`;
      const parts = encodedStr.split(marker);

      return parts.join(separator);
    }
  );
};