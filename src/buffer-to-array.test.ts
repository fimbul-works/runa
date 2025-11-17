import { beforeEach, describe, expect, it, vi } from "vitest";
import { runaBufferToArray } from "./buffer-to-array.js";

describe("runaBufferToArray", () => {
  let bufferToArray: ReturnType<typeof runaBufferToArray>;

  beforeEach(() => {
    bufferToArray = runaBufferToArray();
  });

  describe("Basic functionality", () => {
    it("should convert Uint8Array to number array", () => {
      const input = new Uint8Array([1, 2, 3, 4, 5]);
      const expected = [1, 2, 3, 4, 5];
      const result = bufferToArray.encode(input);
      expect(result).toEqual(expected);
    });

    it("should convert number array to Uint8Array", () => {
      const input = [1, 2, 3, 4, 5];
      const expected = new Uint8Array([1, 2, 3, 4, 5]);
      const result = bufferToArray.decode(input);
      expect(result).toEqual(expected);
    });

    it("should handle empty Uint8Array", () => {
      const input = new Uint8Array([]);
      const expected: number[] = [];
      const result = bufferToArray.encode(input);
      expect(result).toEqual(expected);
    });

    it("should handle empty number array", () => {
      const input: number[] = [];
      const expected = new Uint8Array([]);
      const result = bufferToArray.decode(input);
      expect(result).toEqual(expected);
    });

    it("should handle single element", () => {
      const input = new Uint8Array([42]);
      const expected = [42];
      const result = bufferToArray.encode(input);
      expect(result).toEqual(expected);
    });

    it("should handle single element array", () => {
      const input = [42];
      const expected = new Uint8Array([42]);
      const result = bufferToArray.decode(input);
      expect(result).toEqual(expected);
    });
  });

  describe("Perfect reversibility", () => {
    it("should be perfectly bidirectional for regular buffers", () => {
      const original = new Uint8Array([10, 20, 30, 40, 50]);
      const array = bufferToArray.encode(original);
      const restored = bufferToArray.decode(array);
      expect(restored).toEqual(original);
    });

    it("should handle byte range values (0-255)", () => {
      const original = new Uint8Array([0, 1, 128, 254, 255]);
      const array = bufferToArray.encode(original);
      const restored = bufferToArray.decode(array);
      expect(restored).toEqual(original);
    });

    it("should handle repeated encode/decode operations", () => {
      const original = new Uint8Array([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
      let current = original;

      for (let i = 0; i < 10; i++) {
        const array = bufferToArray.encode(current);
        current = bufferToArray.decode(array);
      }

      expect(current).toEqual(original);
    });

    it("should maintain byte order perfectly", () => {
      const original = new Uint8Array([255, 254, 253, 252, 251]);
      const array = bufferToArray.encode(original);
      const restored = bufferToArray.decode(array);

      // Verify each byte is in the correct position
      for (let i = 0; i < original.length; i++) {
        expect(restored[i]).toBe(original[i]);
      }
    });
  });

  describe("Different buffer types", () => {
    it("should handle ArrayBuffer", () => {
      const arrayBuffer = new ArrayBuffer(4);
      const uint8View = new Uint8Array(arrayBuffer);
      uint8View[0] = 1;
      uint8View[1] = 2;
      uint8View[2] = 3;
      uint8View[3] = 4;

      const result = bufferToArray.encode(uint8View);
      expect(result).toEqual([1, 2, 3, 4]);
    });

    it("should handle Int8Array", () => {
      const input = new Int8Array([-1, 0, 1, 127, -128]);
      // Array.from preserves the actual Int8Array values, not converting to unsigned
      const expected = [-1, 0, 1, 127, -128];
      const result = bufferToArray.encode(input);
      expect(result).toEqual(expected);
    });

    it("should handle DataView", () => {
      const buffer = new ArrayBuffer(4);
      const dataView = new DataView(buffer);
      dataView.setUint8(0, 10);
      dataView.setUint8(1, 20);
      dataView.setUint8(2, 30);
      dataView.setUint8(3, 40);

      // Convert DataView to Uint8Array for encoding
      const uint8Array = new Uint8Array(buffer);
      const result = bufferToArray.encode(uint8Array);
      expect(result).toEqual([10, 20, 30, 40]);
    });

    it("should handle typed arrays with different sizes", () => {
      const buffer = new ArrayBuffer(8);
      const uint16Array = new Uint16Array(buffer);
      uint16Array[0] = 0x1234;
      uint16Array[1] = 0x5678;
      uint16Array[2] = 0x9ABC;
      uint16Array[3] = 0xDEF0;

      const uint8View = new Uint8Array(buffer);
      const result = bufferToArray.encode(uint8View);
      expect(result).toEqual([0x34, 0x12, 0x78, 0x56, 0xBC, 0x9A, 0xF0, 0xDE]);
    });
  });

  describe("Edge cases", () => {
    it("should handle arrays with values outside byte range", () => {
      const input = [-1, 256, 1000];
      const result = bufferToArray.decode(input);
      expect(result).toEqual(new Uint8Array([255, 0, 232])); // Values wrapped/modulo 256
    });

    it("should handle floating point numbers", () => {
      const input = [1.5, 2.7, 3.9];
      const result = bufferToArray.decode(input);
      expect(result).toEqual(new Uint8Array([1, 2, 3])); // Values truncated to integers
    });

    it("should handle arrays with null and undefined", () => {
      const input = [1, null, 2, undefined, 3] as any;
      const result = bufferToArray.decode(input);
      expect(result).toEqual(new Uint8Array([1, 0, 2, 0, 3])); // null/undefined treated as 0
    });

    it("should handle very large buffers", () => {
      const largeArray = Array.from({ length: 10000 }, (_, i) => i % 256);
      const largeBuffer = new Uint8Array(largeArray);
      const result = bufferToArray.encode(largeBuffer);
      const restored = bufferToArray.decode(result);
      expect(restored).toEqual(largeBuffer);
    });

    it("should handle sparse arrays", () => {
      const sparseArray = new Array(10);
      sparseArray[0] = 1;
      sparseArray[5] = 100;
      sparseArray[9] = 255;

      const result = bufferToArray.decode(sparseArray);
      expect(result).toEqual(new Uint8Array([1, 0, 0, 0, 0, 100, 0, 0, 0, 255]));
    });
  });

  describe("Error handling", () => {
    it("should handle non-iterable input for encode gracefully", () => {
      // The implementation doesn't throw errors for invalid input
      expect(() => bufferToArray.encode(123 as any)).not.toThrow();
      expect(() => bufferToArray.encode("not iterable" as any)).not.toThrow();
      expect(() => bufferToArray.encode({} as any)).not.toThrow();
    });

    it("should handle non-array input for decode gracefully", () => {
      // The implementation doesn't throw errors for invalid input
      expect(() => bufferToArray.decode(123 as any)).not.toThrow();
      expect(() => bufferToArray.decode("not an array" as any)).not.toThrow();
      expect(() => bufferToArray.decode({} as any)).not.toThrow();
    });

    it("should handle null and undefined inputs", () => {
      // The implementation actually throws on null/undefined for encode
      expect(() => bufferToArray.encode(null as any)).toThrow("object null is not iterable");
      expect(() => bufferToArray.encode(undefined as any)).toThrow();

      // But decode handles them gracefully by converting to empty arrays
      expect(() => bufferToArray.decode(null as any)).not.toThrow();
      expect(() => bufferToArray.decode(undefined as any)).not.toThrow();
    });
  });

  describe("Performance and efficiency", () => {
    it("should use Array.from for optimal performance", () => {
      const input = new Uint8Array([1, 2, 3, 4, 5]);
      const spy = vi.spyOn(Array, "from");
      const result = bufferToArray.encode(input);
      expect(spy).toHaveBeenCalledWith(input);
      spy.mockRestore();
    });

    it("should handle large buffers efficiently", () => {
      const largeBuffer = new Uint8Array(50000);
      for (let i = 0; i < largeBuffer.length; i++) {
        largeBuffer[i] = i % 256;
      }

      const start = performance.now();
      const array = bufferToArray.encode(largeBuffer);
      const restored = bufferToArray.decode(array);
      const end = performance.now();

      expect(restored).toEqual(largeBuffer);
      expect(end - start).toBeLessThan(100); // Should complete quickly
    });

    it("should not create unnecessary copies", () => {
      const original = new Uint8Array([1, 2, 3, 4, 5]);
      const array = bufferToArray.encode(original);
      const restored = bufferToArray.decode(array);

      // The restored should be a new Uint8Array, not a reference
      expect(restored).not.toBe(original);
      expect(restored).toEqual(original);
    });
  });

  describe("Real-world scenarios", () => {
    it("should handle binary data conversion", () => {
      // Simulate binary file data
      const binaryData = new Uint8Array([
        0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, // PNG header
        0x00, 0x00, 0x00, 0x0D, 0x49, 0x48, 0x44, 0x52, // IHDR chunk start
      ]);

      const array = bufferToArray.encode(binaryData);
      const restored = bufferToArray.decode(array);

      expect(array).toEqual([
        137, 80, 78, 71, 13, 10, 26, 10, // PNG header in decimal
        0, 0, 0, 13, 73, 72, 68, 82,     // IHDR chunk start in decimal
      ]);
      expect(restored).toEqual(binaryData);
    });

    it("should handle network packet data", () => {
      // Simulate a simple network packet
      const packet = new Uint8Array([
        0x45, 0x00, 0x00, 0x3C, // IP header
        0x6A, 0xB6, 0x40, 0x00, 0x40, 0x06, 0x00, 0x00, // More IP header
        0xC0, 0xA8, 0x01, 0x01, // Source IP
        0xC0, 0xA8, 0x01, 0x02, // Dest IP
      ]);

      const array = bufferToArray.encode(packet);
      const restored = bufferToArray.decode(array);

      expect(array.length).toBe(packet.length);
      expect(restored).toEqual(packet);
    });

    it("should handle image pixel data", () => {
      // Simulate 2x2 grayscale image data
      const pixelData = new Uint8Array([
        255, 0, 128, 64, // Four grayscale pixels
      ]);

      const array = bufferToArray.encode(pixelData);
      const restored = bufferToArray.decode(array);

      expect(array).toEqual([255, 0, 128, 64]);
      expect(restored).toEqual(pixelData);
    });
  });

  describe("Type safety", () => {
    it("should maintain Uint8Array type through decode", () => {
      const input = [1, 2, 3, 4, 5];
      const result = bufferToArray.decode(input);

      expect(result).toBeInstanceOf(Uint8Array);
      expect(result.length).toBe(5);
      expect(result[0]).toBe(1);
    });

    it("should return regular array from encode", () => {
      const input = new Uint8Array([1, 2, 3, 4, 5]);
      const result = bufferToArray.encode(input);

      expect(Array.isArray(result)).toBe(true);
      expect(result).not.toBeInstanceOf(Uint8Array);
      expect(result.length).toBe(5);
      expect(result[0]).toBe(1);
    });
  });
});