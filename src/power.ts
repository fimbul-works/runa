import { createRuna } from "./runa.js";
import { serializeValue } from "./util.js";

/**
 * Creates a bidirectional exponentiation transformation.
 *
 * This utility provides reversible power and root operations using exponentiation.
 * Perfect for square transformations, volume calculations, geometric scaling, or any
 * scenario requiring reversible power operations in mathematical transformations.
 *
 * The transformation raises to a power during encoding and takes the corresponding root
 * during decoding, ensuring perfect bidirectional conversion for valid inputs. Handles
 * both integer and fractional exponents, with special handling for negative values
 * and sign preservation.
 *
 * @param exponent - The power to raise during encoding (root taken during decoding). Cannot be 0.
 * @returns A RunaSync<number, number> instance that provides bidirectional exponentiation/root operations
 * @throws {Error} When exponent is 0 (division by zero during decoding)
 * @throws {Error} When inputs are not valid numbers during transformation
 * @throws {Error} When even exponents are applied to negative numbers (complex results)
 *
 * @example
 * // Create a square transformation
 * const square = runaPower(2);
 *
 * const length = 5;
 * const area = square.encode(length);
 * // 25 (5²)
 *
 * const originalLength = square.decode(area);
 * // 5 (√25)
 *
 * @example
 * // Create a cube transformation
 * const cube = runaPower(3);
 *
 * const sideLength = 4;
 * const volume = cube.encode(sideLength);
 * // 64 (4³)
 *
 * const originalSide = cube.decode(volume);
 * // 4 (³√64)
 *
 * @example
 * // Create a square root transformation
 * const sqrt = runaPower(0.5);
 *
 * const area = 16;
 * const length = sqrt.encode(area);
 * // 4 (√16)
 *
 * const originalArea = sqrt.decode(length);
 * // 16 (4²)
 *
 * @example
 * // Handle fractional exponents
 * const quarticRoot = runaPower(0.25);
 *
 * const value = 16;
 * const result = quarticRoot.encode(value);
 * // 2 (16^(1/4))
 *
 * const original = quarticRoot.decode(result);
 * // 16 (2⁴)
 *
 * @example
 * // Handle negative values with odd exponents
 * const cubeWithNegatives = runaPower(3);
 *
 * const negativeValue = -2;
 * const cubed = cubeWithNegatives.encode(negativeValue);
 * // -8 ((-2)³)
 *
 * const restored = cubeWithNegatives.decode(cubed);
 * // -2 (³√-8)
 *
 * @example
 * // Use in geometric calculations
 * const areaToRadius = runaPower(0.5); // Square root
 * const radiusToArea = runaPower(2); // Square
 *
 * const circleArea = Math.PI * 25; // Area of circle with radius 5
 * const radius = areaToRadius.encode(circleArea / Math.PI);
 * // 5 (radius from area)
 *
 * const restoredArea = radiusToArea.encode(radius);
 * // 25 (area from radius)
 *
 * @example
 * // Compound transformations
 * const scaleCoordinates = runaMultiply(2).chain(runaPower(2));
 *
 * const coordinate = 3;
 * const scaledSquared = scaleCoordinates.encode(coordinate);
 * // 36 ((3 * 2)²)
 *
 * const original = scaleCoordinates.decode(scaledSquared);
 * // 3 (√36 / 2)
 *
 * @example
 * // Scientific calculations
 * const logTransform = runaPower(Math.E); // Natural logarithm inverse
 *
 * const value = Math.log(10);
 * const exponential = logTransform.encode(value);
 * // 10 (e^ln(10))
 *
 * const restored = logTransform.decode(exponential);
 * // ln(10) (natural log of 10)
 *
 * @example
 * // Error handling
 * try {
 *   runaPower(0); // Exponent of 0
 * } catch (error) {
 *   console.log(error.message); // "Exponent cannot be 0"
 * }
 *
 * try {
 *   const square = runaPower(2);
 *   square.encode(-4); // Negative with even exponent
 * } catch (error) {
 *   console.log(error.message); // "Even exponents (2) require non-negative inputs: -4"
 * }
 *
 * try {
 *   const square = runaPower(2);
 *   square.decode("not a number");
 * } catch (error) {
 *   console.log(error.message); // "Invalid number: \"not a number\""
 * }
 *
 * @example
 * // Precision considerations
 * const cubeRoot = runaPower(1/3);
 *
 * const value = 27;
 * const result = cubeRoot.encode(value);
 * // 3 (³√27)
 *
 * const restored = cubeRoot.decode(result);
 * // 27 (3³, perfect restoration due to integer mathematics)
 *
 * // Note: Floating point precision may affect results with non-integer operations
 */
export const runaPower = (exponent: number) => {
  if (typeof exponent !== "number") {
    throw new Error("Exponent must be a number other than zero");
  }
  if (exponent === 0) {
    throw new Error("Exponent cannot be 0");
  }

  return createRuna(
    (initial: number) => {
      if (typeof initial !== "number") {
        throw new Error(`Invalid number: ${serializeValue(initial)}`);
      }
      // Handle negative numbers with even exponents
      if (exponent % 2 === 0 && initial < 0) {
        throw new Error(
          `Even exponents (${exponent}) require non-negative inputs: ${initial}`,
        );
      }
      return initial ** exponent;
    },
    (powered: number) => {
      if (typeof powered !== "number") {
        throw new Error(`Invalid number: ${serializeValue(powered)}`);
      }
      // Handle negative numbers with even exponents
      if (exponent % 2 === 0 && powered < 0) {
        throw new Error(
          `Even exponents (${exponent}) require non-negative inputs: ${powered}`,
        );
      }
      // For odd exponents, preserve sign
      if (exponent % 2 !== 0 && powered < 0) {
        return -(Math.abs(powered) ** (1 / exponent));
      }
      return powered ** (1 / exponent);
    },
  );
};
