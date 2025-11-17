import { beforeEach, describe, expect, it, vi } from "vitest";
import { runaArraySplit } from "./array-split.js";

describe("runaArraySplit", () => {
  let arraySplit: ReturnType<typeof runaArraySplit<string>>;

  beforeEach(() => {
    arraySplit = runaArraySplit<string>(3);
  });

  describe("Basic functionality", () => {
    it("should split array into chunks", () => {
      const input = ["a", "b", "c", "d", "e", "f", "g", "h", "i"];
      const expected = [["a", "b", "c"], ["d", "e", "f"], ["g", "h", "i"]];
      const result = arraySplit.encode(input);
      expect(result).toEqual(expected);
    });

    it("should join chunked arrays back to flat array", () => {
      const input = [["a", "b", "c"], ["d", "e", "f"], ["g", "h", "i"]];
      const expected = ["a", "b", "c", "d", "e", "f", "g", "h", "i"];
      const result = arraySplit.decode(input);
      expect(result).toEqual(expected);
    });

    it("should handle empty array", () => {
      const input: string[] = [];
      const expected: string[][] = [];
      const result = arraySplit.encode(input);
      expect(result).toEqual(expected);
    });

    it("should handle empty chunked array", () => {
      const input: string[][] = [];
      const expected: string[] = [];
      const result = arraySplit.decode(input);
      expect(result).toEqual(expected);
    });

    it("should handle array smaller than chunk size", () => {
      const input = ["a", "b"];
      const expected = [["a", "b"]];
      const result = arraySplit.encode(input);
      expect(result).toEqual(expected);
    });

    it("should handle array exactly divisible by chunk size", () => {
      const input = ["a", "b", "c", "d", "e", "f"];
      const expected = [["a", "b", "c"], ["d", "e", "f"]];
      const result = arraySplit.encode(input);
      expect(result).toEqual(expected);
    });

    it("should handle array not exactly divisible by chunk size", () => {
      const input = ["a", "b", "c", "d", "e", "f", "g", "h"];
      const expected = [["a", "b", "c"], ["d", "e", "f"], ["g", "h"]];
      const result = arraySplit.encode(input);
      expect(result).toEqual(expected);
    });
  });

  describe("Perfect reversibility", () => {
    it("should be perfectly bidirectional for regular arrays", () => {
      const original = ["x", "y", "z", "1", "2", "3", "a", "b", "c"];
      const chunked = arraySplit.encode(original);
      const restored = arraySplit.decode(chunked);
      expect(restored).toEqual(original);
    });

    it("should handle arrays with single element", () => {
      const original = ["single"];
      const chunked = arraySplit.encode(original);
      const restored = arraySplit.decode(chunked);
      expect(restored).toEqual(original);
    });

    it("should handle arrays with empty strings", () => {
      const original = ["", "a", "", "b", ""];
      const chunked = arraySplit.encode(original);
      const restored = arraySplit.decode(chunked);
      expect(restored).toEqual(original);
    });

    it("should handle arrays with special characters", () => {
      const original = ["🚀", "🌟", "💫", "⭐", "✨"];
      const chunked = arraySplit.encode(original);
      const restored = arraySplit.decode(chunked);
      expect(restored).toEqual(original);
    });

    it("should work with different data types", () => {
      const numberSplit = runaArraySplit<number>(2);
      const original = [1, 2, 3, 4, 5, 6, 7];
      const chunked = numberSplit.encode(original);
      const restored = numberSplit.decode(chunked);
      expect(restored).toEqual(original);
    });

    it("should work with complex objects", () => {
      interface TestObject {
        id: number;
        name: string;
      }
      const objectSplit = runaArraySplit<TestObject>(2);
      const original = [
        { id: 1, name: "first" },
        { id: 2, name: "second" },
        { id: 3, name: "third" },
        { id: 4, name: "fourth" },
      ];
      const chunked = objectSplit.encode(original);
      const restored = objectSplit.decode(chunked);
      expect(restored).toEqual(original);
    });

    it("should handle repeated encode/decode operations", () => {
      const original = ["a", "b", "c", "d", "e", "f"];
      let current = original;

      for (let i = 0; i < 10; i++) {
        const chunked = arraySplit.encode(current);
        current = arraySplit.decode(chunked);
      }

      expect(current).toEqual(original);
    });
  });

  describe("Different chunk sizes", () => {
    it("should work with chunk size of 1", () => {
      const split1 = runaArraySplit<string>(1);
      const original = ["a", "b", "c"];
      const expected = [["a"], ["b"], ["c"]];
      const result = split1.encode(original);
      expect(result).toEqual(expected);
    });

    it("should work with chunk size of 2", () => {
      const split2 = runaArraySplit<string>(2);
      const original = ["a", "b", "c", "d", "e"];
      const expected = [["a", "b"], ["c", "d"], ["e"]];
      const result = split2.encode(original);
      expect(result).toEqual(expected);
    });

    it("should work with large chunk size", () => {
      const split10 = runaArraySplit<string>(10);
      const original = ["a", "b", "c", "d", "e"];
      const expected = [["a", "b", "c", "d", "e"]];
      const result = split10.encode(original);
      expect(result).toEqual(expected);
    });
  });

  describe("Error handling", () => {
    it("should throw on invalid chunk size", () => {
      expect(() => runaArraySplit(0)).toThrow("Chunk size must be a positive integer");
      expect(() => runaArraySplit(-1)).toThrow("Chunk size must be a positive integer");
      expect(() => runaArraySplit(-5)).toThrow("Chunk size must be a positive integer");
    });

    it("should throw on null input for encode", () => {
      expect(() => arraySplit.encode(null as any)).toThrow("Invalid array");
    });

    it("should throw on undefined input for encode", () => {
      expect(() => arraySplit.encode(undefined as any)).toThrow("Invalid array");
    });

    it("should throw on non-array input for encode", () => {
      expect(() => arraySplit.encode("not an array" as any)).toThrow("Invalid array");
      expect(() => arraySplit.encode(123 as any)).toThrow("Invalid array");
      expect(() => arraySplit.encode({} as any)).toThrow("Invalid array");
    });

    it("should throw on null input for decode", () => {
      expect(() => arraySplit.decode(null as any)).toThrow("Invalid array");
    });

    it("should throw on undefined input for decode", () => {
      expect(() => arraySplit.decode(undefined as any)).toThrow("Invalid array");
    });

    it("should throw on non-array input for decode", () => {
      expect(() => arraySplit.decode("not an array" as any)).toThrow("Invalid array");
      expect(() => arraySplit.decode(123 as any)).toThrow("Invalid array");
      expect(() => arraySplit.decode({} as any)).toThrow("Invalid array");
    });

    it("should throw on invalid chunk elements", () => {
      const input = [["a", "b", "c"], "invalid chunk", ["d", "e", "f"]];
      expect(() => arraySplit.decode(input as any)).toThrow("Invalid array");
    });

    it("should throw on chunks that exceed size limit", () => {
      const input = [["a", "b", "c"], ["d", "e", "f", "g"]]; // Second chunk has 4 elements, limit is 3
      expect(() => arraySplit.decode(input)).toThrow("Array length exceeds chunkSize");
    });

    it("should handle chunks that are smaller than the limit", () => {
      const input = [["a", "b"], ["c"], ["d", "e", "f"]];
      const result = arraySplit.decode(input);
      expect(result).toEqual(["a", "b", "c", "d", "e", "f"]);
    });
  });

  describe("Edge cases", () => {
    it("should handle arrays with null and undefined elements", () => {
      const original = ["a", null, "b", undefined, "c"];
      const chunked = arraySplit.encode(original as any);
      const restored = arraySplit.decode(chunked);
      expect(restored).toEqual(original);
    });

    it("should handle arrays with mixed types", () => {
      const mixedSplit = runaArraySplit<any>(2);
      const original = ["string", 123, true, null, undefined, { key: "value" }];
      const chunked = mixedSplit.encode(original);
      const restored = mixedSplit.decode(chunked);
      expect(restored).toEqual(original);
    });

    it("should handle empty chunks within arrays", () => {
      const input = [["a", "b"], [], ["c", "d"]];
      const result = arraySplit.decode(input);
      expect(result).toEqual(["a", "b", "c", "d"]);
    });

    it("should handle sparse arrays", () => {
      const original = Array.from({ length: 10 }, (_, i) => i === 5 ? undefined : i);
      const chunked = arraySplit.encode(original as any);
      const restored = arraySplit.decode(chunked);
      expect(restored).toEqual(original);
    });

    it("should handle very large arrays", () => {
      const largeArray = Array.from({ length: 1000 }, (_, i) => `item${i}`);
      const chunked = arraySplit.encode(largeArray);
      const restored = arraySplit.decode(chunked);
      expect(restored).toEqual(largeArray);
      expect(chunked.length).toBe(Math.ceil(1000 / 3)); // Should have ~334 chunks
    });

    it("should handle single element arrays", () => {
      const singleSplit = runaArraySplit<string>(1);
      const original = ["single"];
      const chunked = singleSplit.encode(original);
      const restored = singleSplit.decode(chunked);
      expect(chunked).toEqual([["single"]]);
      expect(restored).toEqual(original);
    });
  });

  describe("Performance and efficiency", () => {
    it("should use native array methods for optimal performance", () => {
      const original = ["a", "b", "c", "d", "e", "f", "g", "h", "i"];
      const spy = vi.spyOn(Array.prototype, "slice");
      const result = arraySplit.encode(original);
      expect(spy).toHaveBeenCalled();
      spy.mockRestore();
    });

    it("should handle deeply nested structures efficiently", () => {
      const deepArray = Array.from({ length: 100 }, (_, i) => ({ id: i, data: `item${i}` }));
      const objectSplit = runaArraySplit<any>(5);
      const start = performance.now();
      const chunked = objectSplit.encode(deepArray);
      const restored = objectSplit.decode(chunked);
      const end = performance.now();

      expect(restored).toEqual(deepArray);
      expect(end - start).toBeLessThan(50); // Should complete quickly
    });

    it("should maintain array order perfectly", () => {
      const original = Array.from({ length: 100 }, (_, i) => `item${i}`);
      const chunked = arraySplit.encode(original);
      const restored = arraySplit.decode(chunked);

      // Verify each element is in the correct position
      for (let i = 0; i < original.length; i++) {
        expect(restored[i]).toBe(original[i]);
      }
    });
  });

  describe("Type safety", () => {
    it("should maintain type information through transformations", () => {
      type Person = { name: string; age: number };
      const personSplit = runaArraySplit<Person>(2);

      const original: Person[] = [
        { name: "Alice", age: 30 },
        { name: "Bob", age: 25 },
        { name: "Charlie", age: 35 },
      ];

      const chunked = personSplit.encode(original);
      const restored = personSplit.decode(chunked);

      // TypeScript should infer these types correctly
      expect(Array.isArray(chunked)).toBe(true);
      expect(Array.isArray(restored)).toBe(true);
      expect(restored).toEqual(original);
    });

    it("should work with generic constraints", () => {
      interface Identifiable {
        id: string;
      }

      const identifiableSplit = runaArraySplit<Identifiable>(1);
      const original: Identifiable[] = [
        { id: "a" },
        { id: "b" },
        { id: "c" },
      ];

      const chunked = identifiableSplit.encode(original);
      const restored = identifiableSplit.decode(chunked);
      expect(restored).toEqual(original);
    });
  });
});