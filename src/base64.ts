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
