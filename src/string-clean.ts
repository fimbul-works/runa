import { createRuna } from "./runa.js";

/**
 * Creates a heuristic-based string separator transformation.
 *
 * This utility removes separators from strings and attempts to restore them using
 * pattern-based heuristics. It analyzes the cleaned string to infer appropriate
 * chunk sizes for separator reinsertion, working well with predictable encodings
 * like base64 or charset-based transformations.
 *
 * **⚠️ Limited Reversibility**: This implementation is not perfectly reversible for
 * arbitrary strings since separator position information is lost. Use `runaStringSeparator`
 * for perfect reversibility in critical transformation chains.
 *
 * @param separator - The separator character to remove/restore (default: "|")
 * @returns A RunaSync<string, string> instance that provides heuristic-based separator removal/restoration
 *
 * @example
 * const cleaner = runaStringClean("|");
 *
 * // Remove separators from encoded string
 * const encoded = "SGVs|bG8s|V29y|bGQ=";
 * const cleaned = cleaner.encode(encoded);
 * // "SGVsbG8sV29ybGQ="
 *
 * // Attempt to restore separators (may not match original exactly)
 * const restored = cleaner.decode(cleaned);
 * // "SGVsbG8sV29ybGQ=" or "SGVs|bG8s|V29y|bGQ=" depending on heuristics
 *
 * @example
 * // Works well with predictable charset encodings
 * const charsetCleaner = runaStringClean("|");
 * const charsetEncoded = "abc|def|ghi|jkl";
 * const charsetClean = charsetCleaner.encode(charsetEncoded);
 * // "abcdefghijkl"
 * const charsetRestored = charsetCleaner.decode(charsetClean);
 * // "abc|def|ghi|jkl" (restored with 3-char chunks)
 *
 * @deprecated Use `runaStringSeparator` for perfect reversibility in transformation chains
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
 * Creates a perfectly reversible string separator transformation.
 *
 * This utility removes separators from strings while preserving their exact positions
 * using invisible encoding markers. It guarantees perfect reversibility by embedding
 * separator position information into the encoded string, making it ideal for critical
 * transformation chains where data integrity must be preserved.
 *
 * The encoding uses special markers that are unlikely to appear in normal text,
 * ensuring the separator positions can be perfectly reconstructed during decoding.
 * This approach eliminates the data loss issues of heuristic-based methods.
 *
 * @param separator - The separator character to remove/restore (default: "|")
 * @returns A RunaSync<string, string> instance that provides perfectly reversible separator removal/restoration
 *
 * @example
 * const separator = runaStringSeparator("|");
 *
 * // Remove separators while preserving position information
 * const original = "part1|part2|part3|part4";
 * const encoded = separator.encode(original);
 * // "part1__SEP_7c__part2__SEP_7c__part3__SEP_7c__part4"
 *
 * // Perfectly restore separators to exact original positions
 * const restored = separator.decode(encoded);
 * // "part1|part2|part3|part4" (exact match)
 *
 * @example
 * // Works with any separator character
 * const pipeSeparator = runaStringSeparator("|");
 * const dashSeparator = runaStringSeparator("-");
 * const slashSeparator = runaStringSeparator("/");
 *
 * const pipeString = "a|b|c|d";
 * const dashString = "a-b-c-d";
 * const slashString = "a/b/c/d";
 *
 * const pipeEncoded = pipeSeparator.encode(pipeString); // "a__SEP_7c__b__SEP_7c__c__SEP_7c__d"
 * const dashEncoded = dashSeparator.encode(dashString); // "a__SEP_2d__b__SEP_2d__c__SEP_2d__d"
 * const slashEncoded = slashSeparator.encode(slashString); // "a__SEP_2f__b__SEP_2f__c__SEP_2f__d"
 *
 * console.log(pipeSeparator.decode(pipeEncoded)); // "a|b|c|d"
 * console.log(dashSeparator.decode(dashEncoded)); // "a-b-c-d"
 * console.log(slashSeparator.decode(slashEncoded)); // "a/b/c/d"
 *
 * @example
 * // Safe for transformation chains
 * const chain = runaStringSplit(",")
 *   .chain(runaStringSeparator("|"))
 *   .chain(runaBase64());
 *
 * const csv = "John,Doe,john@example.com";
 * const transformed = chain.encode(csv);
 * const original = chain.decode(transformed); // Perfect round-trip
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