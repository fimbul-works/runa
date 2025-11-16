import { describe, it, expect, beforeEach } from "vitest";
import { runaCantorPair } from "./cantor-pair.js";

describe("runaCantorPair", () => {
  let cantor: ReturnType<typeof runaCantorPair>;

  beforeEach(() => {
    cantor = runaCantorPair();
  });

  it("should encode basic pairs correctly", () => {
    const testCases: [number, number][] = [
      [0, 0],
      [0, 1],
      [1, 0],
      [1, 1],
      [2, 3],
      [3, 2],
    ];

    const expectedResults = [0, 2, 1, 4, 18, 17];

    testCases.forEach(([x, y], index) => {
      expect(cantor.encode([x, y]) as number).toBe(expectedResults[index]);
    });
  });

  it("should decode basic numbers correctly", () => {
    const testCases = [0, 1, 2, 3, 4, 5, 6, 14, 15];
    const expectedPairs: [number, number][] = [
      [0, 0],
      [1, 0],
      [0, 1],
      [2, 0],
      [1, 1],
      [0, 2],
      [3, 0],
      [0, 4],
      [5, 0],
    ];

    testCases.forEach((z, index) => {
      expect(cantor.decode(z) as [number, number]).toEqual(
        expectedPairs[index],
      );
    });
  });

  it("should be bidirectional - encode then decode returns original", () => {
    const testPairs: [number, number][] = [
      [0, 0],
      [1, 2],
      [5, 7],
      [10, 3],
      [100, 200],
      [42, 17],
    ];

    for (const [x, y] of testPairs) {
      const encoded = cantor.encode([x, y]) as number;
      const decoded = cantor.decode(encoded) as [number, number];
      expect(decoded).toEqual([x, y]);
    }
  });

  it("should handle zero values correctly", () => {
    expect(cantor.encode([0, 0]) as number).toBe(0);
    expect(cantor.decode(0) as [number, number]).toEqual([0, 0]);

    expect(cantor.encode([0, 5]) as number).toBe(20);
    expect(cantor.encode([5, 0]) as number).toBe(15);

    const decodedFrom15 = cantor.decode(15) as [number, number];
    expect([0, 5]).toEqual(expect.arrayContaining(decodedFrom15));
    expect([5, 0]).toEqual(expect.arrayContaining(decodedFrom15));
  });

  it("should throw error for negative numbers in encode", () => {
    const invalidPairs: [number, number][] = [
      [-1, 0],
      [0, -1],
      [-5, -3],
      [10, -1],
      [-1, 10],
    ];

    for (const [x, y] of invalidPairs) {
      expect(() => cantor.encode([x, y]) as number).toThrow(
        "Cantor pair requires non-negative integers",
      );
    }
  });

  it("should throw error for non-numbers in decode", () => {
    const invalidInputs = [
      "123",
      null,
      undefined,
      {},
      [],
      true,
      false,
      Symbol("test"),
      () => {},
    ];

    for (const invalid of invalidInputs) {
      expect(() => cantor.decode(invalid as unknown as number)).toThrow();
    }
  });

  it("should handle large numbers", () => {
    const largePair: [number, number] = [1000, 2000];
    const encoded = cantor.encode(largePair) as number;
    expect(encoded).toBeGreaterThan(0);
    expect(Number.isSafeInteger(encoded)).toBe(true);

    const decoded = cantor.decode(encoded) as [number, number];
    expect(decoded).toEqual(largePair);
  });

  it("should handle sequential Cantor numbers correctly", () => {
    // Test the sequence 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10...
    const expectedSequence: [number, number][] = [
      [0, 0], // 0
      [1, 0], // 1
      [0, 1], // 2
      [2, 0], // 3
      [1, 1], // 4
      [0, 2], // 5
      [3, 0], // 6
      [2, 1], // 7
      [1, 2], // 8
      [0, 3], // 9
    ];

    for (let i = 0; i < expectedSequence.length; i++) {
      const decoded = cantor.decode(i) as [number, number];
      expect(decoded).toEqual(expectedSequence[i]);
    }
  });

  it("should maintain mathematical properties", () => {
    // Cantor pairing is bijective: f(a,b) = f(b,a) only when a = b
    const pair1: [number, number] = [3, 5];
    const pair2: [number, number] = [5, 3];

    const encoded1 = cantor.encode(pair1) as number;
    const encoded2 = cantor.encode(pair2) as number;

    expect(encoded1).not.toBe(encoded2);
    expect(encoded1).toBeGreaterThan(encoded2); // f(5,3) > f(3,5) when 5 > 3

    // But when a = b, f(a,a) should equal f(a,a)
    const symmetricPair: [number, number] = [7, 7];
    const encodedSymmetric = cantor.encode(symmetricPair) as number;
    const encodedSymmetric2 = cantor.encode(symmetricPair) as number;
    expect(encodedSymmetric).toBe(encodedSymmetric2);
  });

  it("should handle the identity element", () => {
    // f(0,n) should NOT equal f(n,0) except when n = 0
    expect(cantor.encode([0, 1]) as number).not.toBe(
      cantor.encode([1, 0]) as number,
    );
    expect(cantor.encode([0, 5]) as number).not.toBe(
      cantor.encode([5, 0]) as number,
    );

    // But f(0,0) should equal f(0,0) = 0
    expect(cantor.encode([0, 0]) as number).toBe(0);

    // Test specific known values
    expect(cantor.encode([0, 5]) as number).toBe(20);
    expect(cantor.encode([5, 0]) as number).toBe(15);
  });

  it("should handle floating point edge cases", () => {
    // Test that it properly handles integer inputs that are represented as floats
    const floatInts: [number, number][] = [
      [1.0, 2.0],
      [3.0, 0.0],
      [0.0, 5.0],
    ];

    for (const [x, y] of floatInts) {
      expect(() => cantor.encode([x, y]) as number).not.toThrow();
      const encoded = cantor.encode([x, y]) as number;
      const decoded = cantor.decode(encoded) as [number, number];
      expect(decoded).toEqual([x, y]);
    }
  });

  it("should demonstrate triangular number relationship", () => {
    // Cantor pairing is related to triangular numbers
    // f(0,n) = n(n+1)/2 + n = n(n+3)/2
    const expectedValues = [0, 2, 5, 9, 14, 20, 27, 35];

    for (let n = 0; n < expectedValues.length; n++) {
      expect(cantor.encode([0, n]) as number).toBe(expectedValues[n]);
    }
  });

  it("should handle maximum safe integer limits", () => {
    // Test near the limits of JavaScript's safe integer range
    const maxSafe = Number.MAX_SAFE_INTEGER;

    // Find a pair that should be safe
    const safePair: [number, number] = [10000, 10000];
    const encoded = cantor.encode(safePair) as number;

    expect(encoded).toBeLessThanOrEqual(maxSafe);
    expect(Number.isSafeInteger(encoded)).toBe(true);

    const decoded = cantor.decode(encoded) as [number, number];
    expect(decoded).toEqual(safePair);
  });
});
