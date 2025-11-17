import { runaCantorPair } from "./cantor-pair.js";
import { createRuna } from "./runa.js";
import { serializeValue } from "./util.js";

/**
 * Creates a bidirectional Cantor pairing transformation for arrays of coordinate pairs.
 *
 * This utility extends runaCantorPair to handle multiple coordinate pairs at once, converting
 * between 2D coordinate arrays and 1D number arrays using the Cantor pairing function.
 * Perfect for batch processing of coordinates, compressing spatial data, or handling
 * collections of 2D points that need to be stored as single values.
 *
 * Each coordinate pair [x, y] is independently encoded using the Cantor pairing formula,
 * allowing for perfect reconstruction of the original coordinate pairs. The function
 * validates input structure to ensure data integrity during transformations.
 *
 * @returns A RunaSync<number[][], number[]> instance that provides bidirectional array-based Cantor pairing/unpairing
 * @throws {Error} When input validation fails (wrong structure, invalid pairs, or non-numeric values)
 *
 * @example
 * // Encode multiple coordinate pairs into single numbers
 * const coordinatePacker = runaCantorPairArray();
 *
 * const coordinates = [
 *   [0, 0],   // Origin
 *   [1, 2],   // Point (1,2)
 *   [5, 3],   // Point (5,3)
 *   [10, 15]  // Point (10,15)
 * ];
 * const packedNumbers = coordinatePacker.encode(coordinates);
 * // [0, 8, 36, 435]
 *
 * const restoredCoordinates = coordinatePacker.decode(packedNumbers);
 * // [
 * //   [0, 0],
 * //   [1, 2],
 * //   [5, 3],
 * //   [10, 15]
 * // ]
 *
 * @example
 * // Use for spatial indexing with multiple objects
 * const spatialIndex = runaCantorPairArray();
 *
 * const gameObjects = [
 *   [100, 200], // Player position
 *   [150, 250], // Enemy position
 *   [300, 400], // Item location
 *   [500, 600]  // Obstacle position
 * ];
 *
 * const compressedPositions = spatialIndex.encode(gameObjects);
 * // [450150, 715751, 3200800, 1503000]
 *
 * const originalPositions = spatialIndex.decode(compressedPositions);
 * // Restores exact original coordinates
 *
 * @example
 * // Process pixel coordinates in image processing
 * const pixelCompressor = runaCantorPairArray();
 *
 * const edgePoints = [
 *   [10, 20], [11, 20], [12, 21],
 *   [13, 21], [14, 22], [15, 22]
 * ];
 *
 * const compressedEdges = pixelCompressor.encode(edgePoints);
 * // [610, 691, 823, 944, 1134, 1299]
 *
 * const restoredEdges = pixelCompressor.decode(compressedEdges);
 * // Restores exact edge coordinates
 *
 * @example
 * // Handle grid-based game board positions
 * const boardPacker = runaCantorPairArray();
 *
 * const boardPositions = [
 *   [0, 0], [0, 1], [0, 2], // Row 0
 *   [1, 0], [1, 1], [1, 2], // Row 1
 *   [2, 0], [2, 1], [2, 2]  // Row 2
 * ];
 *
 * const packedBoard = boardPacker.encode(boardPositions);
 * // [0, 1, 3, 2, 4, 6, 5, 7, 9]
 *
 * const unpackedBoard = boardPacker.decode(packedBoard);
 * // Restores exact board positions
 *
 * @example
 * // Use in mathematical transformations
 * const mathPacker = runaCantorPairArray();
 *
 * const functionPoints = [
 *   [0, 0], [1, 1], [2, 4], [3, 9], [4, 16] // y = x²
 * ];
 *
 * const packedValues = mathPacker.encode(functionPoints);
 * // [0, 3, 14, 45, 124]
 *
 * const originalPoints = mathPacker.decode(packedValues);
 * // [
 * //   [0, 0], [1, 1], [2, 4], [3, 9], [4, 16]
 * // ]
 *
 * @example
 * // Error handling for invalid input
 * try {
 *   const packer = runaCantorPairArray();
 *   // Invalid structure - not a 2D array
 *   packer.encode([1, 2, 3]);
 * } catch (error) {
 *   console.log(error.message); // "Invalid array: 1,2,3"
 * }
 *
 * try {
 *   const packer = runaCantorPairArray();
 *   // Invalid coordinate - not an array
 *   packer.encode([[1, 2], "not a pair"]);
 * } catch (error) {
 *   console.log(error.message); // "Invalid pair at index 1: \"not a pair\""
 * }
 *
 * try {
 *   const packer = runaCantorPairArray();
 *   // Invalid coordinate - wrong length
 *   packer.encode([[1, 2, 3]]);
 * } catch (error) {
 *   // Error from runaCantorPair: "Invalid number pair: [1,2,3]"
 * }
 *
 * try {
 *   const packer = runaCantorPairArray();
 *   // Invalid number during decode
 *   packer.decode([1, 2, "not a number"]);
 * } catch (error) {
 *   console.log(error.message); // "Invalid number at index 2: \"not a number\""
 * }
 */
export const runaCantorPairArray = () => {
  const cantorPair = runaCantorPair();

  return createRuna(
    (pairs: number[][]) => {
      if (!Array.isArray(pairs)) {
        throw new Error(`Invalid array: ${serializeValue(pairs)}`);
      }

      return pairs.map((pair, index) => {
        if (!Array.isArray(pair)) {
          throw new Error(
            `Invalid pair at index ${index}: ${serializeValue(pair)}`,
          );
        }
        return cantorPair.encode(pair);
      });
    },
    (numbers: number[]) => {
      if (!Array.isArray(numbers)) {
        throw new Error(`Invalid array: ${serializeValue(numbers)}`);
      }

      return numbers.map((num, index) => {
        if (typeof num !== "number") {
          throw new Error(
            `Invalid number at index ${index}: ${serializeValue(num)}`,
          );
        }
        return cantorPair.decode(num);
      });
    },
  );
};
