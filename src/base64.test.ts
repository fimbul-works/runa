import { describe, it, expect, beforeEach } from "vitest";
import { runaBase64 } from "./base64.js";

describe("runaBase64", () => {
  let base64: ReturnType<typeof runaBase64>;

  beforeEach(() => {
    base64 = runaBase64();
  });

  it("should encode a simple string to base64", () => {
    const input = "Hello, World!";
    const expected = btoa(input);
    expect(base64.encode(input) as string).toBe(expected);
  });

  it("should decode base64 string back to original", () => {
    const original = "Hello, World!";
    const encoded = btoa(original);
    expect(base64.decode(encoded) as string).toBe(original);
  });

  it("should handle empty string", () => {
    const input = "";
    const encoded = base64.encode(input) as string;
    expect(encoded).toBe("");
    expect(base64.decode(encoded) as string).toBe("");
  });

  it("should handle special characters (ASCII only)", () => {
    const input = "Hello! How are you? n~a~e~i~o~u";
    const encoded = base64.encode(input) as string;
    expect(base64.decode(encoded) as string).toBe(input);
  });

  it("should handle numbers and symbols", () => {
    const input = "1234567890!@#$%^&*()_+-=[]{}|;':\",./<>?";
    const encoded = base64.encode(input) as string;
    expect(base64.decode(encoded) as string).toBe(input);
  });

  it("should fail on unicode characters with btoa/atob", () => {
    // Note: btoa/atob only handle ASCII characters, not Unicode
    const input = "测试中文 🎉 Тест العربية";
    expect(() => base64.encode(input) as string).toThrow();
  });

  it("should be bidirectional - encode then decode returns original", () => {
    const testStrings = [
      "Hello, World!",
      "",
      "Special chars: !@#$%^&*()",
      "Numbers: 123456789",
      "Mixed: Hello123!@#",
      "New lines\nand\ttabs",
      'JSON: {"key": "value"}',
    ];

    for (const original of testStrings) {
      const encoded = base64.encode(original) as string;
      const decoded = base64.decode(encoded) as string;
      expect(decoded).toBe(original);
    }
  });

  it("should handle whitespace correctly", () => {
    const input = "   spaced out   ";
    const encoded = base64.encode(input) as string;
    expect(base64.decode(encoded) as string).toBe(input);
  });

  it("should handle very long strings", () => {
    const input = "A".repeat(1000);
    const encoded = base64.encode(input) as string;
    expect(base64.decode(encoded) as string).toBe(input);
  });

  it("should throw error when decoding invalid base64", () => {
    expect(() => base64.decode("invalid-base64!") as string).toThrow();
    expect(() => base64.decode("not base64 $%^&") as string).toThrow();
  });

  it("should handle multiline strings", () => {
    const input = "Line 1\nLine 2\nLine 3";
    const encoded = base64.encode(input) as string;
    expect(base64.decode(encoded) as string).toBe(input);
  });
});
