import { beforeEach, describe, expect, it } from "vitest";
import { runaMultiply } from "./multiply.js";
import { runaPower } from "./power.js";
import { serializeValue } from "./util.js";

describe("runaPower", () => {
  let powerTransformer: ReturnType<typeof runaPower>;

  describe("constructor validation", () => {
    it("should throw error for exponent of 0", () => {
      expect(() => runaPower(0)).toThrow("Exponent cannot be 0");
    });

    it("should accept positive exponents", () => {
      expect(() => runaPower(2)).not.toThrow();
      expect(() => runaPower(3)).not.toThrow();
      expect(() => runaPower(10)).not.toThrow();
    });

    it("should accept negative exponents", () => {
      expect(() => runaPower(-1)).not.toThrow();
      expect(() => runaPower(-2)).not.toThrow();
    });

    it("should accept fractional exponents", () => {
      expect(() => runaPower(0.5)).not.toThrow();
      expect(() => runaPower(0.25)).not.toThrow();
      expect(() => runaPower(1.5)).not.toThrow();
    });
  });

  describe("with square exponent (2)", () => {
    beforeEach(() => {
      powerTransformer = runaPower(2);
    });

    it("should encode numbers by squaring them", () => {
      const testCases = [
        { input: 0, expected: 0 },
        { input: 1, expected: 1 },
        { input: 2, expected: 4 },
        { input: 5, expected: 25 },
        { input: 10, expected: 100 },
        { input: 3.14, expected: 9.8596 },
      ];

      for (const { input, expected } of testCases) {
        expect(powerTransformer.encode(input) as number).toBeCloseTo(expected);
      }
    });

    it("should decode numbers by taking square root", () => {
      const testCases = [
        { input: 0, expected: 0 },
        { input: 1, expected: 1 },
        { input: 4, expected: 2 },
        { input: 25, expected: 5 },
        { input: 100, expected: 10 },
        { input: 9.8596, expected: 3.14 },
      ];

      for (const { input, expected } of testCases) {
        expect(powerTransformer.decode(input) as number).toBeCloseTo(expected);
      }
    });

    it("should be perfectly bidirectional", () => {
      const testValues = [0, 1, 2, 5, 10, 3.14, 7.5, 42];

      for (const originalValue of testValues) {
        const encoded = powerTransformer.encode(originalValue) as number;
        const decoded = powerTransformer.decode(encoded) as number;
        expect(decoded).toBeCloseTo(originalValue);
      }
    });

    it("should throw error for negative inputs", () => {
      expect(() => powerTransformer.encode(-1)).toThrow(
        "Even exponents (2) require non-negative inputs: -1",
      );
      expect(() => powerTransformer.encode(-5)).toThrow(
        "Even exponents (2) require non-negative inputs: -5",
      );
      expect(() => powerTransformer.decode(-1)).toThrow(
        "Even exponents (2) require non-negative inputs: -1",
      );
    });

    it("should throw error for non-number inputs", () => {
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
        expect(() => powerTransformer.encode(input as any)).toThrow(
          `Invalid number: ${serializeValue(input)}`,
        );
        expect(() => powerTransformer.decode(input as any)).toThrow(
          `Invalid number: ${serializeValue(input)}`,
        );
      }
    });
  });

  describe("with cube exponent (3)", () => {
    beforeEach(() => {
      powerTransformer = runaPower(3);
    });

    it("should encode numbers by cubing them", () => {
      const testCases = [
        { input: 0, expected: 0 },
        { input: 1, expected: 1 },
        { input: 2, expected: 8 },
        { input: 5, expected: 125 },
        { input: -2, expected: -8 },
        { input: -5, expected: -125 },
        { input: 2.5, expected: 15.625 },
      ];

      for (const { input, expected } of testCases) {
        expect(powerTransformer.encode(input) as number).toBeCloseTo(expected);
      }
    });

    it("should decode numbers by taking cube root", () => {
      const testCases = [
        { input: 0, expected: 0 },
        { input: 1, expected: 1 },
        { input: 8, expected: 2 },
        { input: 125, expected: 5 },
        { input: -8, expected: -2 },
        { input: -125, expected: -5 },
        { input: 15.625, expected: 2.5 },
      ];

      for (const { input, expected } of testCases) {
        expect(powerTransformer.decode(input) as number).toBeCloseTo(expected);
      }
    });

    it("should handle negative numbers with odd exponent", () => {
      const testValues = [-8, -27, -64, -125];

      for (const originalValue of testValues) {
        const encoded = powerTransformer.encode(originalValue) as number;
        const decoded = powerTransformer.decode(encoded) as number;
        expect(decoded).toBeCloseTo(originalValue);
      }
    });

    it("should be perfectly bidirectional with negative numbers", () => {
      const testValues = [0, 1, 2, -2, 5, -5, 10, -10];

      for (const originalValue of testValues) {
        const encoded = powerTransformer.encode(originalValue) as number;
        const decoded = powerTransformer.decode(encoded) as number;
        expect(decoded).toBeCloseTo(originalValue);
      }
    });
  });

  describe("with square root exponent (0.5)", () => {
    beforeEach(() => {
      powerTransformer = runaPower(0.5);
    });

    it("should encode numbers by taking square root", () => {
      const testCases = [
        { input: 0, expected: 0 },
        { input: 1, expected: 1 },
        { input: 4, expected: 2 },
        { input: 9, expected: 3 },
        { input: 16, expected: 4 },
        { input: 25, expected: 5 },
        { input: 2.25, expected: 1.5 },
      ];

      for (const { input, expected } of testCases) {
        expect(powerTransformer.encode(input) as number).toBeCloseTo(expected);
      }
    });

    it("should decode numbers by squaring them", () => {
      const testCases = [
        { input: 0, expected: 0 },
        { input: 1, expected: 1 },
        { input: 2, expected: 4 },
        { input: 3, expected: 9 },
        { input: 4, expected: 16 },
        { input: 5, expected: 25 },
        { input: 1.5, expected: 2.25 },
      ];

      for (const { input, expected } of testCases) {
        expect(powerTransformer.decode(input) as number).toBeCloseTo(expected);
      }
    });

    it("should be perfectly bidirectional", () => {
      const testValues = [0, 1, 4, 9, 16, 25, 2.25, 12.25];

      for (const originalValue of testValues) {
        const encoded = powerTransformer.encode(originalValue) as number;
        const decoded = powerTransformer.decode(encoded) as number;
        expect(decoded).toBeCloseTo(originalValue);
      }
    });
  });

  describe("with fractional exponent (0.25)", () => {
    beforeEach(() => {
      powerTransformer = runaPower(0.25);
    });

    it("should handle fractional exponents correctly", () => {
      const testCases = [
        { input: 1, expected: 1 },
        { input: 16, expected: 2 },
        { input: 81, expected: 3 },
        { input: 256, expected: 4 },
      ];

      for (const { input, expected } of testCases) {
        expect(powerTransformer.encode(input) as number).toBeCloseTo(expected);
      }
    });

    it("should decode correctly with fractional exponents", () => {
      const testCases = [
        { input: 1, expected: 1 },
        { input: 2, expected: 16 },
        { input: 3, expected: 81 },
        { input: 4, expected: 256 },
      ];

      for (const { input, expected } of testCases) {
        expect(powerTransformer.decode(input) as number).toBeCloseTo(expected);
      }
    });
  });

  describe("with negative exponent (-1)", () => {
    beforeEach(() => {
      powerTransformer = runaPower(-1);
    });

    it("should handle negative exponents correctly", () => {
      const testCases = [
        { input: 1, expected: 1 },
        { input: 2, expected: 0.5 },
        { input: 4, expected: 0.25 },
        { input: 0.5, expected: 2 },
        { input: 0.25, expected: 4 },
      ];

      for (const { input, expected } of testCases) {
        expect(powerTransformer.encode(input) as number).toBeCloseTo(expected);
      }
    });

    it("should decode correctly with negative exponents", () => {
      const testCases = [
        { input: 1, expected: 1 },
        { input: 0.5, expected: 2 },
        { input: 0.25, expected: 4 },
        { input: 2, expected: 0.5 },
        { input: 4, expected: 0.25 },
      ];

      for (const { input, expected } of testCases) {
        expect(powerTransformer.decode(input) as number).toBeCloseTo(expected);
      }
    });

    it("should be perfectly bidirectional with negative exponent", () => {
      const testValues = [0.5, 1, 2, 4, 8, 16, 0.25, 0.125];

      for (const originalValue of testValues) {
        const encoded = powerTransformer.encode(originalValue) as number;
        const decoded = powerTransformer.decode(encoded) as number;
        expect(decoded).toBeCloseTo(originalValue);
      }
    });
  });

  describe("edge cases and boundaries", () => {
    it("should handle zero correctly", () => {
      const square = runaPower(2);
      const cube = runaPower(3);
      const sqrt = runaPower(0.5);

      expect(square.encode(0) as number).toBe(0);
      expect(square.decode(0) as number).toBe(0);

      expect(cube.encode(0) as number).toBe(0);
      expect(cube.decode(0) as number).toBe(0);

      expect(sqrt.encode(0) as number).toBe(0);
      expect(sqrt.decode(0) as number).toBe(0);
    });

    it("should handle one correctly", () => {
      const square = runaPower(2);
      const cube = runaPower(3);
      const sqrt = runaPower(0.5);

      expect(square.encode(1) as number).toBe(1);
      expect(square.decode(1) as number).toBe(1);

      expect(cube.encode(1) as number).toBe(1);
      expect(cube.decode(1) as number).toBe(1);

      expect(sqrt.encode(1) as number).toBe(1);
      expect(sqrt.decode(1) as number).toBe(1);
    });

    it("should handle large numbers", () => {
      const square = runaPower(2);

      const largeNumber = 10000;
      const encoded = square.encode(largeNumber) as number;
      expect(encoded).toBe(100000000);

      const decoded = square.decode(encoded) as number;
      expect(decoded).toBe(largeNumber);
    });

    it("should handle very small numbers", () => {
      const square = runaPower(2);

      const smallNumber = 0.001;
      const encoded = square.encode(smallNumber) as number;
      expect(encoded).toBeCloseTo(0.000001);

      const decoded = square.decode(encoded) as number;
      expect(decoded).toBeCloseTo(smallNumber);
    });

    it("should handle Infinity", () => {
      const square = runaPower(2);
      const sqrt = runaPower(0.5);

      expect(square.encode(Number.POSITIVE_INFINITY) as number).toBe(
        Number.POSITIVE_INFINITY,
      );
      expect(square.decode(Number.POSITIVE_INFINITY) as number).toBe(
        Number.POSITIVE_INFINITY,
      );

      expect(sqrt.encode(Number.POSITIVE_INFINITY) as number).toBe(
        Number.POSITIVE_INFINITY,
      );
      expect(sqrt.decode(Number.POSITIVE_INFINITY) as number).toBe(
        Number.POSITIVE_INFINITY,
      );
    });

    it("should handle NaN appropriately", () => {
      const square = runaPower(2);

      const encoded = square.encode(Number.NaN) as number;
      expect(Number.isNaN(encoded)).toBe(true);

      // NaN is a special case that's hard to test for exact round-trip
    });
  });

  describe("practical usage examples", () => {
    it("should work in geometric calculations", () => {
      const areaToRadius = runaPower(0.5); // Square root
      const radiusToArea = runaPower(2); // Square

      const circleRadius = 5;
      const circleArea =
        Math.PI * (radiusToArea.encode(circleRadius) as number);
      expect(circleArea).toBeCloseTo(Math.PI * 25);

      const restoredRadius = areaToRadius.encode(
        circleArea / Math.PI,
      ) as number;
      expect(restoredRadius).toBeCloseTo(5);
    });

    it("should work in volume calculations", () => {
      const sideToVolume = runaPower(3); // Cube
      const volumeToSide = runaPower(1 / 3); // Cube root

      const sideLength = 4;
      const volume = sideToVolume.encode(sideLength) as number;
      expect(volume).toBe(64);

      const restoredSide = volumeToSide.encode(volume) as number;
      expect(restoredSide).toBeCloseTo(4);
    });

    it("should work in compound transformations", () => {
      // Scale and square: (x * 2)²
      const multiplyBy2 = runaMultiply(2);
      const square = runaPower(2);
      const scaleAndSquare = multiplyBy2.chain(square);

      const coordinate = 3;
      const transformed = scaleAndSquare.encode(coordinate) as number;
      expect(transformed).toBe(36); // (3 * 2)²

      const original = scaleAndSquare.decode(transformed) as number;
      expect(original).toBeCloseTo(3); // √36 / 2
    });

    it("should work in scientific calculations", () => {
      const logTransform = runaPower(Math.E); // Natural logarithm inverse

      const lnValue = Math.log(10);
      const exponential = logTransform.encode(lnValue) as number;
      expect(exponential).toBeCloseTo(9.651);

      const restored = logTransform.decode(exponential) as number;
      expect(restored).toBeCloseTo(lnValue);
    });
  });

  describe("precision considerations", () => {
    it("should handle perfect powers", () => {
      const cubeRoot = runaPower(1 / 3);

      const value = 27;
      const result = cubeRoot.encode(value) as number;
      expect(result).toBeCloseTo(3);

      const restored = cubeRoot.decode(result) as number;
      expect(restored).toBeCloseTo(27);
    });

    it("should handle floating point precision limitations", () => {
      const square = runaPower(2);
      const sqrt = runaPower(0.5);

      // Test a value that should round-trip perfectly
      const original = 9;
      const squared = square.encode(original) as number;
      expect(squared).toBe(81);

      const sqrtBack = sqrt.encode(squared) as number;
      expect(sqrtBack).toBeCloseTo(9);
    });

    it("should handle precision with fractional results", () => {
      const square = runaPower(2);

      const original = 1.4142135623730951; // sqrt(2)
      const encoded = square.encode(original) as number;
      expect(encoded).toBeCloseTo(2);

      const sqrtEncoded = Math.sqrt(encoded);
      expect(sqrtEncoded).toBeCloseTo(original, 10);
    });
  });

  describe("sign preservation with odd exponents", () => {
    beforeEach(() => {
      powerTransformer = runaPower(3);
    });

    it("should preserve negative signs through transformation", () => {
      const negativeValues = [-1, -8, -27, -64, -125];

      for (const originalValue of negativeValues) {
        const encoded = powerTransformer.encode(originalValue) as number;
        expect(encoded).toBeLessThan(0);

        const decoded = powerTransformer.decode(encoded) as number;
        expect(decoded).toBeCloseTo(originalValue);
      }
    });

    it("should handle zero with odd exponents", () => {
      const encoded = powerTransformer.encode(0) as number;
      expect(encoded).toBe(0);

      const decoded = powerTransformer.decode(encoded) as number;
      expect(decoded).toBe(0);
    });
  });
});
