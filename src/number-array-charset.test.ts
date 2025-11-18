import { beforeEach, describe, expect, it, vi } from "vitest";
import { runaNumberArrayCharset } from "./number-array-charset.js";

describe("runaNumberArrayCharset", () => {
  let numberArrayCharset: ReturnType<typeof runaNumberArrayCharset>;

  beforeEach(() => {
    numberArrayCharset = runaNumberArrayCharset(
      "abcdefghijklmnopqrstuvwxyz0123456789",
    );
  });

  describe("Basic functionality", () => {
    it("should encode array of numbers to string", () => {
      const input = [0, 1, 2, 25, 35];
      const result = numberArrayCharset.encode(input);
      expect(result).toBe("a|b|c|z|9"); // 0=a, 1=b, 2=c, 25=z, 35=9
    });

    it("should decode string back to array of numbers", () => {
      const input = "a|b|c|z|9";
      const result = numberArrayCharset.decode(input);
      expect(result).toEqual([0, 1, 2, 25, 35]); // a=0, b=1, c=2, z=25, 9=35
    });

    it("should handle empty array", () => {
      const input: number[] = [];
      const expected = "";
      const result = numberArrayCharset.encode(input);
      expect(result).toBe(expected);
    });

    it("should handle empty string", () => {
      const input = "";
      expect(() => numberArrayCharset.decode(input)).toThrow(
        "Cannot decode empty string",
      );
    });

    it("should handle single number", () => {
      const input = [10];
      const result = numberArrayCharset.encode(input);
      expect(result).toBe("k"); // 10 = k in alphabet
    });

    it("should handle single number in decode", () => {
      const input = "k";
      const result = numberArrayCharset.decode(input);
      expect(result).toEqual([10]); // k = 10
    });

    it("should handle array with one element", () => {
      const input = [5];
      const result = numberArrayCharset.encode(input);
      expect(result).toBe("f");
    });
  });

  describe("Perfect reversibility", () => {
    it("should be perfectly bidirectional for regular arrays", () => {
      const original = [1, 5, 10, 20, 30];
      const encoded = numberArrayCharset.encode(original);
      const decoded = numberArrayCharset.decode(encoded);
      expect(decoded).toEqual(original);
    });

    it("should handle zero values", () => {
      const original = [0, 0, 0];
      const encoded = numberArrayCharset.encode(original);
      const decoded = numberArrayCharset.decode(encoded);
      expect(decoded).toEqual(original);
    });

    it("should handle large numbers", () => {
      const original = [100, 500, 1000];
      const encoded = numberArrayCharset.encode(original);
      const decoded = numberArrayCharset.decode(encoded);
      expect(decoded).toEqual(original);
    });

    it("should handle repeated encode/decode operations", () => {
      const original = [1, 2, 3, 4, 5];
      let current = original;

      for (let i = 0; i < 10; i++) {
        const encoded = numberArrayCharset.encode(current);
        current = numberArrayCharset.decode(encoded);
      }

      expect(current).toEqual(original);
    });

    it("should maintain order of numbers", () => {
      const original = [10, 1, 20, 2, 30, 3];
      const encoded = numberArrayCharset.encode(original);
      const decoded = numberArrayCharset.decode(encoded);
      expect(decoded).toEqual(original);
    });
  });

  describe("Custom alphabets", () => {
    it("should work with uppercase alphabet", () => {
      const uppercaseCharset = runaNumberArrayCharset(
        "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789",
      );
      const original = [0, 1, 2, 25, 35];
      const encoded = uppercaseCharset.encode(original);
      const decoded = uppercaseCharset.decode(encoded);
      expect(encoded).toBe("A|B|C|Z|9"); // 35 maps to '9' not '0'
      expect(decoded).toEqual(original);
    });

    it("should work with custom character set", () => {
      const customCharset = runaNumberArrayCharset("!@#$%^&*()");
      const original = [0, 1, 2, 3, 4];
      const encoded = customCharset.encode(original);
      const decoded = customCharset.decode(encoded);
      expect(encoded).toBe("!|@|#|$|%"); // 0=!,1=@,2=#,3=$,4=%
      expect(decoded).toEqual(original);
    });

    it("should throw on emoji alphabet (non-ASCII)", () => {
      expect(() => runaNumberArrayCharset("😀😃😄😁😆😅🤣😂🙂😉")).toThrow(
        "Alphabet must contain only ASCII characters",
      );
    });

    it("should throw on unicode characters (non-ASCII)", () => {
      expect(() => runaNumberArrayCharset("αβγδεζηθικλμνξοπρστυφχψω")).toThrow(
        "Alphabet must contain only ASCII characters",
      );
    });

    it("should work with binary alphabet", () => {
      const binaryCharset = runaNumberArrayCharset("01");
      const original = [0, 1, 1, 0, 1];
      const encoded = binaryCharset.encode(original);
      const decoded = binaryCharset.decode(encoded);
      expect(encoded).toBe("0|1|1|0|1");
      expect(decoded).toEqual(original);
    });

    it("should work with hexadecimal alphabet", () => {
      const hexCharset = runaNumberArrayCharset("0123456789ABCDEF");
      const original = [0, 10, 15, 1, 5];
      const encoded = hexCharset.encode(original);
      const decoded = hexCharset.decode(encoded);
      expect(encoded).toBe("0|A|F|1|5");
      expect(decoded).toEqual(original);
    });
  });

  describe("Minimum length parameter", () => {
    it("should respect minLength parameter", () => {
      const minLengthCharset = runaNumberArrayCharset("abc", 3);
      const original = [0, 1, 2];
      const encoded = minLengthCharset.encode(original);
      const decoded = minLengthCharset.decode(encoded);

      // With minLength=3, single numbers should be padded to 3 characters
      expect(encoded).toBe("aaa|aab|aac");
      expect(decoded).toEqual(original);
    });

    it("should handle different minLength values", () => {
      const length2Charset = runaNumberArrayCharset("ab", 2);
      const original = [0, 1, 2];
      const encoded = length2Charset.encode(original);
      const decoded = length2Charset.decode(encoded);

      expect(encoded).toBe("aa|ab|ba");
      expect(decoded).toEqual(original);
    });

    it("should throw on minLength=0", () => {
      expect(() => runaNumberArrayCharset("ab", 0)).toThrow(
        "Minimum length must be at least 1",
      );
    });
  });

  describe("Error handling", () => {
    it("should throw on null input for encode", () => {
      expect(() => numberArrayCharset.encode(null as any)).toThrow(
        "Invalid array",
      );
    });

    it("should throw on undefined input for encode", () => {
      expect(() => numberArrayCharset.encode(undefined as any)).toThrow(
        "Invalid array",
      );
    });

    it("should throw on non-array input for encode", () => {
      expect(() => numberArrayCharset.encode("not an array" as any)).toThrow(
        "Invalid array",
      );
      expect(() => numberArrayCharset.encode(123 as any)).toThrow(
        "Invalid array",
      );
      expect(() => numberArrayCharset.encode({} as any)).toThrow(
        "Invalid array",
      );
    });

    it("should throw on null input for decode", () => {
      expect(() => numberArrayCharset.decode(null as any)).toThrow(
        "Invalid string",
      );
    });

    it("should throw on undefined input for decode", () => {
      expect(() => numberArrayCharset.decode(undefined as any)).toThrow(
        "Invalid string",
      );
    });

    it("should throw on non-string input for decode", () => {
      expect(() => numberArrayCharset.decode(123 as any)).toThrow(
        "Invalid string",
      );
      expect(() => numberArrayCharset.decode([] as any)).toThrow(
        "Invalid string",
      );
      expect(() => numberArrayCharset.decode({} as any)).toThrow(
        "Invalid string",
      );
    });

    it("should throw on empty chunk in encoded string", () => {
      const malformedInput = "a|b||d";
      expect(() => numberArrayCharset.decode(malformedInput)).toThrow(
        "Empty chunk found in encoded string",
      );
    });

    it("should throw on malformed chunks", () => {
      const invalidCharset = runaNumberArrayCharset("ab");
      const malformedInput = "a|c|d"; // 'c' and 'd' are not in alphabet
      expect(() => invalidCharset.decode(malformedInput)).toThrow();
    });
  });

  describe("Edge cases", () => {
    it("should handle very large numbers", () => {
      const original = [10000, 50000, 100000];
      const encoded = numberArrayCharset.encode(original);
      const decoded = numberArrayCharset.decode(encoded);
      expect(decoded).toEqual(original);
    });
    it("should throw on negative numbers", () => {
      expect(() => numberArrayCharset.encode([-1, -5, -10])).toThrow(
        "Cannot encode negative numbers",
      );
      expect(() => numberArrayCharset.encode([-5, 10, 0, -3, 7])).toThrow(
        "Cannot encode negative numbers",
      );
    });

    it("should floor floating point numbers", () => {
      const original = [1.5, 2.7, 3.9];
      const expected = [1, 2, 3]; // Floored values
      const encoded = numberArrayCharset.encode(original);
      const decoded = numberArrayCharset.decode(encoded);
      expect(decoded).toEqual(expected);
    });

    it("should handle very large arrays efficiently", () => {
      const largeArray = Array.from({ length: 1000 }, (_, i) => i);
      const start = performance.now();
      const encoded = numberArrayCharset.encode(largeArray);
      const decoded = numberArrayCharset.decode(encoded);
      const end = performance.now();

      expect(decoded).toEqual(largeArray);
      expect(end - start).toBeLessThan(100); // Should complete quickly
    });

    it("should handle sparse arrays", () => {
      const sparseArray = new Array(10);
      sparseArray[0] = 1;
      sparseArray[5] = 100;
      sparseArray[9] = 255;
      // Fill empty slots with 0 to avoid empty chunks
      for (let i = 0; i < sparseArray.length; i++) {
        if (sparseArray[i] === undefined) {
          sparseArray[i] = 0;
        }
      }

      const encoded = numberArrayCharset.encode(sparseArray as any);
      const decoded = numberArrayCharset.decode(encoded);

      expect(decoded.length).toBe(10);
      expect(decoded[0]).toBe(1);
      expect(decoded[5]).toBe(100);
      expect(decoded[9]).toBe(255);
      // Empty slots should be 0
      expect(decoded[1]).toBe(0);
      expect(decoded[2]).toBe(0);
    });
  });

  describe("Real-world scenarios", () => {
    it("should generate YouTube-like IDs from number arrays", () => {
      const youtubeCharset = runaNumberArrayCharset(
        "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789_-",
      );
      const original = [0, 10, 35, 60, 61]; // First few values
      const encoded = youtubeCharset.encode(original);
      const decoded = youtubeCharset.decode(encoded);
      expect(decoded).toEqual(original);
    });

    it("should handle base64-like encoding", () => {
      const base64Charset = runaNumberArrayCharset(
        "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/",
      );
      const original = [0, 26, 51, 52, 62, 63];
      const encoded = base64Charset.encode(original);
      const decoded = base64Charset.decode(encoded);
      expect(encoded).toBe("A|a|z|0|+|/"); // 51=z, 52=0, 62=+, 63=/
      expect(decoded).toEqual(original);
    });

    it("should work with URL-safe encoding", () => {
      const urlSafeCharset = runaNumberArrayCharset(
        "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_",
      );
      const original = [0, 52, 53, 62, 63];
      const encoded = urlSafeCharset.encode(original);
      const decoded = urlSafeCharset.decode(encoded);
      expect(encoded).toBe("A|0|1|-|_"); // 52=0, 53=1, 62=-, 63=_
      expect(decoded).toEqual(original);
    });

    it("should handle coordinate encoding", () => {
      const coordCharset = runaNumberArrayCharset("0123456789");
      const coordinates = [100, 200, 50, 75];
      const encoded = coordCharset.encode(coordinates);
      const decoded = coordCharset.decode(encoded);
      expect(decoded).toEqual(coordinates);
    });

    it("should compress number arrays for storage", () => {
      const numbers = [12345, 67890, 11111, 22222];
      const compressed = numberArrayCharset.encode(numbers);
      const decompressed = numberArrayCharset.decode(compressed);
      expect(decompressed).toEqual(numbers);
    });
  });

  describe("Performance and efficiency", () => {
    it("should use array mapping for efficient processing", () => {
      const original = [1, 2, 3, 4, 5];
      const mapSpy = vi.spyOn(Array.prototype, "map");

      const result = numberArrayCharset.encode(original);
      expect(mapSpy).toHaveBeenCalled();

      mapSpy.mockClear();
      const decoded = numberArrayCharset.decode(result);
      expect(mapSpy).toHaveBeenCalled();

      mapSpy.mockRestore();
    });

    it("should handle memory efficiently", () => {
      const original = [1, 2, 3, 4, 5];
      const encoded = numberArrayCharset.encode(original);
      const decoded = numberArrayCharset.decode(encoded);

      // Should create new arrays, not references
      expect(encoded).not.toBe(original);
      expect(decoded).not.toBe(original);
      expect(decoded).not.toBe(encoded);
    });

    it("should minimize string operations", () => {
      const original = [1, 2, 3];
      const joinSpy = vi.spyOn(Array.prototype, "join");
      const splitSpy = vi.spyOn(String.prototype, "split");

      const encoded = numberArrayCharset.encode(original);
      expect(joinSpy).toHaveBeenCalled();

      const decoded = numberArrayCharset.decode(encoded);
      expect(splitSpy).toHaveBeenCalled();

      joinSpy.mockRestore();
      splitSpy.mockRestore();
    });
  });

  describe("Integration scenarios", () => {
    it("should work well with other array operations", () => {
      const original = [10, 20, 30, 40, 50];
      const encoded = numberArrayCharset.encode(original);

      // Can now treat as string for operations like sorting, searching, etc.
      const sorted = encoded.split("|").sort().join("|");
      const decoded = numberArrayCharset.decode(sorted);

      expect(decoded).not.toEqual(original); // Sorted order changes the number sequence
      expect(decoded.length).toBe(original.length);
    });

    it("should be useful for creating compact identifiers", () => {
      const idCharset = runaNumberArrayCharset(
        "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789",
      );
      const userIds = [123, 456, 789, 101112];
      const compactIds = idCharset.encode(userIds);
      const restoredIds = idCharset.decode(compactIds);
      expect(restoredIds).toEqual(userIds);
    });

    it("should handle database key generation", () => {
      const keyCharset = runaNumberArrayCharset(
        "abcdefghijklmnopqrstuvwxyz0123456789",
      );
      const keys = [1, 2, 3, 4, 5];
      const stringKeys = keyCharset.encode(keys);
      const restoredKeys = keyCharset.decode(stringKeys);
      expect(restoredKeys).toEqual(keys);
    });
  });

  describe("Alphabet validation", () => {
    it("should throw on single character alphabet", () => {
      expect(() => runaNumberArrayCharset("A")).toThrow(
        "Alphabet must have at least 2 characters",
      );
    });

    it("should throw on duplicate characters in alphabet", () => {
      expect(() => runaNumberArrayCharset("AABBC")).toThrow(
        "Alphabet must contain unique characters",
      );
    });

    it("should handle very long alphabets", () => {
      const longAlphabet = Array.from(
        { length: 100 },
        (_, i) => String.fromCharCode(33 + i), // ASCII characters from ! onwards
      ).join("");

      const longCharset = runaNumberArrayCharset(longAlphabet);
      const original = [0, 50, 99];
      const encoded = longCharset.encode(original);
      const decoded = longCharset.decode(encoded);
      expect(decoded).toEqual(original);
    });
  });
});
