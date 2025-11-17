import { beforeEach, describe, expect, it } from "vitest";
import { runaArrayJoin } from "./array-join.js";

describe("runaArrayJoin", () => {
  describe("Default empty separator", () => {
    let arrayJoin: ReturnType<typeof runaArrayJoin>;

    beforeEach(() => {
      arrayJoin = runaArrayJoin();
    });

    describe("Basic functionality", () => {
      it("should join array of numbers without separator", () => {
        const input = [1, 2, 3, 4, 5];
        const expected = "12345";
        const result = arrayJoin.encode(input);
        expect(result).toBe(expected);
      });

      it("should split string into individual digits", () => {
        const input = "12345";
        const expected = [1, 2, 3, 4, 5];
        const result = arrayJoin.decode(input);
        expect(result).toEqual(expected);
      });

      it("should handle single number", () => {
        const input = [7];
        const expected = "7";
        const result = arrayJoin.encode(input);
        expect(result).toBe(expected);
      });

      it("should handle single character", () => {
        const input = "7";
        const expected = [7];
        const result = arrayJoin.decode(input);
        expect(result).toEqual(expected);
      });

      it("should handle empty array", () => {
        const input: number[] = [];
        const expected = "";
        const result = arrayJoin.encode(input);
        expect(result).toBe(expected);
      });

      it("should handle empty string", () => {
        const input = "";
        const expected: number[] = [];
        const result = arrayJoin.decode(input);
        expect(result).toEqual(expected);
      });

      it("should handle multi-digit numbers as separate digits", () => {
        const input = [12, 34, 56];
        const result = arrayJoin.encode(input);
        expect(result).toBe("123456");
      });

      it("should handle negative numbers", () => {
        const input = [-1, -2, -3];
        const result = arrayJoin.encode(input);
        expect(result).toBe("-1-2-3");
      });
    });

    describe("Perfect reversibility limitations", () => {
      it("should demonstrate loss of distinction between [1,2] and [12]", () => {
        const input1 = [1, 2];
        const input2 = [12];

        const result1 = arrayJoin.encode(input1);
        const result2 = arrayJoin.encode(input2);

        expect(result1).toBe(result2); // Both become "12"

        const restored1 = arrayJoin.decode(result1);
        const restored2 = arrayJoin.decode(result2);

        expect(restored1).toEqual(restored2); // Both become [1, 2]
        expect(restored1).not.toEqual(input2); // [12] is lost
      });

      it("should show round-trip behavior for single digits", () => {
        const original = [1, 2, 3, 4, 5];
        const encoded = arrayJoin.encode(original);
        const decoded = arrayJoin.decode(encoded);
        expect(decoded).toEqual(original);
      });

      it("should show limitations with multi-digit numbers", () => {
        const original = [12, 34, 56];
        const encoded = arrayJoin.encode(original);
        const decoded = arrayJoin.decode(encoded);
        expect(decoded).toEqual([1, 2, 3, 4, 5, 6]); // Not equal to original
      });
    });

    describe("Error handling", () => {
      it("should throw on null input for encode", () => {
        expect(() => arrayJoin.encode(null as any)).toThrow("Invalid array");
      });

      it("should throw on undefined input for encode", () => {
        expect(() => arrayJoin.encode(undefined as any)).toThrow(
          "Invalid array",
        );
      });

      it("should throw on non-array input for encode", () => {
        expect(() => arrayJoin.encode("not an array" as any)).toThrow(
          "Invalid array",
        );
        expect(() => arrayJoin.encode(123 as any)).toThrow("Invalid array");
        expect(() => arrayJoin.encode({} as any)).toThrow("Invalid array");
      });

      it("should throw on null input for decode", () => {
        expect(() => arrayJoin.decode(null as any)).toThrow("Invalid string");
      });

      it("should throw on undefined input for decode", () => {
        expect(() => arrayJoin.decode(undefined as any)).toThrow(
          "Invalid string",
        );
      });

      it("should throw on non-string input for decode", () => {
        expect(() => arrayJoin.decode(123 as any)).toThrow("Invalid string");
        expect(() => arrayJoin.decode([] as any)).toThrow("Invalid string");
        expect(() => arrayJoin.decode({} as any)).toThrow("Invalid string");
      });

      it("should throw on non-digit characters", () => {
        expect(() => arrayJoin.decode("12a45")).toThrow(
          'Invalid digit character: "a"',
        );
        expect(() => arrayJoin.decode("12.45")).toThrow(
          'Invalid digit character: "."',
        );
        expect(() => arrayJoin.decode("12-45")).toThrow(
          'Invalid digit character: "-"',
        );
        expect(() => arrayJoin.decode("abc")).toThrow(
          'Invalid digit character: "a"',
        );
      });

      it("should handle decimal points in joined output but not in input", () => {
        const input = [1.5, 2.7];
        const result = arrayJoin.encode(input);
        expect(result).toBe("1.52.7");

        // This will throw when trying to decode because of the decimal point
        expect(() => arrayJoin.decode(result)).toThrow(
          'Invalid digit character: "."',
        );
      });
    });
  });

  describe("Custom separator", () => {
    let arrayJoin: ReturnType<typeof runaArrayJoin>;

    beforeEach(() => {
      arrayJoin = runaArrayJoin(",");
    });

    describe("Basic functionality", () => {
      it("should join array with comma separator", () => {
        const input = [1, 2, 3, 4, 5];
        const expected = "1,2,3,4,5";
        const result = arrayJoin.encode(input);
        expect(result).toBe(expected);
      });

      it("should split comma-separated string into numbers", () => {
        const input = "1,2,3,4,5";
        const expected = [1, 2, 3, 4, 5];
        const result = arrayJoin.decode(input);
        expect(result).toEqual(expected);
      });

      it("should handle decimal numbers with custom separator", () => {
        const input = [1.5, 2.7, 3.14];
        const expected = "1.5,2.7,3.14";
        const result = arrayJoin.encode(input);
        expect(result).toBe(expected);
      });

      it("should parse decimal numbers from custom separator format", () => {
        const input = "1.5,2.7,3.14";
        const expected = [1.5, 2.7, 3.14];
        const result = arrayJoin.decode(input);
        expect(result).toEqual(expected);
      });

      it("should handle empty array", () => {
        const input: number[] = [];
        const expected = "";
        const result = arrayJoin.encode(input);
        expect(result).toBe(expected);
      });

      it("should handle empty string", () => {
        const input = "";
        expect(() => arrayJoin.decode(input)).toThrow("Invalid number part: ");
      });
    });

    describe("Perfect reversibility", () => {
      it("should be perfectly bidirectional with custom separator", () => {
        const original = [1, 2.5, 3, 4.7, 5];
        const encoded = arrayJoin.encode(original);
        const decoded = arrayJoin.decode(encoded);
        expect(decoded).toEqual(original);
      });

      it("should handle negative numbers with custom separator", () => {
        const original = [-1, -2.5, -3];
        const encoded = arrayJoin.encode(original);
        const decoded = arrayJoin.decode(encoded);
        expect(decoded).toEqual(original);
      });

      it("should handle zero values", () => {
        const original = [0, 0.0, -0];
        const encoded = arrayJoin.encode(original);
        const decoded = arrayJoin.decode(encoded);
        // Note: -0 becomes 0 after encoding/decoding due to JavaScript number handling
        expect(decoded).toEqual([0, 0, 0]);
      });
    });

    describe("Different separator types", () => {
      it("should work with pipe separator", () => {
        const pipeJoin = runaArrayJoin("|");
        const original = [1, 2, 3];
        const encoded = pipeJoin.encode(original);
        const decoded = pipeJoin.decode(encoded);
        expect(encoded).toBe("1|2|3");
        expect(decoded).toEqual(original);
      });

      it("should work with space separator", () => {
        const spaceJoin = runaArrayJoin(" ");
        const original = [1, 2, 3];
        const encoded = spaceJoin.encode(original);
        const decoded = spaceJoin.decode(encoded);
        expect(encoded).toBe("1 2 3");
        expect(decoded).toEqual(original);
      });

      it("should work with multi-character separator", () => {
        const multiJoin = runaArrayJoin("||");
        const original = [1, 2, 3];
        const encoded = multiJoin.encode(original);
        const decoded = multiJoin.decode(encoded);
        expect(encoded).toBe("1||2||3");
        expect(decoded).toEqual(original);
      });
    });

    describe("Error handling with custom separator", () => {
      it("should throw on invalid number parts", () => {
        expect(() => arrayJoin.decode("1,2,abc,4")).toThrow(
          'Invalid number part: "abc"',
        );
        expect(() => arrayJoin.decode("1,2,,4")).toThrow(
          "Invalid number part: ",
        );
        expect(() => arrayJoin.decode("1.2.3,4")).not.toThrow(); // Valid float
      });

      it("should handle trailing separators", () => {
        expect(() => arrayJoin.decode("1,2,3,")).toThrow(
          "Invalid number part: ",
        );
      });

      it("should handle leading separators", () => {
        expect(() => arrayJoin.decode(",1,2,3")).toThrow(
          "Invalid number part: ",
        );
      });

      it("should handle consecutive separators", () => {
        expect(() => arrayJoin.decode("1,,2,,3")).toThrow(
          "Invalid number part: ",
        );
      });
    });
  });

  describe("Type conversion inconsistencies", () => {
    it("should document parseInt vs parseFloat inconsistency", () => {
      const emptyJoin = runaArrayJoin();
      const commaJoin = runaArrayJoin(",");

      // Empty separator uses parseInt (integer only)
      expect(() => emptyJoin.decode("12.5")).toThrow(
        'Invalid digit character: "."',
      );

      // Custom separator uses parseFloat (allows decimals)
      const commaResult = commaJoin.decode("12.5");
      expect(commaResult).toEqual([12.5]); // Parses as float
    });

    it("should show different behavior for same input with different separators", () => {
      const emptyJoin = runaArrayJoin();
      const commaJoin = runaArrayJoin(",");

      const testString = "123";

      const emptyResult = emptyJoin.decode(testString);
      const commaResult = commaJoin.decode(testString);

      expect(emptyResult).toEqual([1, 2, 3]); // Individual digits
      expect(commaResult).toEqual([123]); // Single number
    });
  });

  describe("Edge cases and performance", () => {
    it("should handle very large arrays", () => {
      const largeArray = Array.from({ length: 1000 }, (_, i) => i);
      const arrayJoin = runaArrayJoin(",");
      const encoded = arrayJoin.encode(largeArray);
      const decoded = arrayJoin.decode(encoded);
      expect(decoded).toEqual(largeArray);
    });

    it("should handle very large numbers", () => {
      const original = [Number.MAX_SAFE_INTEGER, Number.MIN_SAFE_INTEGER];
      const arrayJoin = runaArrayJoin(",");
      const encoded = arrayJoin.encode(original);
      const decoded = arrayJoin.decode(encoded);
      expect(decoded).toEqual(original);
    });

    it("should handle special floating point values", () => {
      const original = [Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY];
      const arrayJoin = runaArrayJoin(",");
      const encoded = arrayJoin.encode(original);
      const decoded = arrayJoin.decode(encoded);
      expect(decoded).toEqual(original);

      // NaN handling limitation - parseFloat("NaN") returns NaN, but implementation throws on NaN
      expect(() => arrayJoin.decode("Infinity,-Infinity,NaN")).toThrow(
        'Invalid number part: "NaN"',
      );
    });

    it("should handle repeated encode/decode operations", () => {
      const original = [1, 2.5, 3, 4.7, 5];
      const arrayJoin = runaArrayJoin(",");

      let current = original;
      for (let i = 0; i < 100; i++) {
        const encoded = arrayJoin.encode(current);
        current = arrayJoin.decode(encoded);
      }

      expect(current).toEqual(original);
    });
  });
});
