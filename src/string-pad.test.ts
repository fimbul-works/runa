import { beforeEach, describe, expect, it } from "vitest";
import { runaStringPadStart, runaStringPadEnd } from "./string-pad.js";

describe("runaStringPadStart", () => {
  let padStart: ReturnType<typeof runaStringPadStart>;

  describe("with zero padding", () => {
    beforeEach(() => {
      padStart = runaStringPadStart(5, "0");
    });

    it("should encode strings by padding with zeros at the start", () => {
      const testCases = [
        { input: "42", expected: "00042" },
        { input: "123", expected: "00123" },
        { input: "1", expected: "00001" },
        { input: "", expected: "00000" },
        { input: "12345", expected: "12345" }, // Already at max length
        { input: "123456", expected: "123456" }, // Longer than max length
      ];

      for (const { input, expected } of testCases) {
        expect(padStart.encode(input) as string).toBe(expected);
      }
    });

    it("should decode strings by removing zero padding from the start", () => {
      const testCases = [
        { input: "00042", expected: "42" },
        { input: "00123", expected: "123" },
        { input: "00001", expected: "1" },
        { input: "12345", expected: "12345" }, // No padding to remove
        { input: "00000", expected: "" }, // All padding, removed completely
      ];

      for (const { input, expected } of testCases) {
        expect(padStart.decode(input) as string).toBe(expected);
      }
    });

    it("should be perfectly bidirectional", () => {
      const testValues = ["", "1", "42", "123", "1234", "12345"];

      for (const originalValue of testValues) {
        const encoded = padStart.encode(originalValue) as string;
        const decoded = padStart.decode(encoded) as string;
        expect(decoded).toBe(originalValue);
      }
    });

    it("should handle strings that already contain fill characters", () => {
      const spacePad = runaStringPadStart(10, " ");

      const message = "  hello"; // Already starts with spaces
      const padded = spacePad.encode(message) as string;
      expect(padded).toBe("     hello"); // Pad to 10 chars: 5 spaces + "  hello"

      const original = spacePad.decode(padded) as string;
      expect(original).toBe("hello"); // All leading spaces removed during decoding
    });

    it("should throw error for non-string inputs during encoding", () => {
      const invalidInputs = [
        123,
        null,
        undefined,
        {},
        [],
        true,
        false,
        Symbol("test"),
        () => {},
      ];

      for (const input of invalidInputs) {
        expect(() => padStart.encode(input as any)).toThrow(
          `Invalid string: ${JSON.stringify(input)}`,
        );
      }
    });

    it("should throw error for non-string inputs during decoding", () => {
      const invalidInputs = [
        123,
        null,
        undefined,
        {},
        [],
        true,
        false,
        Symbol("test"),
        () => {},
      ];

      for (const input of invalidInputs) {
        expect(() => padStart.decode(input as any)).toThrow(
          `Invalid string: ${JSON.stringify(input)}`,
        );
      }
    });
  });

  describe("with multi-character padding", () => {
    beforeEach(() => {
      padStart = runaStringPadStart(12, "..");
    });

    it("should handle multi-character fill strings", () => {
      const testCases = [
        { input: "data", expected: "........data" },
        { input: "test", expected: "........test" },
        { input: "123", expected: ".........123" },
        { input: "123456789012", expected: "123456789012" }, // Already at max length
      ];

      for (const { input, expected } of testCases) {
        expect(padStart.encode(input) as string).toBe(expected);
      }
    });

    it("should decode correctly with multi-character fill strings", () => {
      const testCases = [
        { input: "........data", expected: "data" },
        { input: "........test", expected: "test" },
        { input: ".........123", expected: "123" },
      ];

      for (const { input, expected } of testCases) {
        expect(padStart.decode(input) as string).toBe(expected);
      }
    });

    it("should be perfectly bidirectional with multi-character padding", () => {
      const testValues = ["", "a", "test", "data", "12345"];

      for (const originalValue of testValues) {
        const encoded = padStart.encode(originalValue) as string;
        const decoded = padStart.decode(encoded) as string;
        expect(decoded).toBe(originalValue);
      }
    });
  });

  describe("parameter validation", () => {
    it("should throw error for invalid maxLength", () => {
      expect(() => runaStringPadStart(0, "0")).toThrow(
        "maxLength must be a positive integer: 0",
      );
      expect(() => runaStringPadStart(-1, "0")).toThrow(
        "maxLength must be a positive integer: -1",
      );
      expect(() => runaStringPadStart(1.5, "0")).toThrow(
        "maxLength must be a positive integer: 1.5",
      );
    });

    it("should throw error for invalid fillString", () => {
      expect(() => runaStringPadStart(5, "")).toThrow(
        'fillString must be a non-empty string: ""',
      );
      expect(() => runaStringPadStart(5, null as any)).toThrow();
      expect(() => runaStringPadStart(5, undefined as any)).toThrow();
    });
  });

  describe("practical usage examples", () => {
    it("should work for ID formatting", () => {
      const idFormatter = runaStringPadStart(8, "X");

      const shortId = "123";
      const formattedId = idFormatter.encode(shortId) as string;
      expect(formattedId).toBe("XXXXX123");

      const restoredId = idFormatter.decode(formattedId) as string;
      expect(restoredId).toBe("123");
    });

    it("should work for number formatting", () => {
      const numberPad = runaStringPadStart(6, "0");

      const number = "42";
      const padded = numberPad.encode(number) as string;
      expect(padded).toBe("000042");

      const original = numberPad.decode(padded) as string;
      expect(original).toBe("42");
    });

    it("should work for binary number formatting", () => {
      const binaryPad = runaStringPadStart(8, "0");

      const binary = "1011";
      const padded = binaryPad.encode(binary) as string;
      expect(padded).toBe("00001011");

      const original = binaryPad.decode(padded) as string;
      expect(original).toBe("1011");
    });
  });

  describe("edge cases", () => {
    it("should handle empty string correctly", () => {
      const padEmpty = runaStringPadStart(5, "*");

      const padded = padEmpty.encode("") as string;
      expect(padded).toBe("*****");

      const original = padEmpty.decode(padded) as string;
      expect(original).toBe("");
    });

    it("should handle string longer than maxLength", () => {
      const shortPad = runaStringPadStart(3, "0");

      const longString = "12345";
      const padded = shortPad.encode(longString) as string;
      expect(padded).toBe("12345"); // Unchanged

      const original = shortPad.decode(padded) as string;
      expect(original).toBe("12345");
    });

    it("should handle string exactly at maxLength", () => {
      const exactPad = runaStringPadStart(5, "0");

      const exactString = "12345";
      const padded = exactPad.encode(exactString) as string;
      expect(padded).toBe("12345"); // Unchanged

      const original = exactPad.decode(padded) as string;
      expect(original).toBe("12345");
    });
  });

  describe("special characters", () => {
    it("should handle special fill characters", () => {
      const specialPad = runaStringPadStart(10, "#");

      const text = "test";
      const padded = specialPad.encode(text) as string;
      expect(padded).toBe("######test");

      const original = specialPad.decode(padded) as string;
      expect(original).toBe("test");
    });

    it("should handle space padding", () => {
      const spacePad = runaStringPadStart(15, " ");

      const name = "Alice";
      const padded = spacePad.encode(name) as string;
      expect(padded).toBe("          Alice"); // 10 spaces + "Alice" = 15 chars total

      const original = spacePad.decode(padded) as string;
      expect(original).toBe("Alice");
    });
  });
});

describe("runaStringPadEnd", () => {
  let padEnd: ReturnType<typeof runaStringPadEnd>;

  describe("with space padding", () => {
    beforeEach(() => {
      padEnd = runaStringPadEnd(10, " ");
    });

    it("should encode strings by padding with spaces at the end", () => {
      const testCases = [
        { input: "hello", expected: "hello     " },
        { input: "test", expected: "test      " },
        { input: "a", expected: "a         " },
        { input: "", expected: "          " },
        { input: "1234567890", expected: "1234567890" }, // Already at max length
        { input: "12345678901", expected: "12345678901" }, // Longer than max length
      ];

      for (const { input, expected } of testCases) {
        expect(padEnd.encode(input) as string).toBe(expected);
      }
    });

    it("should decode strings by removing spaces from the end", () => {
      const testCases = [
        { input: "hello     ", expected: "hello" },
        { input: "test      ", expected: "test" },
        { input: "a         ", expected: "a" },
        { input: "1234567890", expected: "1234567890" }, // No padding to remove
        { input: "          ", expected: "" }, // All padding, removed completely
      ];

      for (const { input, expected } of testCases) {
        expect(padEnd.decode(input) as string).toBe(expected);
      }
    });

    it("should be perfectly bidirectional", () => {
      const testValues = ["", "a", "hello", "test", "12345", "1234567890"];

      for (const originalValue of testValues) {
        const encoded = padEnd.encode(originalValue) as string;
        const decoded = padEnd.decode(encoded) as string;
        expect(decoded).toBe(originalValue);
      }
    });

    it("should handle strings that already contain fill characters", () => {
      const spacePad = runaStringPadEnd(12, " ");

      const message = "hello   "; // Already ends with spaces (8 chars)
      const padded = spacePad.encode(message) as string;
      expect(padded).toBe("hello       "); // Pad to 12 chars: "hello" + 7 spaces

      const original = spacePad.decode(padded) as string;
      expect(original).toBe("hello"); // All trailing spaces removed during decoding
    });

    it("should throw error for non-string inputs", () => {
      const invalidInputs = [
        123,
        null,
        undefined,
        {},
        [],
        true,
        false,
        Symbol("test"),
        () => {},
      ];

      for (const input of invalidInputs) {
        expect(() => padEnd.encode(input as any)).toThrow(
          `Invalid string: ${JSON.stringify(input)}`,
        );
        expect(() => padEnd.decode(input as any)).toThrow(
          `Invalid string: ${JSON.stringify(input)}`,
        );
      }
    });
  });

  describe("with dot padding", () => {
    beforeEach(() => {
      padEnd = runaStringPadEnd(15, ".");
    });

    it("should handle dot padding correctly", () => {
      const testCases = [
        { input: "Status", expected: "Status........." }, // 6 + 9 = 15
        { input: "OK", expected: "OK............." }, // 2 + 13 = 15
        { input: "END", expected: "END............" }, // 3 + 12 = 15
        { input: "Status.........", expected: "Status........." }, // Already at max length
      ];

      for (const { input, expected } of testCases) {
        expect(padEnd.encode(input) as string).toBe(expected);
      }
    });

    it("should decode correctly with dot padding", () => {
      const testCases = [
        { input: "Status.........", expected: "Status" },
        { input: "OK.............", expected: "OK" },
        { input: "END.............", expected: "END" },
      ];

      for (const { input, expected } of testCases) {
        expect(padEnd.decode(input) as string).toBe(expected);
      }
    });

    it("should be perfectly bidirectional with dot padding", () => {
      const testValues = ["", "a", "test", "Status", "OK"];

      for (const originalValue of testValues) {
        const encoded = padEnd.encode(originalValue) as string;
        const decoded = padEnd.decode(encoded) as string;
        expect(decoded).toBe(originalValue);
      }
    });
  });

  describe("with hash padding", () => {
    beforeEach(() => {
      padEnd = runaStringPadEnd(16, "##");
    });

    it("should handle multi-character fill strings", () => {
      const testCases = [
        { input: "END", expected: "END#############" }, // 3 + 13 = 16
        { input: "START", expected: "START###########" }, // 5 + 11 = 16
        { input: "DATA", expected: "DATA############" }, // 4 + 12 = 16
      ];

      for (const { input, expected } of testCases) {
        expect(padEnd.encode(input) as string).toBe(expected);
      }
    });

    it("should decode correctly with multi-character fill strings", () => {
      const testCases = [
        { input: "END##############", expected: "END" },
        { input: "START#############", expected: "START" },
        { input: "DATA#############", expected: "DATA" },
      ];

      for (const { input, expected } of testCases) {
        expect(padEnd.decode(input) as string).toBe(expected);
      }
    });

    it("should be perfectly bidirectional with multi-character padding", () => {
      const testValues = ["", "A", "END", "START", "DATA"];

      for (const originalValue of testValues) {
        const encoded = padEnd.encode(originalValue) as string;
        const decoded = padEnd.decode(encoded) as string;
        expect(decoded).toBe(originalValue);
      }
    });
  });

  describe("parameter validation", () => {
    it("should throw error for invalid maxLength", () => {
      expect(() => runaStringPadEnd(0, " ")).toThrow(
        "maxLength must be a positive integer: 0",
      );
      expect(() => runaStringPadEnd(-1, " ")).toThrow(
        "maxLength must be a positive integer: -1",
      );
      expect(() => runaStringPadEnd(1.5, " ")).toThrow(
        "maxLength must be a positive integer: 1.5",
      );
    });

    it("should throw error for invalid fillString", () => {
      expect(() => runaStringPadEnd(5, "")).toThrow(
        'fillString must be a non-empty string: ""',
      );
      expect(() => runaStringPadEnd(5, null as any)).toThrow();
      expect(() => runaStringPadEnd(5, undefined as any)).toThrow();
    });
  });

  describe("practical usage examples", () => {
    it("should work for right-aligned text", () => {
      const rightAlign = runaStringPadEnd(10, " ");

      const text = "hello";
      const aligned = rightAlign.encode(text) as string;
      expect(aligned).toBe("hello     ");

      const original = rightAlign.decode(aligned) as string;
      expect(original).toBe("hello");
    });

    it("should work for currency formatting", () => {
      const currencyFormat = runaStringPadEnd(12, " ");

      const amount = "$42.50";
      const formatted = currencyFormat.encode(amount) as string;
      expect(formatted).toBe("$42.50      ");

      const original = currencyFormat.decode(formatted) as string;
      expect(original).toBe("$42.50");
    });

    it("should work for data padding for display", () => {
      const dotFill = runaStringPadEnd(20, ".");

      const label = "Status";
      const formatted = dotFill.encode(label) as string;
      expect(formatted).toBe("Status..............");

      const original = dotFill.decode(formatted) as string;
      expect(original).toBe("Status");
    });
  });

  describe("edge cases", () => {
    it("should handle empty string correctly", () => {
      const padEmpty = runaStringPadEnd(5, "*");

      const padded = padEmpty.encode("") as string;
      expect(padded).toBe("*****");

      const original = padEmpty.decode(padded) as string;
      expect(original).toBe("");
    });

    it("should handle string longer than maxLength", () => {
      const shortPad = runaStringPadEnd(3, " ");

      const longString = "12345";
      const padded = shortPad.encode(longString) as string;
      expect(padded).toBe("12345"); // Unchanged

      const original = shortPad.decode(padded) as string;
      expect(original).toBe("12345");
    });

    it("should handle string exactly at maxLength", () => {
      const exactPad = runaStringPadEnd(5, " ");

      const exactString = "hello";
      const padded = exactPad.encode(exactString) as string;
      expect(padded).toBe("hello"); // Unchanged

      const original = exactPad.decode(padded) as string;
      expect(original).toBe("hello");
    });
  });

  describe("special characters and unicode", () => {
    it("should handle unicode fill characters", () => {
      const unicodePad = runaStringPadEnd(10, "★");

      const text = "test";
      const padded = unicodePad.encode(text) as string;
      expect(padded).toBe("test★★★★★★");

      const original = unicodePad.decode(padded) as string;
      expect(original).toBe("test");
    });

    it("should handle emoji padding", () => {
      const emojiPad = runaStringPadEnd(6, "😊");

      const text = "hi";
      const padded = emojiPad.encode(text) as string;
      expect(padded).toBe("hi😊😊");

      const original = emojiPad.decode(padded) as string;
      expect(original).toBe("hi");
    });
  });

  describe("mixed padding scenarios", () => {
    it("should handle strings with fill characters in the middle", () => {
      const padStart = runaStringPadStart(10, "0");
      const padEnd = runaStringPadEnd(15, ".");

      const number = "123.45"; // Contains both 0 and . characters
      const startPadded = padStart.encode(number) as string;
      expect(startPadded).toBe("0000123.45");

      const restoredStart = padStart.decode(startPadded) as string;
      expect(restoredStart).toBe("123.45"); // Leading zeros removed

      const endPadded = padEnd.encode(number) as string;
      expect(endPadded).toBe("123.45.........");

      const restoredEnd = padEnd.decode(endPadded) as string;
      expect(restoredEnd).toBe("123.45"); // Trailing dots removed
    });

    it("should handle edge case where original string equals fill string", () => {
      const padStart = runaStringPadStart(5, "test");
      const padEnd = runaStringPadEnd(8, "test");

      const exactMatch = "test";
      const startPadded = padStart.encode(exactMatch) as string;
      expect(startPadded).toBe("ttest"); // Padded to 5 chars

      const endPadded = padEnd.encode(exactMatch) as string;
      expect(endPadded).toBe("testtest"); // Padded to 8 chars

      // Decoding should handle this correctly
      const restoredStart = padStart.decode(startPadded) as string;
      expect(restoredStart).toBe("test"); // All leading 't' characters removed

      const restoredEnd = padEnd.decode(endPadded) as string;
      expect(restoredEnd).toBe(""); // All 'test' characters removed as they match fill pattern
    });
  });
});