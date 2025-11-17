import { createRuna } from "./runa.js";

// Node.js compatible base64 implementation
const encodeBase64 = (str: string): string => {
  if (typeof Buffer !== "undefined") {
    // Node.js environment
    return Buffer.from(str, "utf8").toString("base64");
  }

  if (typeof btoa !== "undefined") {
    // Browser environment
    try {
      return btoa(str);
    } catch (error) {
      // Handle Unicode characters that btoa can't handle
      return btoa(
        encodeURIComponent(str).replace(/%([0-9A-F]{2})/g, (_, p1) => {
          return String.fromCharCode(Number.parseInt(p1, 16));
        }),
      );
    }
  } else {
    throw new Error("No base64 encoding method available");
  }
};

const isValidBase64 = (str: string): boolean => {
  // Base64 validation regex
  const base64Regex = /^[A-Za-z0-9+/]*={0,2}$/;
  return base64Regex.test(str) && str.length % 4 === 0;
};

const decodeBase64 = (b64: string): string => {
  if (typeof Buffer !== "undefined") {
    // Node.js environment
    try {
      // Validate base64 string first
      if (!isValidBase64(b64)) {
        throw new Error("Invalid base64 string format");
      }
      return Buffer.from(b64, "base64").toString("utf8");
    } catch (error) {
      throw new Error(
        `Invalid base64 string: ${error instanceof Error ? error.message : error}`,
      );
    }
  } else if (typeof atob !== "undefined") {
    // Browser environment
    try {
      return atob(b64);
    } catch (error) {
      throw new Error(
        `Invalid base64 string: ${error instanceof Error ? error.message : error}`,
      );
    }
  } else {
    throw new Error("No base64 decoding method available");
  }
};

/**
 * Creates a bidirectional Base64 transformation for strings.
 *
 * This utility converts between plain text and Base64 encoding with full cross-platform
 * compatibility. It works in both Node.js and browser environments, handling Unicode
 * characters correctly and providing comprehensive error handling for invalid inputs.
 *
 * The transformation uses Buffer.from() in Node.js for optimal performance and
 * falls back to btoa()/atob() in browsers with proper Unicode handling.
 *
 * @returns A RunaSync<string, string> instance that provides bidirectional Base64 encoding/decoding
 *
 * @example
 * const base64 = runaBase64();
 *
 * // Encode plain text to Base64
 * const encoded = base64.encode("Hello, 世界!"); // "SGVsbG8sIOS4lueVjCE="
 *
 * // Decode Base64 back to plain text
 * const decoded = base64.decode("SGVsbG8sIOS4lueVjCE="); // "Hello, 世界!"
 *
 * // Handle invalid Base64 strings gracefully
 * try {
 *   base64.decode("invalid-base64!");
 * } catch (error) {
 *   console.log(error.message); // "Base64 decoding failed: Invalid base64 string format"
 * }
 */
export const runaBase64 = () => {
  return createRuna(
    (str: string) => {
      if (str === null || str === undefined) {
        throw new Error("Input cannot be null or undefined");
      }
      if (typeof str !== "string") {
        throw new Error(`Expected string, got ${typeof str}`);
      }
      try {
        return encodeBase64(str);
      } catch (error) {
        throw new Error(
          `Base64 encoding failed: ${error instanceof Error ? error.message : error}`,
        );
      }
    },
    (b64: string) => {
      if (b64 === null || b64 === undefined) {
        throw new Error("Input cannot be null or undefined");
      }
      if (typeof b64 !== "string") {
        throw new Error(`Expected string, got ${typeof b64}`);
      }
      try {
        return decodeBase64(b64);
      } catch (error) {
        throw new Error(
          `Base64 decoding failed: ${error instanceof Error ? error.message : error}`,
        );
      }
    },
  );
};
