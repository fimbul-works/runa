import { beforeEach, describe, expect, it } from "vitest";
import { runaAdd } from "./add.js";

describe("runaAdd", () => {
  let addTransformer: ReturnType<typeof runaAdd>;

  describe("with positive additive", () => {
    beforeEach(() => {
      addTransformer = runaAdd(10);
    });

    it("should encode numbers by adding the additive", () => {
      const testCases = [
        { input: 0, expected: 10 },
        { input: 5, expected: 15 },
        { input: -5, expected: 5 },
        { input: 100, expected: 110 },
        { input: -100, expected: -90 },
        { input: 3.14, expected: 13.14 },
        { input: -3.14, expected: 6.86 },
      ];

      for (const { input, expected } of testCases) {
        expect(addTransformer.encode(input) as number).toBeCloseTo(expected);
      }
    });

    it("should decode numbers by subtracting the additive", () => {
      const testCases = [
        { input: 10, expected: 0 },
        { input: 15, expected: 5 },
        { input: 5, expected: -5 },
        { input: 110, expected: 100 },
        { input: -90, expected: -100 },
        { input: 13.14, expected: 3.14 },
        { input: 6.86, expected: -3.14 },
      ];

      for (const { input, expected } of testCases) {
        expect(addTransformer.decode(input) as number).toBeCloseTo(expected);
      }
    });

    it("should be perfectly bidirectional", () => {
      const testValues = [0, 5, -5, 100, -100, 3.14, -3.14, 42, -42];

      for (const originalValue of testValues) {
        const encoded = addTransformer.encode(originalValue) as number;
        const decoded = addTransformer.decode(encoded) as number;
        expect(decoded).toBeCloseTo(originalValue);
      }
    });

    it("should handle edge cases", () => {
      // Large numbers - be careful with precision
      const largeNumber = Number.MAX_SAFE_INTEGER - 100;
      const encodedLarge = addTransformer.encode(largeNumber) as number;
      expect(encodedLarge).toBe(largeNumber + 10);
      expect(addTransformer.decode(encodedLarge) as number).toBe(largeNumber);

      // Small numbers
      const smallNumber = Number.MIN_SAFE_INTEGER;
      const encodedSmall = addTransformer.encode(smallNumber) as number;
      expect(encodedSmall).toBe(smallNumber + 10);
      expect(addTransformer.decode(encodedSmall) as number).toBe(smallNumber);

      // Infinity
      const encodedInfinity = addTransformer.encode(
        Number.POSITIVE_INFINITY,
      ) as number;
      expect(encodedInfinity).toBe(Number.POSITIVE_INFINITY);
      expect(addTransformer.decode(encodedInfinity) as number).toBe(
        Number.POSITIVE_INFINITY,
      );
    });

    it("should throw for non-number inputs during encoding", () => {
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
        expect(() => addTransformer.encode(input as any)).toThrow();
      }
    });

    it("should throw for non-number inputs during decoding", () => {
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
        expect(() => addTransformer.decode(input as any)).toThrow();
      }
    });
  });

  describe("with negative additive", () => {
    beforeEach(() => {
      addTransformer = runaAdd(-5);
    });

    it("should encode numbers by adding negative additive (subtraction)", () => {
      const testCases = [
        { input: 10, expected: 5 },
        { input: 5, expected: 0 },
        { input: 0, expected: -5 },
        { input: -5, expected: -10 },
        { input: 15.5, expected: 10.5 },
      ];

      for (const { input, expected } of testCases) {
        expect(addTransformer.encode(input) as number).toBeCloseTo(expected);
      }
    });

    it("should decode numbers by subtracting negative additive (addition)", () => {
      const testCases = [
        { input: 5, expected: 10 },
        { input: 0, expected: 5 },
        { input: -5, expected: 0 },
        { input: -10, expected: -5 },
        { input: 10.5, expected: 15.5 },
      ];

      for (const { input, expected } of testCases) {
        expect(addTransformer.decode(input) as number).toBeCloseTo(expected);
      }
    });

    it("should be perfectly bidirectional with negative additive", () => {
      const testValues = [10, 0, -5, 15.5, -20.3];

      for (const originalValue of testValues) {
        const encoded = addTransformer.encode(originalValue) as number;
        const decoded = addTransformer.decode(encoded) as number;
        expect(decoded).toBeCloseTo(originalValue);
      }
    });
  });

  describe("with zero additive", () => {
    beforeEach(() => {
      addTransformer = runaAdd(0);
    });

    it("should return the same value (identity transformation)", () => {
      const testValues = [0, 5, -5, 100, -100, 3.14, -3.14];

      for (const value of testValues) {
        expect(addTransformer.encode(value) as number).toBe(value);
        expect(addTransformer.decode(value) as number).toBe(value);
      }
    });
  });

  describe("with fractional additive", () => {
    beforeEach(() => {
      addTransformer = runaAdd(2.5);
    });

    it("should handle fractional values correctly", () => {
      const testCases = [
        { input: 1, expected: 3.5 },
        { input: 3.14, expected: 5.64 },
        { input: -1, expected: 1.5 },
      ];

      for (const { input, expected } of testCases) {
        expect(addTransformer.encode(input) as number).toBeCloseTo(expected);
        const encoded = addTransformer.encode(input) as number;
        expect(addTransformer.decode(encoded) as number).toBeCloseTo(input);
      }
    });
  });

  describe("practical usage examples", () => {
    it("should work in temperature conversion scenarios", () => {
      // Celsius to Fahrenheit offset
      const celsiusOffset = runaAdd(32);

      const celsiusTemp = 25;
      const fahrenheitOffset = celsiusOffset.encode(celsiusTemp) as number;
      expect(fahrenheitOffset).toBe(57); // 25 + 32

      const restoredCelsius = celsiusOffset.decode(fahrenheitOffset) as number;
      expect(restoredCelsius).toBe(25);
    });

    it("should work in coordinate offset scenarios", () => {
      const offsetX = runaAdd(100);
      const offsetY = runaAdd(50);

      const playerX = 10;
      const playerY = 20;

      const screenX = offsetX.encode(playerX) as number;
      const screenY = offsetY.encode(playerY) as number;

      expect(screenX).toBe(110);
      expect(screenY).toBe(70);

      const originalX = offsetX.decode(screenX) as number;
      const originalY = offsetY.decode(screenY) as number;

      expect(originalX).toBe(10);
      expect(originalY).toBe(20);
    });

    it("should work in scoring system scenarios", () => {
      const scoreBonus = runaAdd(1000);

      const baseScore = 450;
      const adjustedScore = scoreBonus.encode(baseScore);
      expect(adjustedScore).toBe(1450);

      const originalScore = scoreBonus.decode(adjustedScore);
      expect(originalScore).toBe(450);
    });

    it("should work in data normalization scenarios", () => {
      const shiftByMinus10 = runaAdd(-10);

      const measurements = [50, 60, 70, 80];
      const shifted = measurements.map((m) => shiftByMinus10.encode(m));
      expect(shifted).toEqual([40, 50, 60, 70]);

      const original = shifted.map((n) => shiftByMinus10.decode(n));
      expect(original).toEqual(measurements);
    });
  });

  describe("precision handling", () => {
    it("should handle floating point precision", () => {
      const preciseAdd = runaAdd(0.1);

      const value = 1.4;
      const result = preciseAdd.encode(value) as number;
      expect(result).toBe(1.5);

      const restored = preciseAdd.decode(result) as number;
      expect(restored).toBe(1.4);
    });

    it("should handle very small numbers", () => {
      const microAdd = runaAdd(0.000001);

      const value = 0.000001;
      const result = microAdd.encode(value) as number;
      expect(result).toBe(0.000002);

      const restored = microAdd.decode(result) as number;
      expect(restored).toBe(0.000001);
    });
  });
});
