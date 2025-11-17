import { createRuna } from "./runa";
import { serializeValue } from "./util";

/**
 * Creates a bidirectional multiplication transformation.
 *
 * This utility provides reversible arithmetic multiplication and division operations.
 * Perfect for scaling values, unit conversions, or applying multiplicative transformations
 * in data processing pipelines while maintaining the ability to perfectly restore original values.
 *
 * The transformation multiplies by a constant value during encoding and divides by the same
 * constant during decoding, ensuring perfect bidirectional conversion. Essential for
 * coordinate scaling, unit conversions, financial calculations, or any scenario requiring
 * reversible multiplicative adjustments.
 *
 * @param multiplier - The constant value to multiply during encoding (divided during decoding)
 * @returns A RunaSync<number, number> instance that provides bidirectional multiplication/division
 * @throws {Error} When inputs are not valid numbers during transformation
 * @throws {Error} When attempting to divide by zero during decoding
 *
 * @example
 * // Create a unit converter (meters to feet)
 * const meterToFeet = runaMultiply(3.28084); // 1 meter = 3.28084 feet
 *
 * const meters = 10;
 * const feet = meterToFeet.encode(meters);
 * // 32.8084
 *
 * const restoredMeters = meterToFeet.decode(feet);
 * // 10 (perfect restoration)
 *
 * @example
 * // Scale coordinates for display
 * const displayScale = runaMultiply(2); // 2x zoom
 *
 * const worldX = 150;
 * const worldY = 75;
 *
 * const screenX = displayScale.encode(worldX); // 300
 * const screenY = displayScale.encode(worldY); // 150
 *
 * const originalX = displayScale.decode(screenX); // 150
 * const originalY = displayScale.decode(screenY); // 75
 *
 * @example
 * // Currency conversion (USD to EUR)
 * const usdToEur = runaMultiply(0.85); // 1 USD = 0.85 EUR
 *
 * const usdAmount = 100;
 * const eurAmount = usdToEur.encode(usdAmount);
 * // 85 (100 USD = 85 EUR)
 *
 * const usdRestored = usdToEur.decode(eurAmount);
 * // 100 (back to original USD)
 *
 * @example
 * // Handle fractional scaling
 * const halveValues = runaMultiply(0.5);
 *
 * const original = [10, 20, 30, 40];
 * const halved = original.map(v => halveValues.encode(v));
 * // [5, 10, 15, 20]
 *
 * const restored = halved.map(v => halveValues.decode(v));
 * // [10, 20, 30, 20] (back to original)
 *
 * @example
 * // Handle negative multipliers
 * const invert = runaMultiply(-1);
 *
 * const value = 42;
 * const inverted = invert.encode(value);
 * // -42
 *
 * const original = invert.decode(inverted);
 * // 42
 *
 * @example
 * // Compound transformations
 * const celsiusToFahrenheit = runaMultiply(1.8).chain(runaAdd(32));
 *
 * const celsius = 25;
 * const fahrenheit = celsiusToFahrenheit.encode(celsius);
 * // 77 (25 * 1.8 + 32)
 *
 * const restoredCelsius = celsiusToFahrenheit.decode(fahrenheit);
 * // 25 ((77 - 32) / 1.8)
 *
 * @example
 * // Handle precision and floating point
 * const highPrecision = runaMultiply(0.333333333);
 *
 * const value = 3;
 * const result = highPrecision.encode(value);
 * // 0.999999999
 *
 * const restored = highPrecision.decode(result);
 * // 3 (approximately, accounting for floating point precision)
 *
 * // Error handling for zero division
 * try {
 *   const invalidScaler = runaMultiply(0);
 *   invalidScaler.encode(10); // This is fine
 *   invalidScaler.decode(0); // This would throw division by zero
 * } catch (error) {
 *   console.log(error.message); // Division by zero error
 * }
 */
export const runaMultiply = (multiplier: number) => {
  if (multiplier === 0) {
    throw new Error("Multiplier cannot be zero");
  }

  return createRuna(
    (initial: number) => {
      if (typeof initial !== "number") {
        throw new Error(`Invalid number: ${serializeValue(initial)}`);
      }
      return initial * multiplier;
    },
    (multiplied: number) => {
      if (typeof multiplied !== "number") {
        throw new Error(`Invalid number: ${serializeValue(multiplied)}`);
      }
      return multiplied / multiplier;
    },
  );
};
