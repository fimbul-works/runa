import { createRuna } from "./runa.js";

export const runaNumberCharset = (alphabet: string, minLength = 1) => {
  const base = alphabet.length;
  if (base < 2) {
    throw new Error("Alphabet must have at least 2 characters");
  }
  if (minLength < 1) {
    throw new Error("Minimum length must be at least 1");
  }

  // Check that all characters are ASCII (code point <= 255)
  for (const char of alphabet) {
    if (char.charCodeAt(0) > 255) {
      throw new Error(
        "Alphabet must contain only ASCII characters (code point <= 255)",
      );
    }
  }

  // Check that all characters are unique
  const charset = alphabet.split("");
  const uniqueChars = new Set(charset);
  if (uniqueChars.size !== base) {
    throw new Error("Alphabet must contain unique characters");
  }

  return createRuna(
    (num: number) => {
      if (typeof num !== "number") {
        throw new Error(`Expected number, got ${typeof num}`);
      }
      if (num < 0) {
        throw new Error("Cannot encode negative numbers");
      }
      if (!Number.isFinite(num)) {
        throw new Error("Cannot encode non-finite numbers");
      }
      if (num > Number.MAX_SAFE_INTEGER) {
        throw new Error(
          "Cannot encode numbers larger than Number.MAX_SAFE_INTEGER",
        );
      }

      // Handle decimal numbers by flooring
      num = Math.floor(num);

      // Convert to base-n representation using standard algorithm
      let result = "";
      let quotient = num;

      if (quotient === 0) {
        result = charset[0];
      } else {
        do {
          result = charset[quotient % base] + result;
          quotient = Math.floor(quotient / base);
        } while (quotient > 0);
      }

      // Pad with leading characters to meet minimum length
      while (result.length < minLength) {
        result = charset[0] + result;
      }

      return result;
    },
    (str: string) => {
      if (typeof str !== "string") {
        throw new Error(`Expected string, got ${typeof str}`);
      }
      if (str.length === 0) {
        throw new Error("Cannot decode empty string");
      }

      let result = 0;

      for (let i = 0; i < str.length; i++) {
        const char = str[i];
        const charIndex = charset.indexOf(char);

        if (charIndex === -1) {
          throw new Error(`Invalid character '${char}' not found in alphabet`);
        }

        result = result * base + charIndex;
      }

      return result;
    },
  );
};
