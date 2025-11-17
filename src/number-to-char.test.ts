import { beforeEach, describe, expect, it } from "vitest";
import { runaNumberToChar } from "./number-to-char.js";

describe("runaNumberToChar", () => {
  let charTransformer: ReturnType<typeof runaNumberToChar>;

  beforeEach(() => {
    charTransformer = runaNumberToChar();
  });

  describe("encoding (number to character)", () => {
    it("should encode valid ASCII character codes to characters", () => {
      const testCases = [
        { input: 65, expected: "A" }, // Uppercase A
        { input: 97, expected: "a" }, // Lowercase a
        { input: 48, expected: "0" }, // Digit 0
        { input: 32, expected: " " }, // Space
        { input: 33, expected: "!" }, // Exclamation mark
        { input: 1, expected: "\x01" }, // Start of heading (0 is excluded)
        { input: 127, expected: "\x7F" }, // DEL character
        { input: 255, expected: "ÿ" }, // Extended ASCII ÿ
      ];

      for (const { input, expected } of testCases) {
        expect(charTransformer.encode(input) as string).toBe(expected);
      }
    });

    it("should encode lowercase letters", () => {
      const lowerCodes = Array.from({ length: 26 }, (_, i) => i + 97); // 97-122
      const expectedChars = "abcdefghijklmnopqrstuvwxyz".split("");

      lowerCodes.forEach((code, index) => {
        expect(charTransformer.encode(code) as string).toBe(expectedChars[index]);
      });
    });

    it("should encode uppercase letters", () => {
      const upperCodes = Array.from({ length: 26 }, (_, i) => i + 65); // 65-90
      const expectedChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

      upperCodes.forEach((code, index) => {
        expect(charTransformer.encode(code) as string).toBe(expectedChars[index]);
      });
    });

    it("should encode digits", () => {
      const digitCodes = Array.from({ length: 10 }, (_, i) => i + 48); // 48-57
      const expectedChars = "0123456789".split("");

      digitCodes.forEach((code, index) => {
        expect(charTransformer.encode(code) as string).toBe(expectedChars[index]);
      });
    });

    it("should handle extended ASCII characters", () => {
      const extendedCodes = [128, 169, 174, 176, 185, 191, 200, 233, 255];
      const expectedChars = ["\x80", "©", "®", "°", "¹", "¿", "È", "é", "ÿ"];

      extendedCodes.forEach((code, index) => {
        expect(charTransformer.encode(code) as string).toBe(expectedChars[index]);
      });
    });

    it("should throw error for negative character codes", () => {
      const negativeCodes = [-1, -10, -100, -255];

      for (const code of negativeCodes) {
        expect(() => charTransformer.encode(code) as string).toThrow(
          `Character code out of range 0-255: ${code}`,
        );
      }
    });

    it("should throw error for character codes greater than 255", () => {
      const tooLargeCodes = [256, 300, 500, 1000, 65535];

      for (const code of tooLargeCodes) {
        expect(() => charTransformer.encode(code) as string).toThrow(
          `Character code out of range 0-255: ${code}`,
        );
      }
    });

    it("should handle non-integer character codes (String.fromCharCode behavior)", () => {
      // String.fromCharCode actually handles float values by converting them to integers
      const floatTests = [
        { input: 3.14, expectedChar: "\x03" }, // Truncated to 3
        { input: 42.5, expectedChar: "*" }, // Truncated to 42
        { input: 65.9, expectedChar: "A" }, // Truncated to 65
        { input: 128.1, expectedChar: "\x80" }, // Truncated to 128
      ];

      for (const { input, expectedChar } of floatTests) {
        expect(charTransformer.encode(input) as string).toBe(expectedChar);
      }

      // Negative floats throw range errors
      expect(() => charTransformer.encode(-0.5) as string).toThrow(
        "Character code out of range 0-255: -0.5",
      );
    });

    it("should throw error for non-number types", () => {
      const invalidInputs = [
        "65", // string
        null,
        undefined,
        {}, // object
        [], // array
        true, // boolean
        false,
        BigInt(65),
      ];

      for (const input of invalidInputs) {
        expect(() => charTransformer.encode(input as any) as string).toThrow(
          `Invalid character code: ${input}`,
        );
      }

      // Symbol needs special handling since it can't be converted to string
      expect(() => charTransformer.encode(Symbol("test") as any) as string).toThrow();
    });

    it("should handle special number values", () => {
      expect(() => charTransformer.encode(Number.POSITIVE_INFINITY) as string).toThrow(
        "Character code out of range 0-255: Infinity",
      );
      expect(() => charTransformer.encode(Number.NEGATIVE_INFINITY) as string).toThrow(
        "Character code out of range 0-255: -Infinity",
      );

      // NaN is special: it passes range checks (NaN <= 0 is false, NaN > 255 is false)
      // and String.fromCharCode(NaN) returns null character
      expect(charTransformer.encode(Number.NaN) as string).toBe("\x00");
    });
  });

  describe("decoding (character to number)", () => {
    it("should decode valid characters to their ASCII codes", () => {
      const testCases = [
        { input: "A", expected: 65 }, // Uppercase A
        { input: "a", expected: 97 }, // Lowercase a
        { input: "0", expected: 48 }, // Digit 0
        { input: " ", expected: 32 }, // Space
        { input: "!", expected: 33 }, // Exclamation mark
        { input: "\x00", expected: 0 }, // Null character
        { input: "\x7F", expected: 127 }, // DEL character
        { input: "ÿ", expected: 255 }, // Extended ASCII ÿ
      ];

      for (const { input, expected } of testCases) {
        expect(charTransformer.decode(input) as number).toBe(expected);
      }
    });

    it("should decode lowercase letters", () => {
      const lowerChars = "abcdefghijklmnopqrstuvwxyz".split("");
      const expectedCodes = Array.from({ length: 26 }, (_, i) => i + 97); // 97-122

      lowerChars.forEach((char, index) => {
        expect(charTransformer.decode(char) as number).toBe(expectedCodes[index]);
      });
    });

    it("should decode uppercase letters", () => {
      const upperChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
      const expectedCodes = Array.from({ length: 26 }, (_, i) => i + 65); // 65-90

      upperChars.forEach((char, index) => {
        expect(charTransformer.decode(char) as number).toBe(expectedCodes[index]);
      });
    });

    it("should decode digits", () => {
      const digitChars = "0123456789".split("");
      const expectedCodes = Array.from({ length: 10 }, (_, i) => i + 48); // 48-57

      digitChars.forEach((char, index) => {
        expect(charTransformer.decode(char) as number).toBe(expectedCodes[index]);
      });
    });

    it("should decode special characters and symbols", () => {
      const specialChars = [
        " ", "!", "@", "#", "$", "%", "^", "&", "*", "(", ")", "_", "+", "-",
        "=", "[", "]", "{", "}", ";", "'", ":", "\"", ",", ".", "<", ">", "/", "?",
      ];

      for (const char of specialChars) {
        const code = charTransformer.decode(char) as number;
        expect(code).toBeGreaterThanOrEqual(32);
        expect(code).toBeLessThanOrEqual(127);
      }
    });

    it("should throw error for empty string", () => {
      expect(() => charTransformer.decode("") as number).toThrow(
        'Invalid character: ""',
      );
    });

    it("should throw error for strings longer than one character", () => {
      const multiCharInputs = [
        "ab",
        "abc",
        "hello",
        "12",
        "A!",
        "   ", // Three spaces
        "\x00\x01", // Two control characters
      ];

      for (const input of multiCharInputs) {
        expect(() => charTransformer.decode(input) as number).toThrow(
          `Invalid character: ${JSON.stringify(input)}`,
        );
      }
    });

    it("should throw error for non-string types", () => {
      const invalidInputs = [
        null,
        undefined,
        {}, // object
        [], // array
        true, // boolean
        false,
        Symbol("test"),
        () => {}, // function
      ];

      for (const input of invalidInputs) {
        expect(() => charTransformer.decode(input as any) as number).toThrow(
          `Invalid character: ${JSON.stringify(input)}`,
        );
      }

      // Numbers are converted to strings and treated as characters
      expect(() => charTransformer.decode(65 as any) as number).toThrow(
        'Invalid character: 65',
      );

      // BigInt needs special handling due to JSON.stringify issues
      expect(() => charTransformer.decode(BigInt(65) as any) as number).toThrow();
    });
  });

  describe("bidirectional behavior", () => {
    it("should be perfectly bidirectional - encode then decode returns original", () => {
      const testCodes = [1, 32, 48, 65, 97, 128, 200, 255]; // 0 is excluded by implementation

      for (const originalCode of testCodes) {
        const encodedChar = charTransformer.encode(originalCode) as string;
        const decodedCode = charTransformer.decode(encodedChar) as number;
        expect(decodedCode).toBe(originalCode);
      }
    });

    it("should be perfectly bidirectional - decode then encode returns original", () => {
      const testChars = ["\x01", " ", "0", "A", "a", "©", "È", "ÿ"]; // \x00 won't work in bidirectional test

      for (const originalChar of testChars) {
        const decodedCode = charTransformer.decode(originalChar) as number;
        const encodedChar = charTransformer.encode(decodedCode) as string;
        expect(encodedChar).toBe(originalChar);
      }
    });

    it("should handle all ASCII printable characters bidirectionally", () => {
      const printableCodes = Array.from({ length: 95 }, (_, i) => i + 32); // 32-126

      for (const code of printableCodes) {
        const char = charTransformer.encode(code) as string;
        const decodedCode = charTransformer.decode(char) as number;
        expect(decodedCode).toBe(code);
      }
    });

    it("should handle all extended ASCII characters bidirectionally", () => {
      const extendedCodes = Array.from({ length: 128 }, (_, i) => i + 128); // 128-255

      for (const code of extendedCodes) {
        const char = charTransformer.encode(code) as string;
        const decodedCode = charTransformer.decode(char) as number;
        expect(decodedCode).toBe(code);
      }
    });
  });

  describe("edge cases and boundary conditions", () => {
    it("should handle boundary values correctly", () => {
      const boundaryValues = [
        // Note: code 0 is excluded by implementation (charCode <= 0 check)
        { code: 1, char: "\x01", description: "start of heading" },
        { code: 31, char: "\x1F", description: "unit separator" },
        { code: 32, char: " ", description: "space" },
        { code: 126, char: "~", description: "tilde" },
        { code: 127, char: "\x7F", description: "delete" },
        { code: 128, char: "\x80", description: "first extended ASCII" },
        { code: 254, char: "\xFE", description: "penultimate extended ASCII" },
        { code: 255, char: "ÿ", description: "last extended ASCII" },
      ];

      for (const { code, char } of boundaryValues) {
        // Test encoding
        expect(charTransformer.encode(code) as string).toBe(char);

        // Test decoding
        expect(charTransformer.decode(char) as number).toBe(code);

        // Test bidirectional
        const roundTripCode = charTransformer.decode(
          charTransformer.encode(code) as string,
        ) as number;
        expect(roundTripCode).toBe(code);
      }
    });

    it("should handle control characters", () => {
      // Start from 1 since 0 is excluded by implementation
      const controlCodes = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15];

      for (const code of controlCodes) {
        const char = charTransformer.encode(code) as string;
        expect(char.length).toBe(1);

        const decodedCode = charTransformer.decode(char) as number;
        expect(decodedCode).toBe(code);
      }
    });

    it("should properly handle null character special case", () => {
      // Test that we can decode null character but can't encode it
      const nullChar = "\x00";
      const nullCode = charTransformer.decode(nullChar) as number;
      expect(nullCode).toBe(0);

      // But encoding 0 should throw an error
      expect(() => charTransformer.encode(0) as string).toThrow(
        "Character code out of range 0-255: 0",
      );
    });
  });

  describe("error messages", () => {
    it("should provide specific error messages for encoding errors", () => {
      expect(() => charTransformer.encode(-5) as string).toThrow(
        "Character code out of range 0-255: -5",
      );
      expect(() => charTransformer.encode(300) as string).toThrow(
        "Character code out of range 0-255: 300",
      );
      expect(() => charTransformer.encode("65" as any) as string).toThrow(
        "Invalid character code: 65",
      );

      // 3.14 actually gets encoded successfully (String.fromCharCode truncates to int)
      expect(charTransformer.encode(3.14) as string).toBe("\x03");
    });

    it("should provide specific error messages for decoding errors", () => {
      expect(() => charTransformer.decode("") as number).toThrow(
        'Invalid character: ""',
      );
      expect(() => charTransformer.decode("ab") as number).toThrow(
        'Invalid character: "ab"',
      );
      expect(() => charTransformer.decode(65 as any) as number).toThrow(
        'Invalid character: 65',
      );
    });
  });

  describe("practical usage examples", () => {
    it("should convert 'Hello World!' to and from character codes", () => {
      const helloMessage = "Hello World!";
      const charCodes = [];

      // Convert string to character codes
      for (const char of helloMessage) {
        charCodes.push(charTransformer.decode(char) as number);
      }

      // Convert character codes back to string
      const restoredMessage = charCodes
        .map((code) => charTransformer.encode(code) as string)
        .join("");

      expect(restoredMessage).toBe(helloMessage);
      expect(charCodes).toEqual([
        72, 101, 108, 108, 111, 32, 87, 111, 114, 108, 100, 33,
      ]);
    });

    it("should work with byte array data", () => {
      const byteArray = [80, 87, 78]; // "PWN" in ASCII
      const textSignature = byteArray
        .map((code) => charTransformer.encode(code) as string)
        .join("");

      expect(textSignature).toBe("PWN");

      const restoredByteArray = textSignature
        .split("")
        .map((char) => charTransformer.decode(char) as number);

      expect(restoredByteArray).toEqual(byteArray);
    });

    it("should handle character code lookup table", () => {
      const printableCodes = Array.from({ length: 95 }, (_, i) => i + 32); // 32-126

      const charMap = printableCodes.map((code) => ({
        code,
        char: charTransformer.encode(code) as string,
      }));

      // Verify first few and last few entries
      expect(charMap[0]).toEqual({ code: 32, char: " " });
      expect(charMap[1]).toEqual({ code: 33, char: "!" });
      expect(charMap[charMap.length - 1]).toEqual({ code: 126, char: "~" });

      // Verify bidirectional for all entries
      for (const { code, char } of charMap) {
        expect(charTransformer.decode(char) as number).toBe(code);
      }
    });
  });

  describe("performance and memory", () => {
    it("should handle large arrays efficiently", () => {
      // Generate array without 0 to avoid encoding errors
      const largeArray = Array.from({ length: 1000 }, (_, i) => (i % 255) + 1);

      const startTime = Date.now();

      // Encode all characters
      const chars = largeArray.map((code) => charTransformer.encode(code) as string);

      // Decode all characters
      const codes = chars.map((char) => charTransformer.decode(char) as number);

      const endTime = Date.now();

      // Should complete within reasonable time (less than 1 second)
      expect(endTime - startTime).toBeLessThan(1000);
      expect(codes).toEqual(largeArray);
    });
  });
});