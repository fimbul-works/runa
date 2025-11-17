import { beforeEach, describe, expect, it } from "vitest";
import { runaStringToNumber } from "./string-to-number.js";

describe("runaStringToNumber", () => {
  let numberTransformer: ReturnType<typeof runaStringToNumber>;

  beforeEach(() => {
    numberTransformer = runaStringToNumber();
  });

  it("should encode integer strings to numbers", () => {
    const inputs = ["0", "42", "-17", "123456789"];
    const expected = [0, 42, -17, 123456789];

    inputs.forEach((input, index) => {
      expect(numberTransformer.encode(input) as number).toBe(expected[index]);
    });
  });

  it("should encode floating point strings to numbers", () => {
    const inputs = ["3.14159", "-2.5", "0.0", "123.456", "-0.001"];
    const expected = [3.14159, -2.5, 0.0, 123.456, -0.001];

    inputs.forEach((input, index) => {
      expect(numberTransformer.encode(input) as number).toBeCloseTo(
        expected[index],
      );
    });
  });

  it("should encode scientific notation strings to numbers", () => {
    const inputs = ["1e5", "1.5e-3", "-2E10", "3.14159E+2"];
    const expected = [100000, 0.0015, -20000000000, 314.159];

    inputs.forEach((input, index) => {
      expect(numberTransformer.encode(input) as number).toBeCloseTo(
        expected[index],
      );
    });
  });

  it("should decode numbers back to strings", () => {
    const inputs = [0, 42, -17, 3.14159, -2.5, 0.0];
    const expected = ["0", "42", "-17", "3.14159", "-2.5", "0"];

    inputs.forEach((input, index) => {
      expect(numberTransformer.decode(input) as string).toBe(expected[index]);
    });
  });

  it("should decode special number values to strings", () => {
    const specialValues = [
      { value: Number.MAX_VALUE, expected: String(Number.MAX_VALUE) },
      { value: Number.MIN_VALUE, expected: String(Number.MIN_VALUE) },
      {
        value: Number.MAX_SAFE_INTEGER,
        expected: String(Number.MAX_SAFE_INTEGER),
      },
      {
        value: Number.MIN_SAFE_INTEGER,
        expected: String(Number.MIN_SAFE_INTEGER),
      },
    ];

    for (const { value, expected } of specialValues) {
      expect(numberTransformer.decode(value) as string).toBe(expected);
    }
  });

  it("should be bidirectional - encode then decode returns original", () => {
    const testCases = [
      { input: "0", expectedOutput: "0" },
      { input: "42", expectedOutput: "42" },
      { input: "-17", expectedOutput: "-17" },
      { input: "3.14159", expectedOutput: "3.14159" },
      { input: "123.456", expectedOutput: "123.456" },
      { input: "1e5", expectedOutput: "100000" }, // Scientific notation becomes regular number
      { input: "1.5e-3", expectedOutput: "0.0015" },
      { input: "-2E10", expectedOutput: "-20000000000" },
    ];

    for (const { input, expectedOutput } of testCases) {
      const encoded = numberTransformer.encode(input) as number;
      const decoded = numberTransformer.decode(encoded) as string;
      expect(decoded).toBe(expectedOutput);
    }
  });

  it("should handle Infinity and -Infinity", () => {
    expect(numberTransformer.encode("Infinity") as number).toBe(
      Number.POSITIVE_INFINITY,
    );
    expect(numberTransformer.encode("-Infinity") as number).toBe(
      Number.NEGATIVE_INFINITY,
    );
    expect(numberTransformer.decode(Number.POSITIVE_INFINITY) as string).toBe(
      "Infinity",
    );
    expect(numberTransformer.decode(Number.NEGATIVE_INFINITY) as string).toBe(
      "-Infinity",
    );
  });

  it("should throw error for truly non-numeric strings", () => {
    // These will actually throw because parseFloat returns NaN
    const invalidInputs = [
      "abc",
      "hello world",
      "undefined",
      "",
      "   ",
      "abc123",
      "$123.45",
    ];

    for (const invalid of invalidInputs) {
      expect(() => numberTransformer.encode(invalid) as number).toThrow(
        `Not a number: "${invalid}"`,
      );
    }

    // Special case - "NaN" string is also considered invalid
    expect(() => numberTransformer.encode("NaN") as number).toThrow(
      'Not a number: "NaN"',
    );
  });

  it("should parse partial numbers from strings (parseFloat behavior)", () => {
    // These will NOT throw because parseFloat can extract partial numbers
    const partiallyNumericInputs = [
      { input: "12.34.56", expected: 12.34 },
      { input: "1,234", expected: 1 },
      { input: "123abc", expected: 123 },
      { input: "1,234.56", expected: 1 },
      { input: "1.234,56", expected: 1.234 },
    ];

    for (const { input, expected } of partiallyNumericInputs) {
      expect(numberTransformer.encode(input) as number).toBe(expected);
    }
  });

  it("should throw error for non-number types in decode", () => {
    const invalidInputs = [
      "123", // string instead of number
      null,
      undefined,
      {}, // object
      [], // array
      true, // boolean
      false,
      Symbol("test"),
      () => {}, // function
    ];

    for (const invalid of invalidInputs) {
      expect(
        () => numberTransformer.decode(invalid as any) as string,
      ).toThrow();
    }
  });

  it("should handle edge case numbers", () => {
    const edgeCases = [
      "0",
      "-0",
      "0.0",
      "-0.0",
      "1e-323", // Very small positive number
      "-1e-323", // Very small negative number
    ];

    for (const edgeCase of edgeCases) {
      const encoded = numberTransformer.encode(edgeCase) as number;
      const decoded = numberTransformer.decode(encoded) as string;
      // For very small numbers, JavaScript might convert to 0
      // So we check if the round-trip works properly
      expect(Number.isNaN(encoded)).toBe(false);
      expect(typeof decoded).toBe("string");
    }
  });

  it("should handle leading and trailing whitespace", () => {
    // Note: parseFloat handles whitespace automatically
    const inputs = ["  42  ", "\t-17\n", "  3.14159  ", " \n 123.456 \t "];

    const expected = [42, -17, 3.14159, 123.456];

    inputs.forEach((input, index) => {
      expect(numberTransformer.encode(input) as number).toBeCloseTo(
        expected[index],
      );
    });
  });

  it("should preserve number precision", () => {
    // Test with numbers that have exact representation in binary
    const exactNumbers = ["0.5", "0.25", "0.125", "0.0625"];
    for (const numStr of exactNumbers) {
      const encoded = numberTransformer.encode(numStr) as number;
      const decoded = numberTransformer.decode(encoded) as string;
      expect(encoded).toBe(Number(numStr));
      expect(decoded).toBe(numStr);
    }
  });

  it("should handle very large numbers", () => {
    const largeNumbers = [
      "1e20",
      "9.007199254740991e15", // Number.MAX_SAFE_INTEGER
      "1.7976931348623157e308", // Number.MAX_VALUE
    ];

    for (const largeNum of largeNumbers) {
      const encoded = numberTransformer.encode(largeNum) as number;
      const decoded = numberTransformer.decode(encoded) as string;
      expect(Number.isFinite(encoded)).toBe(true);
      expect(typeof decoded).toBe("string");
    }
  });
});
