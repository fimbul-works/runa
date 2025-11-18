import { beforeEach, describe, expect, it, vi } from "vitest";
import { runaCantorPairArray } from "./cantor-pair-array.js";

describe("runaCantorPairArray", () => {
  let cantorPairArray: ReturnType<typeof runaCantorPairArray>;

  beforeEach(() => {
    cantorPairArray = runaCantorPairArray();
  });

  describe("Basic functionality", () => {
    it("should encode array of number pairs to array of single numbers", () => {
      const input = [
        [1, 2],
        [3, 4],
        [5, 6],
      ];
      const result = cantorPairArray.encode(input);
      expect(result).toEqual([8, 32, 72]); // Cantor pairs: (1,2)=8, (3,4)=32, (5,6)=72
    });

    it("should decode array of single numbers back to array of pairs", () => {
      const input = [8, 32, 72];
      const result = cantorPairArray.decode(input);
      expect(result).toEqual([
        [1, 2],
        [3, 4],
        [5, 6],
      ]); // Reverse Cantor pairs
    });

    it("should handle empty array", () => {
      const input: number[][] = [];
      const expected: number[] = [];
      const result = cantorPairArray.encode(input);
      expect(result).toEqual(expected);
    });

    it("should handle empty array for decode", () => {
      const input: number[] = [];
      const expected: number[][] = [];
      const result = cantorPairArray.decode(input);
      expect(result).toEqual(expected);
    });

    it("should handle single pair", () => {
      const input = [[7, 8]];
      const result = cantorPairArray.encode(input);
      expect(result).toEqual([128]); // Cantor pair (7,8) = 128
    });

    it("should handle single number", () => {
      const input = [128];
      const result = cantorPairArray.decode(input);
      expect(result).toEqual([[7, 8]]); // Reverse Cantor pair 128 = (7,8)
    });
  });

  describe("Perfect reversibility", () => {
    it("should be perfectly bidirectional for regular pairs", () => {
      const original = [
        [0, 0],
        [1, 1],
        [2, 3],
        [4, 2],
        [10, 5],
      ];
      const encoded = cantorPairArray.encode(original);
      const decoded = cantorPairArray.decode(encoded);
      expect(decoded).toEqual(original);
    });

    it("should handle zero values", () => {
      const original = [
        [0, 0],
        [0, 5],
        [7, 0],
      ];
      const encoded = cantorPairArray.encode(original);
      const decoded = cantorPairArray.decode(encoded);
      expect(decoded).toEqual(original);
    });

    it("should handle large numbers", () => {
      const original = [
        [100, 200],
        [500, 1000],
      ];
      const encoded = cantorPairArray.encode(original);
      const decoded = cantorPairArray.decode(encoded);
      expect(decoded).toEqual(original);
    });

    it("should handle repeated encode/decode operations", () => {
      const original = [
        [1, 2],
        [3, 4],
        [5, 6],
      ];
      let current = original;

      for (let i = 0; i < 10; i++) {
        const encoded = cantorPairArray.encode(current);
        current = cantorPairArray.decode(encoded);
      }

      expect(current).toEqual(original);
    });

    it("should maintain order of pairs", () => {
      const original = [
        [3, 1],
        [1, 3],
        [2, 2],
      ];
      const encoded = cantorPairArray.encode(original);
      const decoded = cantorPairArray.decode(encoded);
      expect(decoded).toEqual(original);
    });
  });

  describe("Mathematical properties", () => {
    it("should produce unique encoding for each pair", () => {
      const pairs = [
        [0, 0],
        [0, 1],
        [1, 0],
        [1, 1],
        [2, 1],
        [1, 2],
      ];
      const encoded = cantorPairArray.encode(pairs);

      // All encoded values should be unique
      const unique = new Set(encoded);
      expect(unique.size).toBe(encoded.length);
    });

    it("should follow Cantor pairing formula", () => {
      // Cantor pairing formula: π(k1, k2) = ½(k1 + k2)(k1 + k2 + 1) + k2
      const testPairs = [
        [0, 0],
        [1, 2],
        [3, 4],
        [2, 1],
      ];
      const encoded = cantorPairArray.encode(testPairs);

      // Verify formula results
      expect(encoded[0]).toBe(0); // π(0,0) = 0
      expect(encoded[1]).toBe(8); // π(1,2) = ½(3)(4) + 2 = 8
      expect(encoded[2]).toBe(32); // π(3,4) = ½(7)(8) + 4 = 32
      expect(encoded[3]).toBe(7); // π(2,1) = ½(3)(4) + 1 = 7
    });

    it("should handle commutative property appropriately", () => {
      const pair1 = [2, 3];
      const pair2 = [3, 2];

      const encoded1 = cantorPairArray.encode([pair1]);
      const encoded2 = cantorPairArray.encode([pair2]);

      // Cantor pairing is not commutative: π(a,b) ≠ π(b,a) generally
      expect(encoded1[0]).not.toBe(encoded2[0]);
    });

    it("should demonstrate monotonicity", () => {
      // If k1 increases while k2 stays same, result increases
      const basePair = [2, 3];
      const largerPair = [3, 3];

      const baseEncoded = cantorPairArray.encode([basePair]);
      const largerEncoded = cantorPairArray.encode([largerPair]);

      expect(largerEncoded[0]).toBeGreaterThan(baseEncoded[0]);
    });
  });

  describe("Error handling", () => {
    it("should throw on null input for encode", () => {
      expect(() => cantorPairArray.encode(null as any)).toThrow(
        "Invalid array",
      );
    });

    it("should throw on undefined input for encode", () => {
      expect(() => cantorPairArray.encode(undefined as any)).toThrow(
        "Invalid array",
      );
    });

    it("should throw on non-array input for encode", () => {
      expect(() => cantorPairArray.encode("not an array" as any)).toThrow(
        "Invalid array",
      );
      expect(() => cantorPairArray.encode(123 as any)).toThrow("Invalid array");
      expect(() => cantorPairArray.encode({} as any)).toThrow("Invalid array");
    });

    it("should throw on invalid pair elements", () => {
      const input = [[1, 2], "invalid pair", [3, 4]];
      expect(() => cantorPairArray.encode(input as any)).toThrow(
        "Invalid pair at index 1",
      );
    });

    it("should throw on null input for decode", () => {
      expect(() => cantorPairArray.decode(null as any)).toThrow(
        "Invalid array",
      );
    });

    it("should throw on undefined input for decode", () => {
      expect(() => cantorPairArray.decode(undefined as any)).toThrow(
        "Invalid array",
      );
    });

    it("should throw on non-array input for decode", () => {
      expect(() => cantorPairArray.decode("not an array" as any)).toThrow(
        "Invalid array",
      );
      expect(() => cantorPairArray.decode(123 as any)).toThrow("Invalid array");
      expect(() => cantorPairArray.decode({} as any)).toThrow("Invalid array");
    });

    it("should throw on non-number elements", () => {
      const input = [4, "invalid number", 13];
      expect(() => cantorPairArray.decode(input as any)).toThrow(
        "Invalid number at index 1",
      );
    });

    it("should throw on pairs with wrong length", () => {
      const tooShort = [[1], [2, 3, 4]];
      const tooLong = [
        [1, 2, 3],
        [4, 5, 6],
      ];

      // These should fail when the underlying cantorPair tries to process them
      expect(() => cantorPairArray.encode(tooShort as any)).toThrow();
      expect(() => cantorPairArray.encode(tooLong as any)).toThrow();
    });
  });

  describe("Edge cases", () => {
    it("should handle very large numbers", () => {
      const largePairs = [
        [1000, 2000],
        [5000, 3000],
      ];
      const encoded = cantorPairArray.encode(largePairs);
      const decoded = cantorPairArray.decode(encoded);
      expect(decoded).toEqual(largePairs);
    });

    it("should throw on negative numbers", () => {
      expect(() => cantorPairArray.encode([[-1, 2]])).toThrow(
        "Cantor pair requires non-negative integers",
      );
      expect(() => cantorPairArray.encode([[3, -4]])).toThrow(
        "Cantor pair requires non-negative integers",
      );
      expect(() => cantorPairArray.encode([[-5, 10]])).toThrow(
        "Cantor pair requires non-negative integers",
      );
      expect(() => cantorPairArray.encode([[0, -3]])).toThrow(
        "Cantor pair requires non-negative integers",
      );
    });

    it("should handle large arrays efficiently", () => {
      const largePairs = Array.from({ length: 1000 }, (_, i) => [i, i + 1]);
      const start = performance.now();
      const encoded = cantorPairArray.encode(largePairs);
      const decoded = cantorPairArray.decode(encoded);
      const end = performance.now();

      expect(decoded).toEqual(largePairs);
      expect(end - start).toBeLessThan(100); // Should complete quickly
    });

    it("should handle sparse arrays", () => {
      const sparsePairs = new Array(10);
      sparsePairs[0] = [1, 2];
      sparsePairs[5] = [3, 4];
      sparsePairs[9] = [5, 6];

      const encoded = cantorPairArray.encode(sparsePairs as any);
      const decoded = cantorPairArray.decode(encoded);

      expect(decoded.length).toBe(10);
      expect(decoded[0]).toEqual([1, 2]);
      expect(decoded[5]).toEqual([3, 4]);
      expect(decoded[9]).toEqual([5, 6]);
    });
  });

  describe("Real-world scenarios", () => {
    it("should encode coordinate pairs", () => {
      const coordinates = [
        [10, 20],
        [30, 40],
        [50, 60],
        [70, 80],
      ];
      const encoded = cantorPairArray.encode(coordinates);
      const decoded = cantorPairArray.decode(encoded);
      expect(decoded).toEqual(coordinates);
    });

    it("should handle pixel coordinates", () => {
      const pixels = [
        [0, 0],
        [100, 200],
        [50, 75],
        [255, 255],
      ];
      const encoded = cantorPairArray.encode(pixels);
      const decoded = cantorPairArray.decode(encoded);
      expect(decoded).toEqual(pixels);
    });

    it("should compress 2D index to 1D", () => {
      // Common use case: converting 2D array indices to 1D
      const indices2D = [
        [0, 0],
        [0, 1],
        [1, 0],
        [1, 1],
        [2, 0],
        [2, 1],
      ];
      const encoded = cantorPairArray.encode(indices2D);
      const decoded = cantorPairArray.decode(encoded);
      expect(decoded).toEqual(indices2D);
    });

    it("should handle hash key combinations", () => {
      // Combining two hash values into one
      const hashPairs = [
        [12345, 67890],
        [11111, 22222],
        [33333, 44444],
      ];
      const encoded = cantorPairArray.encode(hashPairs);
      const decoded = cantorPairArray.decode(encoded);
      expect(decoded).toEqual(hashPairs);
    });
  });

  describe("Performance considerations", () => {
    it("should use mapping for efficient processing", () => {
      const pairs = [
        [1, 2],
        [3, 4],
        [5, 6],
      ];
      const mapSpy = vi.spyOn(Array.prototype, "map");

      const result = cantorPairArray.encode(pairs);
      expect(mapSpy).toHaveBeenCalledTimes(1);

      mapSpy.mockClear();
      const decoded = cantorPairArray.decode(result);
      expect(mapSpy).toHaveBeenCalledTimes(1);

      mapSpy.mockRestore();
    });

    it("should handle memory efficiently", () => {
      const pairs = Array.from({ length: 1000 }, (_, i) => [i, i * 2]);

      // Check that encoding creates a new array (not a reference)
      const encoded = cantorPairArray.encode(pairs);
      expect(encoded).not.toBe(pairs);
      expect(encoded.length).toBe(pairs.length);

      // Check that decoding creates a new array
      const decoded = cantorPairArray.decode(encoded);
      expect(decoded).not.toBe(encoded);
      expect(decoded).not.toBe(pairs);
    });
  });

  describe("Integration with other converters", () => {
    it("should work well with array operations", () => {
      const pairs = [
        [1, 2],
        [3, 4],
        [5, 6],
      ];
      const encoded = cantorPairArray.encode(pairs);

      // Can now use these encoded numbers with other array operations
      const sum = encoded.reduce((a, b) => a + b, 0);
      const average = sum / encoded.length;

      expect(average).toBeGreaterThan(0);

      // Still can decode back perfectly
      const decoded = cantorPairArray.decode(encoded);
      expect(decoded).toEqual(pairs);
    });

    it("should be useful for data compression scenarios", () => {
      const originalData = [
        [10, 20],
        [30, 40],
        [50, 60],
        [70, 80],
        [90, 100],
      ];

      const compressed = cantorPairArray.encode(originalData);

      // Compressed data takes half the space (2 numbers → 1 number)
      expect(compressed.length).toBe(originalData.length);
      expect(compressed).not.toEqual(originalData.flat()); // Not just flattened

      const decompressed = cantorPairArray.decode(compressed);
      expect(decompressed).toEqual(originalData);
    });
  });
});
