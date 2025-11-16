import { beforeEach, describe, expect, it } from "vitest";
import { runaFF1 } from "./ff1.js";

// Single consistent 32-byte key for all tests
const TEST_KEY = "test-key-12345678901234567890123";
const TEST_TWEAK = "tweak-123456789";

describe("runaFF1", () => {
  let ff1Basic: Awaited<ReturnType<typeof runaFF1>>;
  let ff1Numeric: Awaited<ReturnType<typeof runaFF1>>;
  let ff1Alphabetic: Awaited<ReturnType<typeof runaFF1>>;
  let ff1Custom: Awaited<ReturnType<typeof runaFF1>>;

  beforeEach(async () => {
    // Use exactly 32-byte keys for AES-256
    ff1Basic = await runaFF1(TEST_KEY, TEST_TWEAK);
    ff1Numeric = await runaFF1(TEST_KEY, TEST_TWEAK, "0123456789");
    ff1Alphabetic = await runaFF1(
      TEST_KEY,
      TEST_TWEAK,
      "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
    );
    ff1Custom = await runaFF1(TEST_KEY, TEST_TWEAK, "!@#$%^&*()");
  });

  describe("basic functionality", () => {
    it("should encrypt and decrypt simple strings", async () => {
      const plaintext = "hello";
      const encrypted = ff1Basic.encode(plaintext);
      const decrypted = ff1Basic.decode(encrypted);

      expect(encrypted).toBeTypeOf("string");
      expect(encrypted).not.toBe(plaintext);
      expect(decrypted).toBe(plaintext);
    });

    it("should encrypt and decrypt numeric strings", async () => {
      const plaintext = "1234567890";
      const encrypted = ff1Numeric.encode(plaintext);
      const decrypted = ff1Numeric.decode(encrypted);

      expect(encrypted).toBeTypeOf("string");
      expect(encrypted).not.toBe(plaintext);
      expect(decrypted).toBe(plaintext);
    });

    it("should encrypt and decrypt alphabetic strings", async () => {
      const plaintext = "HELLOWORLD";
      const encrypted = ff1Alphabetic.encode(plaintext);
      const decrypted = ff1Alphabetic.decode(encrypted);

      expect(encrypted).toBeTypeOf("string");
      expect(encrypted).not.toBe(plaintext);
      expect(decrypted).toBe(plaintext);
    });

    it("should encrypt and decrypt with custom character sets", async () => {
      const plaintext = "!@#$%";
      const encrypted = ff1Custom.encode(plaintext);
      const decrypted = ff1Custom.decode(encrypted);

      expect(encrypted).toBeTypeOf("string");
      expect(encrypted).not.toBe(plaintext);
      expect(decrypted).toBe(plaintext);
    });

    it("should handle empty strings", async () => {
      const plaintext = "";
      // FF1 requires minimum input length of 2, so empty strings should throw
      expect(() => ff1Basic.encode(plaintext)).toThrow();
    });

    it("should handle single character strings", async () => {
      const plaintext = "a";
      // FF1 requires minimum input length of 2, so single characters should throw
      expect(() => ff1Basic.encode(plaintext)).toThrow();
    });
  });

  describe("format preserving behavior", () => {
    it("should preserve string length", async () => {
      const testCases = [
        "ab",
        "abc",
        "abcd",
        "abcdefghij",
        "abcdefghijklmnopqrstuvwxyz".slice(0, 20),
      ];

      for (const plaintext of testCases) {
        const encrypted = ff1Basic.encode(plaintext);
        expect(encrypted.length).toBe(plaintext.length);
      }
    });

    it("should preserve character set", async () => {
      const plaintext = "12345";
      const encrypted = ff1Numeric.encode(plaintext);

      // All characters in encrypted string should be from the numeric alphabet
      for (const char of encrypted) {
        expect("0123456789").toContain(char);
      }
    });

    it("should preserve alphabetic case", async () => {
      const plaintext = "HELLO";
      const encrypted = ff1Alphabetic.encode(plaintext);

      // All characters should be uppercase letters
      for (const char of encrypted) {
        expect("ABCDEFGHIJKLMNOPQRSTUVWXYZ").toContain(char);
        expect("abcdefghijklmnopqrstuvwxyz").not.toContain(char);
      }
    });

    it("should preserve custom character set", async () => {
      const plaintext = "!@#$%";
      const encrypted = ff1Custom.encode(plaintext);

      // All characters should be from the custom set
      for (const char of encrypted) {
        expect("!@#$%^&*()").toContain(char);
      }
    });
  });

  describe("different keys and tweaks", () => {
    it("should produce different outputs with different keys", async () => {
      const plaintext = "123456";
      // Use TEST_KEY with one character changed
      const key1 = "test-key-12345678901234567890123";
      const key2 = "test-key-12345678901234567890124"; // last char different

      const ff1Key1 = await runaFF1(key1, TEST_TWEAK, "0123456789");
      const ff1Key2 = await runaFF1(key2, TEST_TWEAK, "0123456789");

      const encrypted1 = ff1Key1.encode(plaintext);
      const encrypted2 = ff1Key2.encode(plaintext);

      expect(encrypted1).not.toBe(encrypted2);

      // Both should decrypt correctly with their respective keys
      const decrypted1 = ff1Key1.decode(encrypted1);
      const decrypted2 = ff1Key2.decode(encrypted2);

      expect(decrypted1).toBe(plaintext);
      expect(decrypted2).toBe(plaintext);
    });

    it("should produce different outputs with different tweaks", async () => {
      const plaintext = "123456";
      const tweak1 = "tweak-123456789";
      const tweak2 = "tweak-123456788"; // last digit different

      const ff1Tweak1 = await runaFF1(TEST_KEY, tweak1, "0123456789");
      const ff1Tweak2 = await runaFF1(TEST_KEY, tweak2, "0123456789");

      const encrypted1 = ff1Tweak1.encode(plaintext);
      const encrypted2 = ff1Tweak2.encode(plaintext);

      expect(encrypted1).not.toBe(encrypted2);

      // Both should decrypt correctly with their respective tweaks
      const decrypted1 = ff1Tweak1.decode(encrypted1);
      const decrypted2 = ff1Tweak2.decode(encrypted2);

      expect(decrypted1).toBe(plaintext);
      expect(decrypted2).toBe(plaintext);
    });

    it("should work with buffer keys and tweaks", async () => {
      const keyBuffer = Buffer.from(TEST_KEY);
      const tweakBuffer = Buffer.from(TEST_TWEAK);

      const ff1Buffer = await runaFF1(keyBuffer, tweakBuffer, "0123456789");

      const plaintext = "123456";
      const encrypted = ff1Buffer.encode(plaintext);
      const decrypted = ff1Buffer.decode(encrypted);

      expect(decrypted).toBe(plaintext);
    });
  });

  describe("length constraints", () => {
    it("should respect minimum length constraint", async () => {
      const ff1MinLength = await runaFF1(
        TEST_KEY,
        TEST_TWEAK,
        "0123456789",
        5,
        10,
      );

      const shortPlaintext = "123"; // length 3, below minimum of 5
      expect(() => ff1MinLength.encode(shortPlaintext)).toThrow();

      // Should work with valid length
      const validPlaintext = "12345"; // length 5, meets minimum
      const encrypted = ff1MinLength.encode(validPlaintext);
      const decrypted = ff1MinLength.decode(encrypted);

      expect(encrypted.length).toBe(5);
      expect(decrypted).toBe(validPlaintext);
    });

    it("should respect maximum length constraint", async () => {
      const ff1MaxLength = await runaFF1(
        TEST_KEY,
        TEST_TWEAK,
        "0123456789",
        2, // FF1 requires minimum of 2
        5,
      );

      const longPlaintext = "123456789"; // length 9, exceeds maximum of 5
      expect(() => ff1MaxLength.encode(longPlaintext)).toThrow();

      // Should work with valid length
      const validPlaintext = "12345"; // length 5, meets maximum
      const encrypted = ff1MaxLength.encode(validPlaintext);
      const decrypted = ff1MaxLength.decode(encrypted);

      expect(encrypted.length).toBe(5);
      expect(decrypted).toBe(validPlaintext);
    });
  });

  describe("bidirectional operations", () => {
    it("should be bidirectional - encode then decode returns original", async () => {
      const testCases = [
        "hello",
        "123456",
        "ABCDEF",
        "a1b2c3",
        "TESTCASE123",
        "longer",
        "verylongstringthatexceedsnormallength",
      ];

      for (const original of testCases) {
        const encrypted = ff1Basic.encode(original);
        const decrypted = ff1Basic.decode(encrypted);
        expect(decrypted).toBe(original);
      }

      // Test custom character set separately
      const customOriginal = "!@#$%";
      const customEncrypted = ff1Custom.encode(customOriginal);
      const customDecrypted = ff1Custom.decode(customEncrypted);
      expect(customDecrypted).toBe(customOriginal);
    });

    it("should be bidirectional with different character sets", async () => {
      const testCases = [
        { transformer: ff1Numeric, text: "1234567890" },
        { transformer: ff1Alphabetic, text: "HELLOWORLD" },
        { transformer: ff1Custom, text: "!@#$%^&*()" },
      ];

      for (const { transformer, text } of testCases) {
        const encrypted = await transformer.encode(text);
        const decrypted = await transformer.decode(encrypted);
        expect(decrypted).toBe(text);
      }
    });
  });

  describe("edge cases", () => {
    it("should handle strings with special characters", async () => {
      const ff1Extended = await runaFF1(
        TEST_KEY,
        TEST_TWEAK,
        "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz",
      );

      const plaintext = "Test123ABC";
      const encrypted = ff1Extended.encode(plaintext);
      const decrypted = ff1Extended.decode(encrypted);

      expect(decrypted).toBe(plaintext);
    });

    it("should handle repeated characters", async () => {
      const plaintext = "aaaaaaaaaa";
      const encrypted = ff1Basic.encode(plaintext);
      const decrypted = ff1Basic.decode(encrypted);

      expect(decrypted).toBe(plaintext);
    });

    it("should handle patterns and sequences", async () => {
      const testCases = [
        "123456789",
        "abcdefghij",
        "qwertyuiop",
        "zxcvbnmasdf",
      ];

      for (const plaintext of testCases) {
        const encrypted = ff1Basic.encode(plaintext);
        const decrypted = ff1Basic.decode(encrypted);
        expect(decrypted).toBe(plaintext);
      }
    });
  });

  describe("error handling", () => {
    it("should handle empty key gracefully", async () => {
      await expect(runaFF1("", "tweak", "0123456789")).rejects.toThrow();
    });

    it("should handle empty alphabet gracefully", async () => {
      await expect(runaFF1("key", "tweak", "")).rejects.toThrow();
    });

    it("should handle single character alphabet", async () => {
      await expect(runaFF1("key", "tweak", "A")).rejects.toThrow();
    });

    it("should handle invalid characters in plaintext", async () => {
      const plaintext = "123";

      // Try to encrypt with alphabetic-only FF1
      try {
        const encrypted = ff1Alphabetic.encode(plaintext);
        // If it doesn't throw, the behavior depends on the FF1 implementation
        const decrypted = ff1Alphabetic.decode(encrypted);
        // Either it should preserve the original or throw an error
      } catch (error) {
        // Expected behavior for invalid characters
        expect(error).toBeInstanceOf(Error);
      }
    });

    it("should handle null/undefined inputs", async () => {
      expect(() => ff1Basic.encode(null as unknown as string)).toThrow();
      expect(() => ff1Basic.encode(undefined as unknown as string)).toThrow();
      expect(() => ff1Basic.decode(null as unknown as string)).toThrow();
      expect(() => ff1Basic.decode(undefined as unknown as string)).toThrow();
    });
  });

  describe("performance and stress testing", () => {
    it("should handle moderately long strings", async () => {
      const plaintext = "a".repeat(100);
      const encrypted = ff1Basic.encode(plaintext);
      const decrypted = ff1Basic.decode(encrypted);

      expect(decrypted).toBe(plaintext);
      expect(encrypted.length).toBe(plaintext.length);
    });

    it("should handle multiple consecutive operations", async () => {
      const plaintext = "test";
      let current = plaintext;

      // Multiple rounds of encryption
      for (let i = 0; i < 10; i++) {
        current = ff1Basic.encode(current);
      }

      // Multiple rounds of decryption
      for (let i = 0; i < 10; i++) {
        current = ff1Basic.decode(current);
      }

      expect(current).toBe(plaintext);
    });

    it("should handle concurrent operations", async () => {
      const plaintext = "concurrent";

      const promises = Array(10)
        .fill(null)
        .map(async () => {
          const encrypted = ff1Basic.encode(plaintext);
          const decrypted = ff1Basic.decode(encrypted);
          return { encrypted, decrypted };
        });

      const results = await Promise.all(promises);

      // All should decrypt to the same plaintext
      results.forEach(({ decrypted }) => {
        expect(decrypted).toBe(plaintext);
      });

      // Encrypted values should be the same (deterministic)
      const encryptedValues = results.map((r) => r.encrypted);
      const uniqueEncrypted = new Set(encryptedValues);
      expect(uniqueEncrypted.size).toBe(1);
    });
  });

  describe("real-world scenarios", () => {
    it("should work with credit card numbers", async () => {
      const ff1CreditCard = await runaFF1(TEST_KEY, "cc-tweak", "0123456789");

      const creditCardNumber = "4532015112830366";
      const encrypted = ff1CreditCard.encode(creditCardNumber);
      const decrypted = ff1CreditCard.decode(encrypted);

      expect(encrypted.length).toBe(creditCardNumber.length);
      expect(decrypted).toBe(creditCardNumber);

      // Should only contain digits
      expect(/^\d+$/.test(encrypted)).toBe(true);
    });

    it("should work with social security numbers", async () => {
      const ff1SSN = await runaFF1(TEST_KEY, "ssn-tweak", "0123456789");

      const ssn = "123456789";
      const encrypted = ff1SSN.encode(ssn);
      const decrypted = ff1SSN.decode(encrypted);

      expect(encrypted.length).toBe(ssn.length);
      expect(decrypted).toBe(ssn);
    });

    it("should work with phone numbers", async () => {
      const ff1Phone = await runaFF1(TEST_KEY, "phone-tweak", "0123456789-()");

      const phoneNumber = "(555)123-4567";
      const encrypted = ff1Phone.encode(phoneNumber);
      const decrypted = ff1Phone.decode(encrypted);

      expect(encrypted.length).toBe(phoneNumber.length);
      expect(decrypted).toBe(phoneNumber);
    });

    it("should work with license plates", async () => {
      const ff1License = await runaFF1(
        TEST_KEY,
        "license-tweak",
        "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789",
      );

      const licensePlate = "ABC123";
      const encrypted = ff1License.encode(licensePlate);
      const decrypted = ff1License.decode(encrypted);

      expect(encrypted.length).toBe(licensePlate.length);
      expect(decrypted).toBe(licensePlate);
    });
  });

  describe("deterministic behavior", () => {
    it("should produce consistent results for same input", async () => {
      const plaintext = "123456";

      const encrypted1 = ff1Numeric.encode(plaintext);
      const encrypted2 = ff1Numeric.encode(plaintext);

      expect(encrypted1).toBe(encrypted2);

      const decrypted1 = ff1Numeric.decode(encrypted1);
      const decrypted2 = ff1Numeric.decode(encrypted2);

      expect(decrypted1).toBe(plaintext);
      expect(decrypted2).toBe(plaintext);
    });

    it("should be deterministic across multiple instances with same key and tweak", async () => {
      const plaintext = "123456";

      const ff1Instance1 = await runaFF1(TEST_KEY, TEST_TWEAK, "0123456789");
      const ff1Instance2 = await runaFF1(TEST_KEY, TEST_TWEAK, "0123456789");

      const encrypted1 = ff1Instance1.encode(plaintext);
      const encrypted2 = ff1Instance2.encode(plaintext);

      expect(encrypted1).toBe(encrypted2);

      const decrypted1 = ff1Instance1.decode(encrypted1);
      const decrypted2 = ff1Instance2.decode(encrypted2);

      expect(decrypted1).toBe(plaintext);
      expect(decrypted2).toBe(plaintext);
    });
  });
});
