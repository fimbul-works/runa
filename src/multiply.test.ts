import { beforeEach, describe, expect, it } from "vitest";
import { runaAdd } from "./add.js";
import { runaMultiply } from "./multiply.js";
import { serializeValue } from "./util.js";

describe("runaMultiply", () => {
  let multiplyTransformer: ReturnType<typeof runaMultiply>;

  describe("with positive multiplier", () => {
    beforeEach(() => {
      multiplyTransformer = runaMultiply(2);
    });

    it("should encode numbers by multiplying with the multiplier", () => {
      const testCases = [
        { input: 0, expected: 0 },
        { input: 1, expected: 2 },
        { input: 5, expected: 10 },
        { input: -5, expected: -10 },
        { input: 100, expected: 200 },
        { input: -100, expected: -200 },
        { input: 3.5, expected: 7 },
        { input: -3.5, expected: -7 },
      ];

      for (const { input, expected } of testCases) {
        expect(multiplyTransformer.encode(input) as number).toBeCloseTo(
          expected,
        );
      }
    });

    it("should decode numbers by dividing by the multiplier", () => {
      const testCases = [
        { input: 0, expected: 0 },
        { input: 2, expected: 1 },
        { input: 10, expected: 5 },
        { input: -10, expected: -5 },
        { input: 200, expected: 100 },
        { input: -200, expected: -100 },
        { input: 7, expected: 3.5 },
        { input: -7, expected: -3.5 },
      ];

      for (const { input, expected } of testCases) {
        expect(multiplyTransformer.decode(input) as number).toBeCloseTo(
          expected,
        );
      }
    });

    it("should be perfectly bidirectional", () => {
      const testValues = [0, 1, 5, -5, 100, -100, 3.5, -3.5, 42, -42];

      for (const originalValue of testValues) {
        const encoded = multiplyTransformer.encode(originalValue) as number;
        const decoded = multiplyTransformer.decode(encoded) as number;
        expect(decoded).toBeCloseTo(originalValue);
      }
    });

    it("should handle edge cases", () => {
      // Large numbers
      const largeNumber = 1000000;
      const encodedLarge = multiplyTransformer.encode(largeNumber) as number;
      expect(encodedLarge).toBe(2000000);
      expect(multiplyTransformer.decode(encodedLarge) as number).toBe(
        largeNumber,
      );

      // Very small numbers
      const smallNumber = 0.000001;
      const encodedSmall = multiplyTransformer.encode(smallNumber) as number;
      expect(encodedSmall).toBe(0.000002);
      expect(multiplyTransformer.decode(encodedSmall) as number).toBe(
        smallNumber,
      );

      // Infinity
      const encodedInfinity = multiplyTransformer.encode(
        Number.POSITIVE_INFINITY,
      ) as number;
      expect(encodedInfinity).toBe(Number.POSITIVE_INFINITY);
      expect(multiplyTransformer.decode(encodedInfinity) as number).toBe(
        Number.POSITIVE_INFINITY,
      );
    });

    it("should throw error for non-number inputs during encoding", () => {
      const invalidInputs = [
        "not a number",
        null,
        undefined,
        {},
        [],
        true,
        false,
        Symbol("test"),
        () => {},
        BigInt(10),
      ];

      for (const input of invalidInputs) {
        expect(() => multiplyTransformer.encode(input as any)).toThrow(
          `Invalid number: ${serializeValue(input)}`,
        );
      }
    });

    it("should throw error for non-number inputs during decoding", () => {
      const invalidInputs = [
        "not a number",
        null,
        undefined,
        {},
        [],
        true,
        false,
        Symbol("test"),
        () => {},
        BigInt(10),
      ];

      for (const input of invalidInputs) {
        expect(() => multiplyTransformer.decode(input as any)).toThrow(
          `Invalid number: ${serializeValue(input)}`,
        );
      }
    });
  });

  describe("with fractional multiplier", () => {
    beforeEach(() => {
      multiplyTransformer = runaMultiply(0.5);
    });

    it("should handle fractional multipliers correctly", () => {
      const testCases = [
        { input: 10, expected: 5 },
        { input: 5, expected: 2.5 },
        { input: -10, expected: -5 },
        { input: 100, expected: 50 },
      ];

      for (const { input, expected } of testCases) {
        expect(multiplyTransformer.encode(input) as number).toBeCloseTo(
          expected,
        );
        const encoded = multiplyTransformer.encode(input) as number;
        expect(multiplyTransformer.decode(encoded) as number).toBeCloseTo(
          input,
        );
      }
    });

    it("should be perfectly bidirectional with fractional multiplier", () => {
      const testValues = [10, 5, -5, 100, -100, 3.14, -3.14];

      for (const originalValue of testValues) {
        const encoded = multiplyTransformer.encode(originalValue) as number;
        const decoded = multiplyTransformer.decode(encoded) as number;
        expect(decoded).toBeCloseTo(originalValue);
      }
    });
  });

  describe("with negative multiplier", () => {
    beforeEach(() => {
      multiplyTransformer = runaMultiply(-1);
    });

    it("should handle negative multipliers correctly", () => {
      const testCases = [
        { input: 5, expected: -5 },
        { input: -5, expected: 5 },
        { input: 0, expected: 0 },
        { input: 10, expected: -10 },
      ];

      for (const { input, expected } of testCases) {
        expect(multiplyTransformer.encode(input) as number).toBeCloseTo(
          expected,
        );
      }
    });

    it("should decode correctly with negative multipliers", () => {
      const testCases = [
        { input: -5, expected: 5 },
        { input: 5, expected: -5 },
        { input: 0, expected: 0 },
      ];

      for (const { input, expected } of testCases) {
        expect(multiplyTransformer.decode(input) as number).toBeCloseTo(
          expected,
        );
      }
    });

    it("should be perfectly bidirectional with negative multiplier", () => {
      const testValues = [5, -5, 0, 10, -10, 3.14, -3.14];

      for (const originalValue of testValues) {
        const encoded = multiplyTransformer.encode(originalValue) as number;
        const decoded = multiplyTransformer.decode(encoded) as number;
        expect(decoded).toBeCloseTo(originalValue);
      }
    });
  });

  describe("with multiplier of 1 (identity transformation)", () => {
    beforeEach(() => {
      multiplyTransformer = runaMultiply(1);
    });

    it("should return the same value (identity transformation)", () => {
      const testValues = [0, 5, -5, 100, -100, 3.14, -3.14];

      for (const value of testValues) {
        expect(multiplyTransformer.encode(value) as number).toBe(value);
        expect(multiplyTransformer.decode(value) as number).toBe(value);
      }
    });
  });

  describe("with large multiplier", () => {
    beforeEach(() => {
      multiplyTransformer = runaMultiply(1000);
    });

    it("should handle large multipliers", () => {
      const testCases = [
        { input: 1, expected: 1000 },
        { input: 0.001, expected: 1 },
        { input: -1, expected: -1000 },
      ];

      for (const { input, expected } of testCases) {
        expect(multiplyTransformer.encode(input) as number).toBeCloseTo(
          expected,
        );
      }
    });

    it("should decode correctly with large multipliers", () => {
      const testCases = [
        { input: 1000, expected: 1 },
        { input: 1, expected: 0.001 },
        { input: -1000, expected: -1 },
      ];

      for (const { input, expected } of testCases) {
        expect(multiplyTransformer.decode(input) as number).toBeCloseTo(
          expected,
        );
      }
    });
  });

  describe("error handling for zero multiplier", () => {
    it("should throw error when calling runaMultiply with zero", () => {
      expect(() => runaMultiply(0)).toThrow();
    });
  });

  describe("practical usage examples", () => {
    it("should work in unit conversion scenarios", () => {
      // Meters to feet conversion
      const meterToFeet = runaMultiply(3.28084);

      const meters = 10;
      const feet = meterToFeet.encode(meters) as number;
      expect(feet).toBeCloseTo(32.8084);

      const restoredMeters = meterToFeet.decode(feet) as number;
      expect(restoredMeters).toBeCloseTo(10);
    });

    it("should work in display scaling scenarios", () => {
      // 2x zoom for display
      const displayScale = runaMultiply(2);

      const worldX = 150;
      const worldY = 75;

      const screenX = displayScale.encode(worldX) as number;
      const screenY = displayScale.encode(worldY) as number;

      expect(screenX).toBe(300);
      expect(screenY).toBe(150);

      const originalX = displayScale.decode(screenX) as number;
      const originalY = displayScale.decode(screenY) as number;

      expect(originalX).toBe(150);
      expect(originalY).toBe(75);
    });

    it("should work in currency conversion scenarios", () => {
      // USD to EUR conversion
      const usdToEur = runaMultiply(0.85);

      const usdAmount = 100;
      const eurAmount = usdToEur.encode(usdAmount) as number;
      expect(eurAmount).toBe(85);

      const usdRestored = usdToEur.decode(eurAmount) as number;
      expect(usdRestored).toBe(100);
    });

    it("should work in data scaling scenarios", () => {
      // Halve values
      const halveValues = runaMultiply(0.5);

      const original = [10, 20, 30, 40];
      const halved = original.map((v) => halveValues.encode(v) as number);
      expect(halved).toEqual([5, 10, 15, 20]);

      const restored = halved.map((v) => halveValues.decode(v) as number);
      expect(restored).toEqual([10, 20, 30, 40]);
    });

    it("should work in compound transformations", () => {
      // Celsius to Fahrenheit: (C * 1.8) + 32
      const multiplyBy18 = runaMultiply(1.8);
      const add32 = runaAdd(32);
      const celsiusToFahrenheit = multiplyBy18.chain(add32);

      const celsius = 25;
      const fahrenheit = celsiusToFahrenheit.encode(celsius) as number;
      expect(fahrenheit).toBeCloseTo(77); // (25 * 1.8) + 32

      const restoredCelsius = celsiusToFahrenheit.decode(fahrenheit) as number;
      expect(restoredCelsius).toBeCloseTo(25); // (77 - 32) / 1.8
    });
  });

  describe("precision and floating point handling", () => {
    it("should handle floating point precision", () => {
      const highPrecision = runaMultiply(0.333333333);

      const value = 3;
      const result = highPrecision.encode(value) as number;
      expect(result).toBeCloseTo(0.999999999);

      const restored = highPrecision.decode(result) as number;
      expect(restored).toBeCloseTo(3);
    });

    it("should handle very small multipliers", () => {
      const microScale = runaMultiply(0.000001);

      const value = 1000000;
      const result = microScale.encode(value) as number;
      expect(result).toBe(1);

      const restored = microScale.decode(result) as number;
      expect(restored).toBe(1000000);
    });

    it("should handle very large multipliers", () => {
      const megaScale = runaMultiply(1000000);

      const value = 0.000001;
      const result = megaScale.encode(value) as number;
      expect(result).toBe(1);

      const restored = megaScale.decode(result) as number;
      expect(restored).toBe(0.000001);
    });
  });

  describe("boundary conditions", () => {
    it("should handle safe integer boundaries", () => {
      const scaler = runaMultiply(2);

      const maxSafe = Number.MAX_SAFE_INTEGER;
      const encoded = scaler.encode(maxSafe) as number;

      // Check if encoding exceeds safe integer limit
      expect(encoded > Number.MAX_SAFE_INTEGER).toBe(true);

      // Decode should still work if within limits
      const halfMax = Math.floor(maxSafe / 2);
      const encodedHalf = scaler.encode(halfMax) as number;
      expect(encodedHalf).toBe(maxSafe - 1); // Accounting for odd/even

      const decoded = scaler.decode(encodedHalf) as number;
      expect(decoded).toBe(halfMax);
    });

    it("should handle minimum safe integer", () => {
      const scaler = runaMultiply(0.5);

      const minSafe = Number.MIN_SAFE_INTEGER;
      const encoded = scaler.encode(minSafe) as number;

      const decoded = scaler.decode(encoded) as number;
      expect(decoded).toBeCloseTo(minSafe);
    });
  });
});
