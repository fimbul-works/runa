import { createRuna } from "./runa.js";
import { serializeValue } from "./util.js";

/**
 * Creates a bidirectional addition transformation.
 *
 * This utility provides reversible arithmetic addition and subtraction operations.
 * Perfect for applying constant offsets, adjusting values, or shifting numeric data
 * in transformation chains while maintaining the ability to perfectly restore original values.
 *
 * The transformation adds a constant value during encoding and subtracts the same
 * constant during decoding, ensuring perfect bidirectional conversion. Essential
 * for data normalization, coordinate transformations, or any scenario requiring
 * reversible numeric adjustments.
 *
 * @param additive - The constant value to add during encoding (subtracted during decoding)
 * @returns A RunaSync<number, number> instance that provides bidirectional addition/subtraction
 * @throws {Error} When inputs are not valid numbers during transformation
 *
 * @example
 * // Create a temperature converter (Celsius to Fahrenheit offset)
 * const celsiusOffset = runaAdd(32); // Add 32 for Fahrenheit conversion
 *
 * const celsiusTemp = 25;
 * const fahrenheitOffset = celsiusOffset.encode(celsiusTemp);
 * // 57 (25 + 32, intermediate step in Celsius to Fahrenheit conversion)
 *
 * const restoredCelsius = celsiusOffset.decode(fahrenheitOffset);
 * // 25 (57 - 32, back to original Celsius)
 *
 * @example
 * // Apply coordinate offset for game positioning
 * const offsetX = runaAdd(100);
 * const offsetY = runaAdd(50);
 *
 * const playerX = 10;
 * const playerY = 20;
 *
 * const screenX = offsetX.encode(playerX); // 110
 * const screenY = offsetY.encode(playerY); // 70
 *
 * const originalX = offsetX.decode(screenX); // 10
 * const originalY = offsetY.decode(screenY); // 20
 *
 * @example
 * // Adjust scoring system
 * const scoreBonus = runaAdd(1000);
 *
 * const baseScore = 450;
 * const adjustedScore = scoreBonus.encode(baseScore);
 * // 1450 (base score + bonus)
 *
 * const originalScore = scoreBonus.decode(adjustedScore);
 * // 450 (adjusted score - bonus)
 *
 * @example
 * // Handle negative offsets
 * const subtractOffset = runaAdd(-50);
 *
 * const value = 100;
 * const adjusted = subtractOffset.encode(value);
 * // 50 (100 - 50)
 *
 * const original = subtractOffset.decode(adjusted);
 * // 100 (50 + 50)
 *
 * @example
 * // Use in data normalization pipelines
 * const normalizeToZero = runaAdd(-42);
 * const denormalize = runaAdd(42);
 *
 * const measurements = [50, 60, 70, 80];
 * const normalized = measurements.map(m => normalizeToZero.encode(m));
 * // [8, 18, 28, 38] (normalized so that original 42 becomes 0)
 *
 * const original = normalized.map(n => denormalize.decode(n));
 * // [50, 60, 70, 80] (back to original values)
 *
 * @example
 * // Handle edge cases and precision
 * const preciseAdd = runaAdd(0.1);
 *
 * const preciseValue = 1.4;
 * const result = preciseAdd.encode(preciseValue);
 * // 1.5
 *
 * const restored = preciseAdd.decode(result);
 * // 1.4 (perfect restoration)
 *
 * // Error handling
 * try {
 *   const adder = runaAdd(10);
 *   adder.encode("not a number");
 * } catch (error) {
 *   console.log(error.message); // "Invalid number: \"not a number\""
 * }
 */
export const runaAdd = (additive: number) => {
  return createRuna(
    (initial: number) => {
      if (typeof initial !== "number") {
        throw new Error(`Invalid number: ${serializeValue(initial)}`);
      }
      return initial + additive;
    },
    (added: number) => {
      if (typeof added !== "number") {
        throw new Error(`Invalid number: ${serializeValue(added)}`);
      }
      return added - additive;
    },
  );
};
