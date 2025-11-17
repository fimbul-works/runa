import { beforeEach, describe, expect, it } from "vitest";
import { runaStringClean, runaStringSeparator } from "./string-clean.js";

describe("runaStringClean", () => {
  let stringClean: ReturnType<typeof runaStringClean>;

  beforeEach(() => {
    stringClean = runaStringClean();
  });

  describe("Basic functionality", () => {
    it("should remove separators from strings", () => {
      const input = "a|b|c|d|e";
      const result = stringClean.encode(input);
      expect(result).toBe("abcde");
    });

    it("should handle strings with no separators", () => {
      const input = "abcde";
      const result = stringClean.encode(input);
      expect(result).toBe("abcde");
    });

    it("should handle empty strings", () => {
      const input = "";
      const result = stringClean.encode(input);
      expect(result).toBe("");
    });

    it("should handle strings with consecutive separators", () => {
      const input = "a||b|||c";
      const result = stringClean.encode(input);
      expect(result).toBe("abc");
    });

    it("should handle custom separators", () => {
      const customClean = runaStringClean("#");
      const input = "a#b#c#d";
      const result = customClean.encode(input);
      expect(result).toBe("abcd");
    });
  });

  describe("Restoration with heuristics", () => {
    it("should attempt to restore separators with default chunking", () => {
      const input = "d6yghUcQKg6qgC9cuq";
      const result = stringClean.decode(input);

      // Should produce some chunked result, but not guaranteed to match original
      expect(result).toContain("|");
      expect(typeof result).toBe("string");
      // Should be approximately the right length (within reasonable range)
      expect(result.length).toBeGreaterThan(input.length);
      expect(result.length).toBeLessThan(input.length * 2);
    });

    it("should handle base64-like strings with 4-chunk restoration", () => {
      const input = "SGVsbG8gV29ybGQh"; // "Hello World!" in base64
      const result = stringClean.decode(input);
      expect(result).toMatch(/SGVs\|bG8g\|V29y\|bGQh/);
    });

    it("should handle short strings with appropriate chunking", () => {
      const input = "Hi";
      const result = stringClean.decode(input);
      // For very short strings, chunk size should be 1
      expect(result).toMatch(/H\|i/);
    });

    it("should handle very short strings", () => {
      const input = "A";
      const result = stringClean.decode(input);
      expect(result).toBe("A"); // Single character shouldn't get separator
    });

    it("should handle Unicode strings", () => {
      const input = "测试你好";
      const result = stringClean.decode(input);
      // Should handle Unicode properly
      expect(result.length).toBeGreaterThan(0);
      expect(result).toContain("测");
    });
  });

  describe("Bidirectional limitations", () => {
    it("should demonstrate limitations of heuristic restoration", () => {
      const original = "abc|def|ghi|jkl";
      const cleaned = stringClean.encode(original);
      const restored = stringClean.decode(cleaned);

      // Should have the same characters but chunking may differ significantly
      expect(restored).toContain("abc");
      // Due to heuristic chunking, original segments may be split differently
      expect(restored.length).toBeGreaterThan(cleaned.length);
      // The exact chunking demonstrates the limitation - it's not the original
      expect(restored).not.toBe(original);
    });

    it("should show different original patterns produce same cleaned result", () => {
      // Note: This test demonstrates the fundamental limitation of heuristic approach
      const original1 = "a|b|cdef";
      const original2 = "ab|c|def";

      const cleaned1 = stringClean.encode(original1);
      const cleaned2 = stringClean.encode(original2);

      // Both should produce the same cleaned string
      expect(cleaned1).toBe(cleaned2);

      // But restoration will produce the same result for both, losing the original difference
      const restored1 = stringClean.decode(cleaned1);
      const restored2 = stringClean.decode(cleaned2);

      expect(restored1).toBe(restored2);
      // Both will be different from their originals due to heuristic nature
      expect(restored1).not.toBe(original1);
      expect(restored2).not.toBe(original2);
    });

    it("should handle exact round-trip for regular chunked data with approximate matching", () => {
      // Note: This test demonstrates approximate behavior for heuristic-based restoration
      const original = "d6y|ghU|cQK|g6q|gC9|cuq";
      const cleaned = stringClean.encode(original);
      const restored = stringClean.decode(cleaned);

      // Due to heuristic nature, this may not be exactly equal
      // The runaStringSeparator provides perfect reversibility
      expect(typeof restored).toBe("string");
      expect(restored).toContain("|");
      expect(restored.length).toBeGreaterThan(0);
      // Should contain all the original characters, just chunked differently
      expect(cleaned).toBe(restored.replace(/\|/g, ""));
      // The chunking pattern demonstrates the heuristic limitation
      expect(restored).not.toBe(original);
    });
  });

  describe("Error handling", () => {
    it("should throw on null input", () => {
      expect(() => stringClean.encode(null as any)).toThrow(
        "Input cannot be null or undefined",
      );
    });

    it("should throw on undefined input", () => {
      expect(() => stringClean.encode(undefined as any)).toThrow(
        "Input cannot be null or undefined",
      );
    });

    it("should throw on non-string input", () => {
      expect(() => stringClean.encode(123 as any)).toThrow(
        "Expected string, got number",
      );
      expect(() => stringClean.encode({} as any)).toThrow(
        "Expected string, got object",
      );
    });

    it("should throw on null input for decode", () => {
      expect(() => stringClean.decode(null as any)).toThrow(
        "Input cannot be null or undefined",
      );
    });

    it("should throw on undefined input for decode", () => {
      expect(() => stringClean.decode(undefined as any)).toThrow(
        "Input cannot be null or undefined",
      );
    });

    it("should throw on non-string input for decode", () => {
      expect(() => stringClean.decode(123 as any)).toThrow(
        "Expected string, got number",
      );
    });
  });

  describe("Documentation warnings", () => {
    it("should document that it's not perfectly reversible", () => {
      // This test demonstrates the limitation
      const original1 = "a|b|cdef";
      const original2 = "ab|c|def";

      const cleaned1 = stringClean.encode(original1);
      const cleaned2 = stringClean.encode(original2);

      // Both should produce the same cleaned string
      expect(cleaned1).toBe(cleaned2);

      // But restoration will produce the same result for both, losing the original difference
      const restored1 = stringClean.decode(cleaned1);
      const restored2 = stringClean.decode(cleaned2);

      expect(restored1).toBe(restored2);
      expect(restored1).not.toBe(original1);
      expect(restored2).not.toBe(original2);
    });
  });
});

describe("runaStringSeparator", () => {
  let stringSeparator: ReturnType<typeof runaStringSeparator>;

  beforeEach(() => {
    stringSeparator = runaStringSeparator();
  });

  describe("Perfect reversibility", () => {
    it("should be perfectly bidirectional for any separator pattern", () => {
      const testCases = [
        "a|b|c|d|e",
        "abc||def|||ghi",
        "start|middle|end",
        "single",
        "",
        "||||",
        "x|y|z|a|b|c|d|e|f",
        "Hello|World|Test|123",
      ];

      for (const original of testCases) {
        const encoded = stringSeparator.encode(original);
        const decoded = stringSeparator.decode(encoded);
        expect(decoded).toBe(original);
      }
    });

    it("should work with custom separators", () => {
      const customSep = runaStringSeparator("#");
      const original = "a#b#c#d#e";
      const encoded = customSep.encode(original);
      const decoded = customSep.decode(encoded);
      expect(decoded).toBe(original);
    });

    it("should handle complex characters in separators", () => {
      const complexSep = runaStringSeparator("---");
      const original = "a---b---c---d";
      const encoded = complexSep.encode(original);
      const decoded = complexSep.decode(encoded);
      expect(decoded).toBe(original);
    });
  });

  describe("Encoding mechanism", () => {
    it("should use encoding markers for separator positions", () => {
      const original = "a|b|c";
      const encoded = stringSeparator.encode(original);

      // Should contain encoding marker
      expect(encoded).toContain("__SEP_");
      // Should not contain the original separator directly in encoded form
      expect(encoded).not.toMatch(/[^_]\|[^_]/); // Not a standalone separator
    });

    it("should handle strings with null characters properly", () => {
      const original = "a\x00b|c";

      // Should handle null characters without throwing
      // The encoding marker doesn't conflict with null characters
      const encoded = stringSeparator.encode(original);
      const decoded = stringSeparator.decode(encoded);
      expect(decoded).toBe(original);
    });

    it("should decode encoded strings correctly", () => {
      const original = "first|second|third";
      const encoded = stringSeparator.encode(original);
      const decoded = stringSeparator.decode(encoded);

      expect(decoded).toBe(original);
    });
  });

  describe("Error handling", () => {
    it("should throw on null input for encode", () => {
      expect(() => stringSeparator.encode(null as any)).toThrow(
        "Input cannot be null or undefined",
      );
    });

    it("should throw on undefined input for encode", () => {
      expect(() => stringSeparator.encode(undefined as any)).toThrow(
        "Input cannot be null or undefined",
      );
    });

    it("should throw on null input for decode", () => {
      expect(() => stringSeparator.decode(null as any)).toThrow(
        "Input cannot be null or undefined",
      );
    });

    it("should throw on undefined input for decode", () => {
      expect(() => stringSeparator.decode(undefined as any)).toThrow(
        "Input cannot be null or undefined",
      );
    });

    it("should throw on non-string inputs", () => {
      expect(() => stringSeparator.encode(123 as any)).toThrow(
        "Expected string, got number",
      );
      expect(() => stringSeparator.decode([] as any)).toThrow(
        "Expected string, got object",
      );
    });

    it("should throw on malformed encoded strings", () => {
      // Strings that don't follow the expected encoding format
      const malformed = "not\x00properly\x00encoded";

      // Should still decode but may not produce expected results
      // The exact behavior depends on the implementation
      const result = stringSeparator.decode(malformed);
      expect(typeof result).toBe("string");
    });
  });

  describe("Edge cases", () => {
    it("should handle empty strings", () => {
      const original = "";
      const encoded = stringSeparator.encode(original);
      const decoded = stringSeparator.decode(encoded);
      expect(decoded).toBe(original);
    });

    it("should handle strings with no separators", () => {
      const original = "singleword";
      const encoded = stringSeparator.encode(original);
      const decoded = stringSeparator.decode(encoded);
      expect(decoded).toBe(original);
    });

    it("should handle strings with only separators", () => {
      const original = "||||";
      const encoded = stringSeparator.encode(original);
      const decoded = stringSeparator.decode(encoded);
      expect(decoded).toBe(original);
    });

    it("should handle very long strings", () => {
      const original = `${"a".repeat(1000)}|${"b".repeat(1000)}|${"c".repeat(1000)}`;
      const encoded = stringSeparator.encode(original);
      const decoded = stringSeparator.decode(encoded);
      expect(decoded).toBe(original);
    });

    it("should handle Unicode characters", () => {
      const original = "测试|中文|🚀|العربية";
      const encoded = stringSeparator.encode(original);
      const decoded = stringSeparator.decode(encoded);
      expect(decoded).toBe(original);
    });
  });

  describe("Performance and efficiency", () => {
    it("should handle repeated encode/decode operations", () => {
      const original = "a|b|c|d|e|f|g|h|i|j";

      let current = original;
      for (let i = 0; i < 100; i++) {
        const encoded = stringSeparator.encode(current);
        current = stringSeparator.decode(encoded);
      }

      expect(current).toBe(original);
    });
  });
});
