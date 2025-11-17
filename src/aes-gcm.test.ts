import { beforeEach, describe, expect, it } from "vitest";
import { runaAesGcm } from "./aes-gcm.js";
import type { RunaAsync, Uint8ArrayLike } from "./types.js";

describe("runaAesGcm", () => {
  let aesGcm: RunaAsync<string, Uint8ArrayLike>;

  beforeEach(async () => {
    // Use a test passphrase and salt
    const testPassphrase = "test-secret-key";
    const testSalt = new Uint8Array([1, 2, 3, 4, 5, 6, 7, 8]);
    aesGcm = await runaAesGcm(testPassphrase, testSalt);
  });

  describe("encode", () => {
    it("should encrypt simple strings", async () => {
      const plaintext = "Hello, World!";
      const encrypted = await aesGcm.encode(plaintext);

      expect(encrypted).toBeInstanceOf(Uint8Array);
      expect(encrypted.length).toBeGreaterThan(12); // IV (12) + ciphertext + auth tag
    });

    it("should encrypt empty string", async () => {
      const plaintext = "";
      const encrypted = await aesGcm.encode(plaintext);

      expect(encrypted).toBeInstanceOf(Uint8Array);
      expect(encrypted.length).toBeGreaterThanOrEqual(12); // At least IV
    });

    it("should encrypt longer strings", async () => {
      const plaintext =
        "This is a longer test string that contains multiple words and sentences. It should still encrypt properly.";
      const encrypted = await aesGcm.encode(plaintext);

      expect(encrypted).toBeInstanceOf(Uint8Array);
      expect(encrypted.length).toBeGreaterThan(12);
    });

    it("should encrypt strings with special characters", async () => {
      const plaintext = "Special chars: !@#$%^&*()_+-={}[]|\\:;\"'<>?,./";
      const encrypted = await aesGcm.encode(plaintext);

      expect(encrypted).toBeInstanceOf(Uint8Array);
      expect(encrypted.length).toBeGreaterThan(12);
    });

    it("should encrypt strings with Unicode characters", async () => {
      const plaintext = "Unicode: 😀🎉 测试 العربية русский";
      const encrypted = await aesGcm.encode(plaintext);

      expect(encrypted).toBeInstanceOf(Uint8Array);
      expect(encrypted.length).toBeGreaterThan(12);
    });

    it("should generate different ciphertext for each encryption (due to random IV)", async () => {
      const plaintext = "Same message";
      const encrypted1 = await aesGcm.encode(plaintext);
      const encrypted2 = await aesGcm.encode(plaintext);

      expect(encrypted1).not.toEqual(encrypted2);
      expect(encrypted1.length).toBe(encrypted2.length);
    });

    it("should encrypt very long strings", async () => {
      const plaintext = "A".repeat(10000);
      const encrypted = await aesGcm.encode(plaintext);

      expect(encrypted).toBeInstanceOf(Uint8Array);
      expect(encrypted.length).toBeGreaterThan(10000);
    });

    it("should handle newline characters", async () => {
      const plaintext = "Line 1\nLine 2\nLine 3";
      const encrypted = await aesGcm.encode(plaintext);

      expect(encrypted).toBeInstanceOf(Uint8Array);
      expect(encrypted.length).toBeGreaterThan(12);
    });

    it("should handle tab characters", async () => {
      const plaintext = "Col1\tCol2\tCol3";
      const encrypted = await aesGcm.encode(plaintext);

      expect(encrypted).toBeInstanceOf(Uint8Array);
      expect(encrypted.length).toBeGreaterThan(12);
    });

    it("should handle JSON strings", async () => {
      const plaintext = JSON.stringify({
        name: "test",
        value: 123,
        active: true,
      });
      const encrypted = await aesGcm.encode(plaintext);

      expect(encrypted).toBeInstanceOf(Uint8Array);
      expect(encrypted.length).toBeGreaterThan(12);
    });
  });

  describe("decode", () => {
    it("should decrypt back to original string", async () => {
      const plaintext = "Hello, World!";
      const encrypted = await aesGcm.encode(plaintext);
      const decrypted = await aesGcm.decode(encrypted);

      expect(decrypted).toBe(plaintext);
    });

    it("should decrypt empty string", async () => {
      const plaintext = "";
      const encrypted = await aesGcm.encode(plaintext);
      const decrypted = await aesGcm.decode(encrypted);

      expect(decrypted).toBe(plaintext);
    });

    it("should decrypt longer strings", async () => {
      const plaintext =
        "This is a longer test string that contains multiple words and sentences. It should still encrypt properly.";
      const encrypted = await aesGcm.encode(plaintext);
      const decrypted = await aesGcm.decode(encrypted);

      expect(decrypted).toBe(plaintext);
    });

    it("should decrypt strings with special characters", async () => {
      const plaintext = "Special chars: !@#$%^&*()_+-={}[]|\\:;\"'<>?,./";
      const encrypted = await aesGcm.encode(plaintext);
      const decrypted = await aesGcm.decode(encrypted);

      expect(decrypted).toBe(plaintext);
    });

    it("should decrypt strings with Unicode characters", async () => {
      const plaintext = "Unicode: 😀🎉 测试 العربية русский";
      const encrypted = await aesGcm.encode(plaintext);
      const decrypted = await aesGcm.decode(encrypted);

      expect(decrypted).toBe(plaintext);
    });

    it("should decrypt very long strings", async () => {
      const plaintext = "A".repeat(10000);
      const encrypted = await aesGcm.encode(plaintext);
      const decrypted = await aesGcm.decode(encrypted);

      expect(decrypted).toBe(plaintext);
    });

    it("should decrypt newline characters", async () => {
      const plaintext = "Line 1\nLine 2\nLine 3";
      const encrypted = await aesGcm.encode(plaintext);
      const decrypted = await aesGcm.decode(encrypted);

      expect(decrypted).toBe(plaintext);
    });

    it("should decrypt tab characters", async () => {
      const plaintext = "Col1\tCol2\tCol3";
      const encrypted = await aesGcm.encode(plaintext);
      const decrypted = await aesGcm.decode(encrypted);

      expect(decrypted).toBe(plaintext);
    });

    it("should decrypt JSON strings", async () => {
      const plaintext = JSON.stringify({
        name: "test",
        value: 123,
        active: true,
      });
      const encrypted = await aesGcm.encode(plaintext);
      const decrypted = await aesGcm.decode(encrypted);

      expect(decrypted).toBe(plaintext);
      const parsed = JSON.parse(decrypted);
      expect(parsed).toEqual({ name: "test", value: 123, active: true });
    });
  });

  describe("bidirectional operations", () => {
    it("should be bidirectional - encode then decode returns original for various strings", async () => {
      const testCases = [
        "Hello, World!",
        "",
        "A".repeat(1000),
        "Special chars: !@#$%^&*()",
        "Unicode: 😀🎉 测试",
        `JSON: ${JSON.stringify({ test: true })}`,
        "Newlines\nand\r\nlines",
        "Tabs\tand\tspaces",
        "Mixed: Hello\nWorld\t!@#",
      ];

      for (const original of testCases) {
        const encrypted = await aesGcm.encode(original);
        const decrypted = await aesGcm.decode(encrypted);
        expect(decrypted).toBe(original);
      }
    });

    it("should produce different ciphertext for same plaintext but decrypt to same result", async () => {
      const plaintext = "Test message";

      const encrypted1 = await aesGcm.encode(plaintext);
      const decrypted1 = await aesGcm.decode(encrypted1);

      const encrypted2 = await aesGcm.encode(plaintext);
      const decrypted2 = await aesGcm.decode(encrypted2);

      // Encrypted data should be different (due to random IV)
      expect(encrypted1).not.toEqual(encrypted2);

      // But decrypted data should be the same
      expect(decrypted1).toBe(decrypted2);
      expect(decrypted1).toBe(plaintext);
    });
  });

  describe("key and salt variations", () => {
    it("should work with different key materials", async () => {
      const testCases = [
        { key: "password123", salt: new Uint8Array([1, 2, 3, 4]) },
        {
          key: "very-secret-key",
          salt: new Uint8Array([8, 7, 6, 5, 4, 3, 2, 1]),
        },
        {
          key: new Uint8Array([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]),
          salt: new Uint8Array([1, 1, 1, 1]),
        },
        { key: "unicode-key-🔑", salt: new Uint8Array([255, 254, 253, 252]) },
      ];

      for (const { key, salt } of testCases) {
        const aesGcmInstance = await runaAesGcm(key, salt);
        const plaintext = "Test message";

        const encrypted = await aesGcmInstance.encode(plaintext);
        const decrypted = await aesGcmInstance.decode(encrypted);

        expect(decrypted).toBe(plaintext);
      }
    });

    it("should work without explicit salt (use default)", async () => {
      const aesGcmDefault = await runaAesGcm("test-key");
      const plaintext = "Test with default salt";

      const encrypted = await aesGcmDefault.encode(plaintext);
      const decrypted = await aesGcmDefault.decode(encrypted);

      expect(decrypted).toBe(plaintext);
    });

    it("should produce different results with different salts", async () => {
      const plaintext = "Same plaintext";
      const key = "test-key";

      const aesGcm1 = await runaAesGcm(key, new Uint8Array([1, 1, 1, 1]));
      const aesGcm2 = await runaAesGcm(key, new Uint8Array([2, 2, 2, 2]));

      const encrypted1 = await aesGcm1.encode(plaintext);
      const encrypted2 = await aesGcm2.encode(plaintext);

      expect(encrypted1).not.toEqual(encrypted2);

      // But each should decrypt correctly with its respective instance
      const decrypted1 = await aesGcm1.decode(encrypted1);
      const decrypted2 = await aesGcm2.decode(encrypted2);

      expect(decrypted1).toBe(plaintext);
      expect(decrypted2).toBe(plaintext);
    });

    it("should fail to decrypt with wrong key", async () => {
      const plaintext = "Secret message";
      const encrypted = await aesGcm.encode(plaintext);

      const wrongKeyAesGcm = await runaAesGcm(
        "wrong-key",
        new Uint8Array([9, 9, 9, 9]),
      );

      await expect(wrongKeyAesGcm.decode(encrypted)).rejects.toThrow();
    });

    it("should fail to decrypt with wrong salt", async () => {
      const plaintext = "Secret message";
      const encrypted = await aesGcm.encode(plaintext);

      const wrongSaltAesGcm = await runaAesGcm(
        "test-secret-key",
        new Uint8Array([9, 9, 9, 9]),
      );

      await expect(wrongSaltAesGcm.decode(encrypted)).rejects.toThrow();
    });
  });

  describe("error handling", () => {
    it("should handle invalid encrypted data", async () => {
      const invalidData = new Uint8Array([1, 2, 3, 4, 5]); // Too small to be valid

      await expect(aesGcm.decode(invalidData)).rejects.toThrow();
    });

    it("should handle tampered encrypted data", async () => {
      const plaintext = "Original message";
      const encrypted = await aesGcm.encode(plaintext);

      // Tamper with the data (flip a bit)
      const tampered = new Uint8Array(encrypted);
      tampered[tampered.length - 1] ^= 0xff;

      await expect(aesGcm.decode(tampered)).rejects.toThrow();
    });

    it("should handle truncated encrypted data", async () => {
      const plaintext = "Test message";
      const encrypted = await aesGcm.encode(plaintext);

      // Truncate the data
      const truncated = encrypted.slice(0, encrypted.length - 5);

      await expect(aesGcm.decode(truncated)).rejects.toThrow();
    });

    it("should handle empty encrypted data", async () => {
      const emptyData = new Uint8Array(0);

      await expect(aesGcm.decode(emptyData)).rejects.toThrow();
    });
  });

  describe("performance and edge cases", () => {
    it("should handle large messages efficiently", async () => {
      const largeMessage = "A".repeat(100000); // 100KB
      const startTime = Date.now();

      const encrypted = await aesGcm.encode(largeMessage);
      const encryptTime = Date.now() - startTime;

      const decryptStartTime = Date.now();
      const decrypted = await aesGcm.decode(encrypted);
      const decryptTime = Date.now() - decryptStartTime;

      expect(decrypted).toBe(largeMessage);

      // Just ensure it completes in reasonable time (very loose threshold)
      expect(encryptTime).toBeLessThan(5000); // 5 seconds
      expect(decryptTime).toBeLessThan(5000); // 5 seconds
    });

    it("should handle very small messages", async () => {
      const tinyMessage = "x";
      const encrypted = await aesGcm.encode(tinyMessage);
      const decrypted = await aesGcm.decode(encrypted);

      expect(decrypted).toBe(tinyMessage);
      expect(encrypted.length).toBeGreaterThan(12); // Still needs IV
    });

    it("should maintain data integrity", async () => {
      const sensitiveData = JSON.stringify({
        userId: 12345,
        sessionId: "abc-def-123",
        permissions: ["read", "write"],
        timestamp: Date.now(),
        checksum: "验证完整性",
      });

      const encrypted = await aesGcm.encode(sensitiveData);
      const decrypted = await aesGcm.decode(encrypted);

      expect(decrypted).toBe(sensitiveData);

      const originalObj = JSON.parse(sensitiveData);
      const decryptedObj = JSON.parse(decrypted);
      expect(decryptedObj).toEqual(originalObj);
    });

    it("should handle messages with null bytes", async () => {
      const messageWithNull = "Before\x00After\x00End";
      const encrypted = await aesGcm.encode(messageWithNull);
      const decrypted = await aesGcm.decode(encrypted);

      expect(decrypted).toBe(messageWithNull);
    });
  });

  describe("AES-GCM specific behavior", () => {
    it("should use 12-byte IV", async () => {
      const plaintext = "Test";
      const encrypted = await aesGcm.encode(plaintext);

      // Extract the IV (first 12 bytes)
      const iv = encrypted.slice(0, 12);
      expect(iv).toHaveLength(12);

      // IV should be random (different each time)
      const encrypted2 = await aesGcm.encode(plaintext);
      const iv2 = encrypted2.slice(0, 12);
      expect(iv).not.toEqual(iv2);
    });

    it("should include authentication tag", async () => {
      const plaintext = "Test message";
      const encrypted = await aesGcm.encode(plaintext);

      // AES-GCM ciphertext should include authentication tag
      // Total length = IV (12) + ciphertext + auth tag (16)
      expect(encrypted.length).toBeGreaterThan(28); // At least 12 + 1 + 16
    });

    it("should handle concurrent encryptions", async () => {
      const plaintext = "Concurrent test";

      const promises = Array(10)
        .fill(null)
        .map(async () => {
          const encrypted = await aesGcm.encode(plaintext);
          const decrypted = await aesGcm.decode(encrypted);
          return { encrypted, decrypted };
        });

      const results = await Promise.all(promises);

      // All should decrypt to the same plaintext
      for (const { decrypted } of results) {
        expect(decrypted).toBe(plaintext);
      }

      // All encrypted values should be different (due to random IVs)
      const encryptedValues = results.map((r) =>
        Array.from(r.encrypted).join(","),
      );
      const uniqueEncrypted = new Set(encryptedValues);
      expect(uniqueEncrypted.size).toBe(10);
    });
  });
});
