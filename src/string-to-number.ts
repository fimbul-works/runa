import { createRuna } from "./runa.js";

/**
 * Creates a bidirectional string-to-number transformation.
 *
 * This utility converts between strings and numbers with support for different numeric bases
 * (radix). When no radix is specified, it handles decimal and floating-point numbers.
 * With a radix, it converts between strings and integers in bases 2-36 (binary to base36).
 *
 * Perfect for parsing numeric input, handling different number systems, or converting
 * between numeric representations in data processing pipelines.
 *
 * @param radix - Optional numeric base (2-36) for integer conversion. If omitted, handles decimal/floating-point
 * @returns A RunaSync<string, number> instance that provides bidirectional string/number conversion
 * @throws {Error} When radix is less than 2 or when conversion fails
 *
 * @example
 * // Decimal and floating-point conversion
 * const decimalConverter = runaStringToNumber();
 *
 * // Parse decimal strings
 * const num1 = decimalConverter.encode("42"); // 42
 * const num2 = decimalConverter.encode("3.14159"); // 3.14159
 * const num3 = decimalConverter.encode("-123.45"); // -123.45
 *
 * // Convert numbers back to strings
 * const str1 = decimalConverter.decode(42); // "42"
 * const str2 = decimalConverter.decode(3.14159); // "3.14159"
 * const str3 = decimalConverter.decode(-123.45); // "-123.45"
 *
 * @example
 * // Binary conversion (base 2)
 * const binaryConverter = runaStringToNumber(2);
 *
 * const binaryNum = binaryConverter.encode("1010"); // 10
 * const binaryStr = binaryConverter.decode(10); // "1010"
 *
 * @example
 * // Hexadecimal conversion (base 16)
 * const hexConverter = runaStringToNumber(16);
 *
 * const hexNum = hexConverter.encode("FF"); // 255
 * const hexStr = hexConverter.decode(255); // "ff"
 *
 * @example
 * // Base36 conversion (for compact IDs)
 * const base36Converter = runaStringToNumber(36);
 *
 * const base36Num = base36Converter.encode("Z9"); // 35 * 36 + 9 = 1269
 * const base36Str = base36Converter.decode(1269); // "z9"
 *
 * @example
 * // Octal conversion (base 8)
 * const octalConverter = runaStringToNumber(8);
 *
 * const octalNum = octalConverter.encode("755"); // 493
 * const octalStr = octalConverter.decode(493); // "755"
 *
 * // Invalid conversion throws error
 * try {
 *   decimalConverter.encode("not a number");
 * } catch (error) {
 *   console.log(error.message); // "Not a number: not a number"
 * }
 */
export const runaStringToNumber = (radix?: number) => {
  if (typeof radix === "number" && radix < 2) {
    throw new Error(`Radix must be 2 or greater: ${radix}`);
  }

  return createRuna(
    (str: string) => {
      const n =
        typeof radix === "number"
          ? Number.parseInt(str, radix)
          : Number.parseFloat(str);
      if (Number.isNaN(n)) {
        throw new Error(`Not a number: ${str}`);
      }
      return n;
    },
    (num: number) => {
      if (typeof num !== "number") {
        throw new Error(`Not a number: ${num}`);
      }
      return num.toString(radix);
    },
  );
};

export default runaStringToNumber;
