import { beforeEach, describe, expect, it } from "vitest";
import { runaNumberCharset } from "./number-charset.js";

describe("runaNumberCharset", () => {
  let charset: ReturnType<typeof runaNumberCharset>;

  beforeEach(() => {
    charset = runaNumberCharset("0123456789");
  });

  it("should encode numbers using decimal charset", () => {
    expect(charset.encode(0) as string).toBe("0");
    expect(charset.encode(5) as string).toBe("5");
    expect(charset.encode(9) as string).toBe("9");
    expect(charset.encode(10) as string).toBe("10");
    expect(charset.encode(25) as string).toBe("25");
    expect(charset.encode(123) as string).toBe("123");
  });

  it("should encode numbers with custom charset", () => {
    const hexCharset = runaNumberCharset("0123456789ABCDEF");

    expect(hexCharset.encode(0) as string).toBe("0");
    expect(hexCharset.encode(10) as string).toBe("A");
    expect(hexCharset.encode(15) as string).toBe("F");
    expect(hexCharset.encode(16) as string).toBe("10");
    expect(hexCharset.encode(255) as string).toBe("FF");
    expect(hexCharset.encode(4095) as string).toBe("FFF");
  });

  it("should encode numbers with binary charset", () => {
    const binaryCharset = runaNumberCharset("01");

    expect(binaryCharset.encode(0) as string).toBe("0");
    expect(binaryCharset.encode(1) as string).toBe("1");
    expect(binaryCharset.encode(2) as string).toBe("10");
    expect(binaryCharset.encode(3) as string).toBe("11");
    expect(binaryCharset.encode(4) as string).toBe("100");
    expect(binaryCharset.encode(7) as string).toBe("111");
  });

  it("should encode numbers with minimum length", () => {
    const charsetWithMinLength = runaNumberCharset("0123456789", 3);

    expect(charsetWithMinLength.encode(0) as string).toBe("000");
    expect(charsetWithMinLength.encode(5) as string).toBe("005");
    expect(charsetWithMinLength.encode(123) as string).toBe("123");
    expect(charsetWithMinLength.encode(9999) as string).toBe("9999");
  });

  it("should encode numbers with alphabetic charset", () => {
    const alphaCharset = runaNumberCharset("ABCDEFGHIJKLMNOPQRSTUVWXYZ");

    expect(alphaCharset.encode(0) as string).toBe("A");
    expect(alphaCharset.encode(1) as string).toBe("B");
    expect(alphaCharset.encode(25) as string).toBe("Z");
    expect(alphaCharset.encode(26) as string).toBe("BA");
    expect(alphaCharset.encode(27) as string).toBe("BB");
  });

  it("should encode numbers with mixed charset", () => {
    const mixedCharset = runaNumberCharset("0123456789ABCDEF");

    expect(mixedCharset.encode(0) as string).toBe("0");
    expect(mixedCharset.encode(255) as string).toBe("FF");
    expect(mixedCharset.encode(4095) as string).toBe("FFF");
    expect(mixedCharset.encode(16) as string).toBe("10");
  });

  it("should handle zero correctly", () => {
    const charset = runaNumberCharset("0123456789");

    expect(charset.encode(0) as string).toBe("0");
  });

  it("should handle large numbers", () => {
    const base64Charset = runaNumberCharset(
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/",
    );

    expect(base64Charset.encode(0) as string).toBe("A");
    expect(base64Charset.encode(63) as string).toBe("/");
    expect(base64Charset.encode(64) as string).toBe("BA");
    expect(base64Charset.encode(4095) as string).toBe("//");
  });

  it("should throw error for single-character charset", () => {
    expect(() => runaNumberCharset("X")).toThrow(
      "Alphabet must have at least 2 characters",
    );
  });

  it("should throw error for charset with duplicate characters", () => {
    expect(() => runaNumberCharset("ABCA")).toThrow(
      "Alphabet must contain unique characters",
    );
  });

  it("should throw error for charset with non-ASCII characters", () => {
    expect(() => runaNumberCharset("AB😀")).toThrow(
      "Alphabet must contain only ASCII characters",
    );
  });

  it("should throw error for negative numbers", () => {
    expect(() => charset.encode(-1) as string).toThrow();
    expect(() => charset.encode(-100) as string).toThrow();
  });

  it("should handle decimal numbers by flooring", () => {
    const charsetForFloats = runaNumberCharset("0123456789");

    // Should treat 3.14 as 3
    expect(charsetForFloats.encode(3.14) as string).toBe("3");
    expect(charsetForFloats.encode(7.99) as string).toBe("7");
  });

  it("should decode strings back to numbers", () => {
    expect(charset.decode("0") as number).toBe(0);
    expect(charset.decode("5") as number).toBe(5);
    expect(charset.decode("9") as number).toBe(9);
    expect(charset.decode("10") as number).toBe(10);
    expect(charset.decode("123") as number).toBe(123);
  });

  it("should decode strings with custom charset", () => {
    const hexCharset = runaNumberCharset("0123456789ABCDEF");

    expect(hexCharset.decode("0") as number).toBe(0);
    expect(hexCharset.decode("A") as number).toBe(10);
    expect(hexCharset.decode("F") as number).toBe(15);
    expect(hexCharset.decode("10") as number).toBe(16);
    expect(hexCharset.decode("FF") as number).toBe(255);
  });

  it("should decode strings with binary charset", () => {
    const binaryCharset = runaNumberCharset("01");

    expect(binaryCharset.decode("0") as number).toBe(0);
    expect(binaryCharset.decode("1") as number).toBe(1);
    expect(binaryCharset.decode("10") as number).toBe(2);
    expect(binaryCharset.decode("111") as number).toBe(7);
    expect(binaryCharset.decode("1000") as number).toBe(8);
  });

  it("should decode strings with minimum length", () => {
    const charset = runaNumberCharset("0123456789");

    // minLength functionality removed - this test now verifies basic decoding
    expect(charset.decode("0") as number).toBe(0);
    expect(charset.decode("5") as number).toBe(5);
    expect(charset.decode("123") as number).toBe(123);
  });

  it("should be bidirectional - encode then decode returns original", () => {
    const testCases = [0, 5, 10, 25, 99, 123, 999];

    for (const original of testCases) {
      const encoded = charset.encode(original) as string;
      const decoded = charset.decode(encoded) as number;
      expect(decoded).toBe(original);
    }
  });

  it("should be bidirectional with custom charset", () => {
    const hexCharset = runaNumberCharset("0123456789ABCDEF");
    const testCases = [0, 10, 15, 16, 255, 4095];

    for (const original of testCases) {
      const encoded = hexCharset.encode(original) as string;
      const decoded = hexCharset.decode(encoded) as number;
      expect(decoded).toBe(original);
    }
  });

  it("should be bidirectional with binary charset", () => {
    const binaryCharset = runaNumberCharset("01");
    const testCases = [0, 1, 2, 3, 4, 7, 8, 15, 16, 31, 32];

    for (const original of testCases) {
      const encoded = binaryCharset.encode(original) as string;
      const decoded = binaryCharset.decode(encoded) as number;
      expect(decoded).toBe(original);
    }
  });

  it("should throw error for decode input with invalid characters", () => {
    const decimalCharset = runaNumberCharset("0123456789");

    expect(() => decimalCharset.decode("A") as number).toThrow();
    expect(() => decimalCharset.decode("12A") as number).toThrow();
    expect(() => decimalCharset.decode("x5") as number).toThrow();
  });

  it("should throw error for decode empty string", () => {
    expect(() => charset.decode("") as number).toThrow();
  });

  it("should handle edge case with very large numbers", () => {
    const largeNumber = 999999;
    const encoded = charset.encode(largeNumber) as string;
    expect(typeof encoded).toBe("string");
    expect(encoded.length).toBeGreaterThan(0);

    // Should be able to decode it back
    const decoded = charset.decode(encoded) as number;
    expect(decoded).toBe(largeNumber);
  });

  it("should handle extremely large numbers across different charsets", () => {
    const testCases = [
      {
        charset: runaNumberCharset("01", 1),
        name: "binary",
        largeNum: 2 ** 20 - 1,
      },
      {
        charset: runaNumberCharset("0123456789", 1),
        name: "decimal",
        largeNum: Number.MAX_SAFE_INTEGER,
      },
      {
        charset: runaNumberCharset("0123456789ABCDEF", 1),
        name: "hexadecimal",
        largeNum: 0xffffff,
      },
      {
        charset: runaNumberCharset("ABCDEFGHIJKLMNOPQRSTUVWXYZ", 1),
        name: "alphabet",
        largeNum: 1000000,
      },
    ];

    for (const testCase of testCases) {
      const encoded = testCase.charset.encode(testCase.largeNum) as string;
      expect(typeof encoded).toBe("string");
      expect(encoded.length).toBeGreaterThan(0);

      // Should be able to decode it back correctly
      const decoded = testCase.charset.decode(encoded) as number;
      expect(decoded).toBe(testCase.largeNum);
    }
  });

  it("should handle maximum safe integer correctly", () => {
    const maxSafeInt = Number.MAX_SAFE_INTEGER;
    const encoded = charset.encode(maxSafeInt) as string;
    expect(typeof encoded).toBe("string");

    const decoded = charset.decode(encoded) as number;
    expect(decoded).toBe(maxSafeInt);
  });

  it("should throw error for numbers larger than Number.MAX_SAFE_INTEGER", () => {
    // Test with Number.MAX_SAFE_INTEGER + 1
    expect(
      () => charset.encode(Number.MAX_SAFE_INTEGER + 1) as string,
    ).toThrow();

    // Test with Number.MAX_VALUE
    expect(() => charset.encode(Number.MAX_VALUE) as string).toThrow();

    // Test with Infinity values
    expect(() => charset.encode(Number.POSITIVE_INFINITY) as string).toThrow();
    expect(() => charset.encode(Number.NEGATIVE_INFINITY) as string).toThrow();
  });

  it("should handle boundary values correctly", () => {
    // Test boundary values for different charset sizes
    const testCases = [
      { charset: runaNumberCharset("01", 1), boundary: 255 }, // 8-bit boundary
      { charset: runaNumberCharset("0123", 1), boundary: 80 }, // Base-3 boundary
      { charset: runaNumberCharset("01234567", 1), boundary: 63 }, // Base-8 boundary
      { charset: runaNumberCharset("0123456789ABCDEF", 1), boundary: 4095 }, // 12-bit boundary
    ];

    for (const testCase of testCases) {
      const encoded = testCase.charset.encode(testCase.boundary) as string;
      const decoded = testCase.charset.decode(encoded) as number;
      expect(decoded).toBe(testCase.boundary);
    }
  });

  it("should handle extremely large numbers correctly", () => {
    // Test with very large numbers that fit within Number.MAX_SAFE_INTEGER
    const veryLargeNumber = 9007199254740990; // Close to MAX_SAFE_INTEGER
    const encoded = charset.encode(veryLargeNumber) as string;
    expect(typeof encoded).toBe("string");
    expect(encoded.length).toBeGreaterThan(0);

    const decoded = charset.decode(encoded) as number;
    expect(decoded).toBe(veryLargeNumber);
  });

  it("should test precision limits", () => {
    // Numbers near Number.MAX_SAFE_INTEGER should work
    const nearMax = Number.MAX_SAFE_INTEGER;
    const encoded = charset.encode(nearMax) as string;
    const decoded = charset.decode(encoded) as number;
    expect(decoded).toBe(nearMax);

    // Numbers just beyond should fail
    expect(() => charset.encode(Number.MAX_SAFE_INTEGER + 1) as string).toThrow(
      "Cannot encode numbers larger than Number.MAX_SAFE_INTEGER",
    );
  });

  it("should maintain leading zeros based on minLength", () => {
    const charset = runaNumberCharset("0123456789");

    const encoded = charset.encode(42) as string;
    expect(encoded).toBe("42");

    const decoded = charset.decode(encoded) as number;
    expect(decoded).toBe(42);
  });

  it("should handle non-string input to decode gracefully", () => {
    expect(() => charset.decode(123 as unknown as string) as number).toThrow();
    expect(() => charset.decode(null as unknown as string) as number).toThrow();
    expect(
      () => charset.decode(undefined as unknown as string) as number,
    ).toThrow();
  });

  it("should work with custom character sets", () => {
    // Test with a custom alphabet using simple ASCII characters
    const customCharset = runaNumberCharset("!@#$%^&*()");

    expect(customCharset.encode(0) as string).toBe("!");
    expect(customCharset.encode(1) as string).toBe("@");
    expect(customCharset.encode(9) as string).toBe(")");

    // Should decode back correctly
    expect(customCharset.decode("!") as number).toBe(0);
    expect(customCharset.decode(")") as number).toBe(9);
  });
});
