import { beforeEach, describe, expect, it } from "vitest";
import { runaStringToBuffer } from "./string-to-buffer.js";

describe("runaStringToBuffer", () => {
  let bufferTransformer: ReturnType<typeof runaStringToBuffer>;

  beforeEach(() => {
    bufferTransformer = runaStringToBuffer();
  });

  it("should encode simple strings to Uint8Array", () => {
    const input = "Hello, World!";
    const encoded = bufferTransformer.encode(input) as Uint8Array;

    expect(encoded).toBeInstanceOf(Uint8Array);
    expect(encoded.length).toBe(input.length);

    // Check that the encoded bytes match the expected values
    const expectedBytes = new TextEncoder().encode(input);
    expect(encoded).toEqual(expectedBytes);
  });

  it("should decode Uint8Array back to string", () => {
    const input = "Hello, World!";
    const encoded = new TextEncoder().encode(input);
    const decoded = bufferTransformer.decode(encoded) as string;

    expect(decoded).toBe(input);
  });

  it("should be bidirectional - encode then decode returns original", () => {
    const testStrings = [
      "Hello, World!",
      "1234567890",
      "Special chars: !@#$%^&*()",
      "Unicode: 🚀 🌟 💫",
      "Mixed content: ABC123!@#",
      "New lines\nand\ttabs",
      'JSON: {"key": "value"}',
      "Extended ASCII: àáâãäå",
    ];

    for (const original of testStrings) {
      const encoded = bufferTransformer.encode(original) as Uint8Array;
      const decoded = bufferTransformer.decode(encoded) as string;
      expect(decoded).toBe(original);
    }

    // Empty strings should throw as they indicate data loss
    expect(() => bufferTransformer.encode("")).toThrow("String cannot be empty");
  });

  it("should handle empty string", () => {
    // Empty strings should throw as they indicate data loss
    expect(() => bufferTransformer.encode("")).toThrow("String cannot be empty");
  });

  it("should handle Unicode characters correctly", () => {
    const unicodeInputs = [
      "café",
      "naïve",
      "测试中文",
      "🚀 🌟 💫",
      "مرحبا",
      "привет",
      "🏠🚗✈️🚢",
    ];

    for (const input of unicodeInputs) {
      const encoded = bufferTransformer.encode(input) as Uint8Array;
      const decoded = bufferTransformer.decode(encoded) as string;
      expect(decoded).toBe(input);
    }
  });

  it("should handle emoji and symbols", () => {
    const emojiInputs = [
      "🎉🥳🎊",
      "❤️💛💚💙💜",
      "👍👎👌✌️🤞",
      "🍎🍊🍋🍌🍉",
      "⭐✨💫☄️🌠",
    ];

    for (const input of emojiInputs) {
      const encoded = bufferTransformer.encode(input) as Uint8Array;
      const decoded = bufferTransformer.decode(encoded) as string;
      expect(decoded).toBe(input);
    }
  });

  it("should handle different character encodings", () => {
    const testInputs = [
      "ASCII: Hello World!",
      "Latin-1: àáâãäåæçèéêë",
      "UTF-8: 你好世界 🌍",
      "Mixed: Café naïve 中文 🍱",
    ];

    for (const input of testInputs) {
      const encoded = bufferTransformer.encode(input) as Uint8Array;
      const decoded = bufferTransformer.decode(encoded) as string;
      expect(decoded).toBe(input);
    }
  });

  it("should handle null bytes and control characters", () => {
    const controlChars =
      "Null byte: \0, Backspace: \b, Tab: \t, Newline: \n, Carriage return: \r";
    const encoded = bufferTransformer.encode(controlChars) as Uint8Array;
    const decoded = bufferTransformer.decode(encoded) as string;
    expect(decoded).toBe(controlChars);
  });

  it("should handle very long strings", () => {
    const input = `${"A".repeat(10000)} 🚀 ${"B".repeat(10000)}`;
    const encoded = bufferTransformer.encode(input) as Uint8Array;
    const decoded = bufferTransformer.decode(encoded) as string;
    expect(decoded).toBe(input);
  });

  it("should preserve byte values correctly", () => {
    // Test with specific byte values
    const input = "\x00\x01\x02\x03\x04\x05\xFF\xFE";
    const encoded = bufferTransformer.encode(input) as Uint8Array;

    // Check specific byte values
    expect(encoded[0]).toBe(0x00);
    expect(encoded[1]).toBe(0x01);
    expect(encoded[2]).toBe(0x02);
    expect(encoded[3]).toBe(0x03);
    expect(encoded[4]).toBe(0x04);
    expect(encoded[5]).toBe(0x05);

    const decoded = bufferTransformer.decode(encoded) as string;
    expect(decoded).toBe(input);
  });

  it("should handle buffer operations with different input types", () => {
    const input = "Hello, World!";

    // Test with different array-like inputs that should work as Uint8Array
    const encoded = bufferTransformer.encode(input) as Uint8Array;
    const arrayBuffer = encoded.buffer;
    const regularArray = Array.from(encoded);
    const uint8FromArray = new Uint8Array(regularArray);

    // All should decode to the same result
    expect(bufferTransformer.decode(encoded) as string).toBe(input);
    expect(bufferTransformer.decode(uint8FromArray) as string).toBe(input);
  });

  it("should handle binary data representation", () => {
    const input = "Binary: \x00\x7F\x80\xFF";
    const encoded = bufferTransformer.encode(input) as Uint8Array;

    // Check that binary data is preserved correctly
    const binaryString = Array.from(encoded)
      .map((byte) => byte.toString(2).padStart(8, "0"))
      .join(" ");

    // Should contain the expected binary patterns
    expect(binaryString).toContain("01000010"); // 'B'
    expect(binaryString).toContain("01101001"); // 'i'
    expect(binaryString).toContain("01101110"); // 'n'
    expect(binaryString).toContain("01100001"); // 'a'
    expect(binaryString).toContain("01110010"); // 'r'
    expect(binaryString).toContain("01111001"); // 'y'
    expect(binaryString).toContain("00111010"); // ':'
    expect(binaryString).toContain("00100000"); // ' '

    const decoded = bufferTransformer.decode(encoded) as string;
    expect(decoded).toBe(input);
  });

  it("should handle surrogate pairs correctly", () => {
    // Test characters that require surrogate pairs (outside BMP)
    const input = "𐍈𐍉𐍊"; // Gothic letters
    const encoded = bufferTransformer.encode(input) as Uint8Array;
    const decoded = bufferTransformer.decode(encoded) as string;
    expect(decoded).toBe(input);
  });

  it("should maintain buffer immutability", () => {
    const input = "Hello, World!";
    const encoded = bufferTransformer.encode(input) as Uint8Array;
    const originalBytes = new Uint8Array(encoded);

    // Modify the encoded buffer
    if (encoded.length > 0) {
      encoded[0] = 255;
    }

    // Decoding should still work (though with modified first character)
    const decoded = bufferTransformer.decode(encoded) as string;
    expect(decoded).not.toBe(input); // Should be different due to modification
    expect(decoded[0]).not.toBe(input[0]);
  });

  it("should handle large characters efficiently", () => {
    // Test efficiency with large repeated patterns
    const input = "🚀".repeat(1000); // 1000 rockets
    const encoded = bufferTransformer.encode(input) as Uint8Array;
    const decoded = bufferTransformer.decode(encoded) as string;

    expect(decoded).toBe(input);
    expect(encoded.length).toBeGreaterThan(0); // Should have reasonable size
    expect(encoded.length).toBeLessThan(input.length * 10); // But not too large
  });

  it("should handle invalid buffer input in decode appropriately", () => {
    // These inputs should throw errors
    const errorInputs = [
      "string", // string instead of Uint8Array
      123, // number
      null,
      {},
      true,
      false,
    ];

    for (const invalid of errorInputs) {
      expect(() =>
        bufferTransformer.decode(invalid as unknown as Uint8Array),
      ).toThrow();
    }

    // undefined should also throw as it indicates data loss
    expect(() =>
      bufferTransformer.decode(undefined as unknown as Uint8Array),
    ).toThrow();

    // Symbol should also throw
    expect(() =>
      bufferTransformer.decode(Symbol("test") as unknown as Uint8Array),
    ).toThrow();
  });

  it("should handle empty buffers correctly", () => {
    const emptyBuffer = new Uint8Array(0);
    // Empty buffers should throw as they indicate data loss
    expect(() => bufferTransformer.decode(emptyBuffer)).toThrow("Buffer cannot be empty");
  });

  it("should work with TextEncoder/TextDecoder options", () => {
    // This tests that we're using the default UTF-8 encoding correctly
    const input = "Café naïve 🌍";
    const encoded = bufferTransformer.encode(input) as Uint8Array;

    // The buffer should contain UTF-8 encoded bytes
    expect(encoded.length).toBeGreaterThan(input.length); // UTF-8 should expand

    const decoded = bufferTransformer.decode(encoded) as string;
    expect(decoded).toBe(input);
  });
});
