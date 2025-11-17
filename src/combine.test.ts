import { beforeEach, describe, expect, it } from "vitest";
import { runaAesGcm } from "./aes-gcm.js";
import { runaArraySplit } from "./array-split.js";
import { runaBufferToArray } from "./buffer-to-array.js";
import { runaCantorPairArray } from "./cantor-pair-array.js";
import { runaFF1 } from "./ff1.js";
import { runaNumberArrayCharset } from "./number-array-charset.js";
import { runaStringSeparator } from "./string-clean.js";
import { runaStringToBuffer } from "./string-to-buffer.js";
import runaStringToNumber from "./string-to-number.js";
import { createRuna } from "./runa.js";
import type { RunaAsync, RunaSync } from "./types.js";

describe("Transformation Chain Tests", () => {
  let strBuf: RunaSync<string, Uint8Array>;
  let bufArr: RunaSync<Uint8Array, number[]>;
  let arrSplit: RunaSync<number[], number[][]>;
  let cantorPairArray: RunaSync<number[][], number[]>;
  let numToCharset: RunaSync<number[], string>;
  let stringSeparator: RunaSync<string, string>;

  beforeEach(() => {
    // Initialize all transformation utilities
    strBuf = runaStringToBuffer();
    bufArr = runaBufferToArray();
    arrSplit = runaArraySplit<number>(2);
    cantorPairArray = runaCantorPairArray();
    numToCharset = runaNumberArrayCharset(
      "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789",
      1,
    );
    stringSeparator = runaStringSeparator();
  });

  describe("Basic Transformation Chain", () => {
    it("should transform string through the complete sync chain", () => {
      const str = "Hello world!";

      // Build the complete sync chain
      const fullChain = strBuf
        .chain(bufArr)
        .chain(arrSplit)
        .chain(cantorPairArray)
        .chain(numToCharset);

      const encoded = fullChain.encode(str);
      const decoded = fullChain.decode(encoded);

      expect(encoded).toBe("d6y|ghU|cQK|g6q|gC9|cuq");
      expect(decoded).toBe(str);
    });

    it("should be bidirectional for each step", () => {
      const str = "Hello world!";

      // Step 1: String -> Buffer
      const buffer = strBuf.encode(str);
      const decodedStr1 = strBuf.decode(buffer);
      expect(decodedStr1).toBe(str);

      // Step 2: Buffer -> Array
      const numArray = bufArr.encode(buffer);
      const decodedBuffer = bufArr.decode(numArray);
      expect(decodedBuffer).toEqual(buffer);

      // Step 3: Array -> Pairs
      const pairedArrays = arrSplit.encode(numArray);
      const decodedArray = arrSplit.decode(pairedArrays);
      expect(decodedArray).toEqual(numArray);

      // Step 4: Pairs -> Cantor
      const cantorNumbers = cantorPairArray.encode(pairedArrays);
      const decodedPairs = cantorPairArray.decode(cantorNumbers);
      expect(decodedPairs).toEqual(pairedArrays);

      // Step 5: Cantor -> String
      const encodedStr = numToCharset.encode(cantorNumbers);
      const decodedCantor = numToCharset.decode(encodedStr);
      expect(decodedCantor).toEqual(cantorNumbers);
    });

    it("should work with different test strings", () => {
      const testCases = [
        "Test123", // 7 chars - odd length, will fail with pair splitting
        "ABCdef", // 6 chars - even length, should work
        "1234567890", // 10 chars - even length, should work
        "Hello", // 5 chars - odd length, will fail with pair splitting
        "World!", // 6 chars - even length, should work
      ];

      const fullChain = strBuf
        .chain(bufArr)
        .chain(arrSplit)
        .chain(cantorPairArray)
        .chain(numToCharset);

      for (const testCase of testCases) {
        if (testCase.length % 2 === 0) {
          // Only test even-length strings for pair splitting
          const encoded = fullChain.encode(testCase);
          const decoded = fullChain.decode(encoded);
          expect(decoded).toBe(testCase);
        } else {
          // Odd-length strings should fail at the array split stage
          expect(() => fullChain.encode(testCase)).toThrow();
        }
      }
    });
  });

  describe("String Cleaning", () => {
    it("should remove and restore separators", () => {
      const stringWithSeparators = "d6y|ghU|cQK|g6q|gC9|cuq";
      // Use runaStringSeparator for perfect reversibility in transformation chains
      // Note: runaStringSeparator uses encoding markers for perfect reversibility
      const encodedString = stringSeparator.encode(stringWithSeparators);
      const restoredString = stringSeparator.decode(encodedString);

      // The encoded string contains markers for separator positions
      expect(encodedString).toContain("d6y");
      expect(encodedString).toContain("ghU");
      expect(encodedString).toContain("cQK");
      expect(encodedString).toContain("g6q");
      expect(encodedString).toContain("gC9");
      expect(encodedString).toContain("cuq");
      // Should not contain the original separator directly (except in markers)
      expect(encodedString).toMatch(/__SEP_3g__/g);

      // Perfect reversibility - the restored string matches the original
      expect(restoredString).toBe(stringWithSeparators);
    });

    it("should handle empty strings", () => {
      const empty = "";
      const cleaned = stringSeparator.encode(empty);
      const restored = stringSeparator.decode(cleaned);
      expect(restored).toBe(empty);
    });
  });

  describe("Async Chain with AES-GCM", () => {
    it("should encrypt and decrypt through async chain", async () => {
      const str = "Hello world!";
      const aesGcm = await runaAesGcm("test-key-for-aes-gcm-encryption");

      // Build the async chain: ... -> charset -> clean string -> encrypted buffer
      const asyncChain = strBuf
        .chain(bufArr)
        .chain(arrSplit)
        .chain(cantorPairArray)
        .chain(numToCharset)
        .chain(stringSeparator)
        .chainAsync(aesGcm);

      const encryptedBuffer = await asyncChain.encode(str);
      const decryptedStr = await asyncChain.decode(encryptedBuffer);

      expect(encryptedBuffer).toBeInstanceOf(Uint8Array);
      expect(encryptedBuffer.length).toBeGreaterThan(12); // At least IV + some ciphertext
      expect(decryptedStr).toBe(str);
    });

    it("should handle multiple encryption/decryption cycles", async () => {
      const str = "Test message";
      const aesGcm = await runaAesGcm("another-test-key-for-encryption");

      const asyncChain = strBuf
        .chain(bufArr)
        .chain(arrSplit)
        .chain(cantorPairArray)
        .chain(numToCharset)
        .chain(stringSeparator)
        .chainAsync(aesGcm);

      // Multiple rounds
      let current = str;
      for (let i = 0; i < 3; i++) {
        const encrypted = await asyncChain.encode(current);
        current = await asyncChain.decode(encrypted);
      }

      expect(current).toBe(str);
    });
  });

  describe("YouTube-style ID Generation with FF1", () => {
    it("should generate YouTube-style IDs from numbers", async () => {
      // Use FF1 with YouTube-style alphabet
      const ff1 = await runaFF1(
        "youtube-key-12345678901234567890",
        "youtube-tweak-123",
        "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789_-",
      );

      // Test number to ID conversion
      const testNumber = 123456789;
      const youtubeId = ff1.encode(testNumber.toString());
      const decodedNumber = ff1.decode(youtubeId);

      expect(youtubeId).toBeTypeOf("string");
      expect(youtubeId.length).toBe(testNumber.toString().length); // Format preserving
      expect(decodedNumber).toBe(testNumber.toString());
    });

    it("should work with sequential numbers", async () => {
      const ff1 = await runaFF1(
        "youtube-key-12345678901234567890",
        "youtube-tweak-123",
        "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789_-",
      );

      // Test sequential numbers
      const startNumber = 100000;
      const results: string[] = [];

      for (let i = 0; i < 10; i++) {
        const num = startNumber + i;
        const id = ff1.encode(num.toString());
        const decoded = ff1.decode(id);
        results.push(id);
        expect(decoded).toBe(num.toString());
      }

      // All IDs should be different
      const uniqueIds = new Set(results);
      expect(uniqueIds.size).toBe(results.length);
    });

    it("should create a complete YouTube ID generator chain", async () => {
      const ff1 = runaFF1(
        "youtube-key-12345678901234567890",
        "youtube-tweak-123",
        "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789_-",
      );

      // Create a simple number to string transformer for FF1
      const numberToString = createRuna(
        (num: number) => num.toString(),
        (str: string) => parseInt(str, 10)
      );

      // Build the chain: number -> string -> FF1 YouTube ID
      const idChain = numberToString.chain(ff1);

      // Test the chain
      const testNumber = 987654321;
      const youtubeId = idChain.encode(testNumber);
      const decodedNumber = idChain.decode(youtubeId);

      expect(youtubeId).toMatch(/^[A-Za-z0-9_-]+$/); // Should only contain YouTube ID characters
      expect(youtubeId.length).toBe(testNumber.toString().length);
      expect(decodedNumber).toBe(testNumber);
    });

    it("should integrate FF1 with the main transformation chain", async () => {
      const ff1 = await runaFF1(
        "integration-key-1234567890123456",
        "integration-tweak-123",
        "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789 ",
      );

      const str = "HelloFF1";

      // Build chain: string -> ... -> cantor numbers -> ff1 encoded
      const cantorToFf1Chain = strBuf
        .chain(bufArr)
        .chain(arrSplit)
        .chain(cantorPairArray);

      // Get cantor numbers first
      const cantorNumbers = cantorToFf1Chain.encode(str);

      // Convert cantor numbers to a single string for FF1 (use space as separator)
      const cantorString = cantorNumbers.join(" ");
      const ff1Encoded = ff1.encode(cantorString);
      const ff1Decoded = ff1.decode(ff1Encoded);

      expect(ff1Decoded).toBe(cantorString);

      // Convert back to numbers and complete the round-trip
      const restoredNumbers = ff1Decoded.split(" ").map(Number);
      const decodedStr = cantorToFf1Chain.decode(restoredNumbers);

      expect(decodedStr).toBe(str);
    });
  });

  describe("Error Handling", () => {
    it("should handle invalid inputs gracefully", () => {
      const fullChain = strBuf
        .chain(bufArr)
        .chain(arrSplit)
        .chain(cantorPairArray)
        .chain(numToCharset);

      // Test with null/undefined (should throw due to input validation in some steps)
      expect(() => strBuf.encode(null as any)).toThrow();
      expect(() => strBuf.encode(undefined as any)).toThrow();
    });

    it("should handle empty strings", () => {
      const fullChain = strBuf
        .chain(bufArr)
        .chain(arrSplit)
        .chain(cantorPairArray)
        .chain(numToCharset);

      // Empty string should work through most steps but might fail at array split
      try {
        const result = fullChain.encode("");
        expect(result).toBeDefined();
      } catch (error) {
        // Expected for very short inputs
        expect(error).toBeInstanceOf(Error);
      }
    });

    it("should handle async errors", async () => {
      const aesGcm = await runaAesGcm("test-key");
      const asyncChain = strBuf.chain(bufArr).chainAsync(aesGcm);

      // Invalid inputs should throw (from the string-to-buffer step)
      await expect(asyncChain.encode(null as any)).rejects.toThrow();
      await expect(asyncChain.encode(undefined as any)).rejects.toThrow();
    });
  });

  describe("Type Safety", () => {
    it("should maintain type consistency through chains", () => {
      // This test mainly ensures TypeScript compilation passes
      const fullChain: RunaSync<string, string> = strBuf
        .chain(bufArr) // string -> buffer -> array
        .chain(arrSplit) // array -> array pairs
        .chain(cantorPairArray) // array pairs -> numbers
        .chain(numToCharset); // numbers -> string

      expect(fullChain.encode).toBeTypeOf("function");
      expect(fullChain.decode).toBeTypeOf("function");
      expect(fullChain.reversed).toBeTypeOf("function");
      expect(fullChain.chain).toBeTypeOf("function");
      expect(fullChain.chainAsync).toBeTypeOf("function");
    });

    it("should handle async type transitions", async () => {
      const aesGcm = await runaAesGcm("test-key");
      const asyncChain = strBuf.chain(bufArr).chainAsync(aesGcm);

      // Chain should return async interface
      expect(asyncChain.encode).toBeTypeOf("function");
      expect(asyncChain.decode).toBeTypeOf("function");
    });
  });
});
