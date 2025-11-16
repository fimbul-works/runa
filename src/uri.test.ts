import { beforeEach, describe, expect, it } from "vitest";
import { runaURI } from "./uri.js";

describe("runaURI", () => {
  let uri: ReturnType<typeof runaURI>;

  beforeEach(() => {
    uri = runaURI();
  });

  it("should encode simple strings", () => {
    const input = "Hello World";
    const expected = encodeURIComponent(input);
    expect(uri.encode(input) as string).toBe(expected);
  });

  it("should decode encoded strings back to original", () => {
    const original = "Hello World";
    const encoded = encodeURIComponent(original);
    expect(uri.decode(encoded) as string).toBe(original);
  });

  it("should handle empty string", () => {
    const input = "";
    const encoded = uri.encode(input) as string;
    expect(encoded).toBe("");
    expect(uri.decode(encoded) as string).toBe("");
  });

  it("should encode special characters that must be escaped", () => {
    const specialChars = "!@#$%^&*()_+-=[]{}|;':\",./<>?";
    const encoded = uri.encode(specialChars) as string;
    expect(uri.decode(encoded) as string).toBe(specialChars);
  });

  it("should encode spaces as %20", () => {
    const input = "Hello World Test";
    const encoded = uri.encode(input) as string;
    expect(encoded).toBe("Hello%20World%20Test");
    expect(uri.decode(encoded) as string).toBe(input);
  });

  it("should handle reserved URI characters", () => {
    const reservedChars = ";,/?:@&=+$#";
    const encoded = uri.encode(reservedChars) as string;
    expect(uri.decode(encoded) as string).toBe(reservedChars);
  });

  it("should handle unsafe characters", () => {
    const unsafeChars = ' \\"<>[]{}|^`';
    const encoded = uri.encode(unsafeChars) as string;
    expect(uri.decode(encoded) as string).toBe(unsafeChars);
  });

  it("should handle Unicode characters", () => {
    const unicodeInputs = [
      "café",
      "naïve",
      "测试中文",
      "🚀 🌟 💫",
      "こんにちは",
      "مرحبا",
      "привет",
    ];

    for (const input of unicodeInputs) {
      const encoded = uri.encode(input) as string;
      const decoded = uri.decode(encoded) as string;
      expect(decoded).toBe(input);
    }
  });

  it("should handle emoji and symbols", () => {
    const emojiInputs = [
      "🎉🥳🎊",
      "❤️💛💚💙💜",
      "👍👎👌✌️🤞",
      "🏠🚗✈️🚢",
      "🍎🍊🍋🍌🍉",
    ];

    for (const input of emojiInputs) {
      const encoded = uri.encode(input) as string;
      const decoded = uri.decode(encoded) as string;
      expect(decoded).toBe(input);
    }
  });

  it("should handle numbers and mixed content", () => {
    const mixedInputs = [
      "1234567890",
      "Hello123",
      "test@example.com",
      "https://example.com/path?query=value",
      "user_name_123",
      "price: $19.99",
    ];

    for (const input of mixedInputs) {
      const encoded = uri.encode(input) as string;
      const decoded = uri.decode(encoded) as string;
      expect(decoded).toBe(input);
    }
  });

  it("should handle newlines and tabs", () => {
    const whitespaceInputs = [
      "line1\nline2\nline3",
      "col1\tcol2\tcol3",
      "mixed\nwhitespace\ttest",
      "ends with space ",
      "\tleading tab",
    ];

    for (const input of whitespaceInputs) {
      const encoded = uri.encode(input) as string;
      const decoded = uri.decode(encoded) as string;
      expect(decoded).toBe(input);
    }
  });

  it("should be bidirectional - encode then decode returns original", () => {
    const testStrings = [
      "Hello, World!",
      "",
      "Special chars: !@#$%^&*()",
      "Unicode: 🚀 🌟 💫",
      "Numbers: 123456789",
      "Mixed: Hello123!@#",
      "New lines\nand\ttabs",
      "Spaces and   multiple   spaces",
      "Email: test@example.com",
      "URL: https://example.com/path?query=value",
      'JSON: {"key": "value"}',
    ];

    for (const original of testStrings) {
      const encoded = uri.encode(original) as string;
      const decoded = uri.decode(encoded) as string;
      expect(decoded).toBe(original);
    }
  });

  it("should handle percent signs correctly", () => {
    const input = "100% complete";
    const encoded = uri.encode(input) as string;
    expect(encoded).toBe("100%25%20complete");
    expect(uri.decode(encoded) as string).toBe(input);
  });

  it("should handle already encoded strings gracefully", () => {
    const original = "Hello World";
    const encoded = encodeURIComponent(original); // "Hello%20World"

    // Encoding an already encoded string should encode the % character
    const doubleEncoded = uri.encode(encoded) as string;
    expect(doubleEncoded).toBe("Hello%2520World");

    // Decoding the double encoded should return the single encoded version
    const onceDecoded = uri.decode(doubleEncoded) as string;
    expect(onceDecoded).toBe(encoded);
  });

  it("should handle very long strings", () => {
    const input = `${"A".repeat(1000)} 🚀 ${"B".repeat(1000)}`;
    const encoded = uri.encode(input) as string;
    const decoded = uri.decode(encoded) as string;
    expect(decoded).toBe(input);
  });

  it("should handle null bytes and special Unicode", () => {
    const specialUnicode = [
      "\u0000", // null byte
      "\u200B", // zero-width space
      "\uFEFF", // byte order mark
      "\uFFFD", // replacement character
    ];

    for (const char of specialUnicode) {
      const encoded = uri.encode(char) as string;
      const decoded = uri.decode(encoded) as string;
      expect(decoded).toBe(char);
    }
  });

  it("should throw error for malformed encoded strings", () => {
    const malformedInputs = [
      "%", // incomplete escape sequence
      "%2", // incomplete escape sequence
      "%G0", // invalid hex digit
      "%20%", // trailing percent
      "%%20", // double percent
      "%ZZ", // invalid hex digits
    ];

    for (const malformed of malformedInputs) {
      expect(() => uri.decode(malformed) as string).toThrow();
    }
  });

  it("should handle URI components vs full URIs", () => {
    const component = "hello world";
    const fullURI = "https://example.com/search?q=hello world";

    // Should encode components (spaces become %20)
    expect(uri.encode(component) as string).toBe("hello%20world");

    // Should encode full URI components
    const encodedURI = uri.encode(fullURI) as string;
    expect(uri.decode(encodedURI) as string).toBe(fullURI);
  });
});
