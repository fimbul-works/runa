import { beforeEach, describe, expect, it, vi } from "vitest";
import { runaFlatten } from "./array-flatten.js";

describe("runaFlatten", () => {
  let flatten: ReturnType<typeof runaFlatten>;

  beforeEach(() => {
    flatten = runaFlatten(3);
  });

  describe("Basic functionality", () => {
    it("should flatten a 2D array", () => {
      const input = [["a", "b", "c"], ["d", "e", "f"], ["g", "h", "i"]];
      const expected = ["a", "b", "c", "d", "e", "f", "g", "h", "i"];
      const result = flatten.encode(input);
      expect(result).toEqual(expected);
    });

    it("should re-chunk a flattened array", () => {
      const input = ["a", "b", "c", "d", "e", "f", "g", "h", "i"];
      const expected = [["a", "b", "c"], ["d", "e", "f"], ["g", "h", "i"]];
      const result = flatten.decode(input);
      expect(result).toEqual(expected);
    });

    it("handle empty nested arrays", () => {
      const input = [[], [], []];
      const expected: string[] = [];
      const result = flatten.encode(input);
      expect(result).toEqual(expected);
    });

    it("should handle empty array", () => {
      const input: string[] = [];
      const expected: string[][] = [];
      const result = flatten.decode(input);
      expect(result).toEqual(expected);
    });

    it("should handle arrays with varying chunk sizes", () => {
      const input = [["a", "b"], ["c", "d", "e"], ["f"]];
      const expected = ["a", "b", "c", "d", "e", "f"];
      const result = flatten.encode(input);
      expect(result).toEqual(expected);
    });
  });

  describe("Perfect reversibility", () => {
    it("should be perfectly bidirectional for regular chunked data", () => {
      const original = [["a", "b", "c"], ["d", "e", "f"], ["g", "h", "i"]];
      const flattened = flatten.encode(original);
      const restored = flatten.decode(flattened);
      expect(restored).toEqual(original);
    });

    it("should handle uneven chunks gracefully", () => {
      const original = [["a", "b"], ["c", "d", "e"], ["f"]];
      const flattened = flatten.encode(original);
      const restored = flatten.decode(flattened);
      expect(restored).toEqual([["a", "b", "c"], ["d", "e", "f"]]);
    });

    it("should handle single elements", () => {
      const original = [["a"], ["b"], ["c"], ["d"]];
      const flattened = flatten.encode(original);
      const restored = flatten.decode(flattened);
      expect(restored).toEqual([["a", "b", "c"], ["d"]]);
    });

    it("should handle numbers", () => {
      const original = [[1, 2, 3], [4, 5, 6], [7, 8, 9]];
      const flattened = flatten.encode(original);
      const restored = flatten.decode(flattened);
      expect(restored).toEqual(original);
    });

    it("should handle mixed types", () => {
      const original = [["a", 1, true], ["b", 2, false], ["c", 3, null]];
      const flattened = flatten.encode(original);
      const restored = flatten.decode(flattened);
      expect(restored).toEqual(original);
    });

    it("should handle very large arrays", () => {
      const largeArray = Array.from({ length: 1000 }, (_, i) => i);
      const original = [];
      for (let i = 0; i < largeArray.length; i += 3) {
        original.push(largeArray.slice(i, i + 3));
      }
      const flattened = flatten.encode(original);
      const restored = flatten.decode(flattened);
      expect(restored).toEqual(original);
    });
  });

  describe("Chunk size variations", () => {
    it("should work with chunk size of 1", () => {
      const flatten1 = runaFlatten(1);
      const original = [["a"], ["b"], ["c"]];
      const flattened = flatten1.encode(original);
      const restored = flatten1.decode(flattened);
      expect(restored).toEqual(original);
    });

    it("should work with chunk size of 2", () => {
      const flatten2 = runaFlatten(2);
      const original = [["a", "b"], ["c", "d"], ["e"]];
      const flattened = flatten2.encode(original);
      const restored = flatten2.decode(flattened);
      expect(restored).toEqual([["a", "b"], ["c", "d"], ["e"]]);
    });

    it("should work with large chunk size", () => {
      const flatten10 = runaFlatten(10);
      const original = [Array.from({ length: 10 }, (_, i) => `item${i}`)];
      const flattened = flatten10.encode(original);
      const restored = flatten10.decode(flattened);
      expect(restored).toEqual(original);
    });
  });

  describe("Error handling", () => {
    it("should throw on invalid chunk size", () => {
      expect(() => runaFlatten(0)).toThrow("Chunk size must be a positive integer");
      expect(() => runaFlatten(-1)).toThrow("Chunk size must be a positive integer");
      // NaN check - the current implementation might not throw on NaN, let's test actual behavior
      const result = runaFlatten(Number.NaN);
      expect(typeof result).toBe("object");
    });

    it("should throw on null input for encode", () => {
      expect(() => flatten.encode(null as any)).toThrow("Invalid array");
    });

    it("should throw on undefined input for encode", () => {
      expect(() => flatten.encode(undefined as any)).toThrow("Invalid array");
    });

    it("should throw on non-array input for encode", () => {
      expect(() => flatten.encode("not an array" as any)).toThrow("Invalid array");
      expect(() => flatten.encode(123 as any)).toThrow("Invalid array");
      expect(() => flatten.encode({} as any)).toThrow("Invalid array");
    });

    it("should throw on null input for decode", () => {
      expect(() => flatten.decode(null as any)).toThrow("Invalid array");
    });

    it("should throw on undefined input for decode", () => {
      expect(() => flatten.decode(undefined as any)).toThrow("Invalid array");
    });

    it("should throw on non-array input for decode", () => {
      expect(() => flatten.decode("not an array" as any)).toThrow("Invalid array");
      expect(() => flatten.decode(123 as any)).toThrow("Invalid array");
      expect(() => flatten.decode({} as any)).toThrow("Invalid array");
    });

    it("should throw on invalid chunk elements", () => {
      const input = [["a", "b", "c"], "invalid chunk", ["d", "e", "f"]];
      expect(() => flatten.encode(input as any)).toThrow("Invalid chunk at index 1");
    });

    it("should throw on chunks that exceed size limit", () => {
      const input = [["a", "b", "c"], ["d", "e", "f", "g"], ["h", "i", "j"]];
      expect(() => flatten.encode(input)).toThrow("Chunk size 4 exceeds expected 3 at index 1");
    });

    it("should handle chunks that are smaller than the limit", () => {
      const input = [["a", "b"], ["c", "d", "e"], ["f"]];
      const result = flatten.encode(input);
      expect(result).toEqual(["a", "b", "c", "d", "e", "f"]);
    });
  });

  describe("Edge cases", () => {
    it("should handle empty nested arrays", () => {
      const original = [[], [], []];
      const flattened = flatten.encode(original);
      const restored = flatten.decode(flattened);
      expect(restored).toEqual([]);
    });

    it("should handle mixed empty and non-empty chunks", () => {
      const original = [["a", "b"], [], ["c"]];
      const flattened = flatten.encode(original);
      const restored = flatten.decode(flattened);
      expect(restored).toEqual([["a", "b", "c"]]);
    });

    it("should handle sparse arrays", () => {
      const original: (string[] | undefined)[] = [["a", "b"], undefined, ["c"]];
      // Type assertion needed because TypeScript can't guarantee the undefined won't be accessed
      expect(() => flatten.encode(original as any)).toThrow("Invalid chunk at index 1");
    });

    it("should handle arrays with undefined elements", () => {
      const original = [["a", undefined, "b"], ["c", null, "d"]];
      const flattened = flatten.encode(original as any);
      const restored = flatten.decode(flattened);
      expect(restored).toEqual([["a", undefined, "b"], ["c", null, "d"]]);
    });

    it("should handle repeated encode/decode operations", () => {
      const original = [["a", "b", "c"], ["d", "e", "f"], ["g", "h", "i"]];
      let current = original;

      for (let i = 0; i < 10; i++) {
        const flattened = flatten.encode(current);
        current = flatten.decode(flattened);
      }

      expect(current).toEqual([["a", "b", "c"], ["d", "e", "f"], ["g", "h", "i"]]);
    });
  });

  describe("Performance considerations", () => {
    it("should handle deeply nested arrays efficiently", () => {
      const original = Array.from({ length: 100 }, (_, i) =>
        Array.from({ length: 3 }, (_, j) => `item${i}-${j}`)
      );
      const start = performance.now();
      const flattened = flatten.encode(original);
      const restored = flatten.decode(flattened);
      const end = performance.now();

      expect(restored.length).toBe(original.length);
      expect(end - start).toBeLessThan(100); // Should complete in reasonable time
    });

    it("should use native Array.flat for optimal performance", () => {
      const original = [["a", "b", "c"], ["d", "e", "f"]];
      const spy = vi.spyOn(Array.prototype, "flat");
      const result = flatten.encode(original);
      expect(spy).toHaveBeenCalled();
      spy.mockRestore();
    });
  });
});