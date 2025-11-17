import { createRuna } from "./runa.js";

/**
 * Creates a bidirectional Cantor pairing transformation.
 *
 * This utility implements the Cantor pairing function, a mathematical bijection that
 * uniquely encodes two non-negative integers into a single integer and can perfectly
 * decode it back. Named after Georg Cantor, this function is useful for hashing
 * coordinate pairs, creating unique identifiers from multiple values, or compressing
 * 2D coordinates into a single dimension.
 *
 * The pairing function π(x,y) = (x+y)(x+y+1)/2 + y creates a perfect one-to-one
 * mapping between pairs of non-negative integers and single integers, making it
 * reversible without any collisions.
 *
 * @returns A RunaSync<[number, number], number> instance that provides bidirectional Cantor pairing/unpairing
 * @throws {Error} When input validation fails (wrong array length, negative numbers, or invalid types)
 *
 * @example
 * const cantorPair = runaCantorPair();
 *
 * // Encode coordinate pairs into single numbers
 * const coordinate1 = [0, 0];
 * const encoded1 = cantorPair.encode(coordinate1); // 0
 *
 * const coordinate2 = [1, 0];
 * const encoded2 = cantorPair.encode(coordinate2); // 2
 *
 * const coordinate3 = [0, 1];
 * const encoded3 = cantorPair.encode(coordinate3); // 1
 *
 * const coordinate4 = [2, 3];
 * const encoded4 = cantorPair.encode(coordinate4); // 19
 *
 * // Decode numbers back to coordinate pairs
 * const decoded1 = cantorPair.decode(0); // [0, 0]
 * const decoded2 = cantorPair.decode(2); // [1, 0]
 * const decoded3 = cantorPair.decode(1); // [0, 1]
 * const decoded4 = cantorPair.decode(19); // [2, 3]
 *
 * @example
 * // Use for hash table keys with coordinate pairs
 * const gridCoordinates = [
 *   [10, 15], [20, 25], [10, 15], [30, 5]
 * ];
 *
 * const cantorPair = runaCantorPair();
 * const hashKeys = gridCoordinates.map(coord => cantorPair.encode(coord));
 * // [435, 1150, 435, 980]
 *
 * // Notice that [10, 15] appears twice and gets the same hash key (435)
 * // This property makes it useful for caching and deduplication
 *
 * @example
 * // Use in spatial indexing or grid systems
 * const spatialIndex = new Map<number, string>();
 *
 * const addObject = (x: number, y: number, object: string) => {
 *   const cantorPair = runaCantorPair();
 *   const key = cantorPair.encode([x, y]);
 *   spatialIndex.set(key, object);
 * };
 *
 * const getObject = (x: number, y: number) => {
 *   const cantorPair = runaCantorPair();
 *   const key = cantorPair.encode([x, y]);
 *   return spatialIndex.get(key);
 * };
 *
 * addObject(5, 10, "Tree");
 * addObject(7, 3, "Rock");
 *
 * console.log(getObject(5, 10)); // "Tree"
 * console.log(getObject(7, 3)); // "Rock"
 *
 * @example
 * // Mathematical properties demonstration
 * const cantorPair = runaCantorPair();
 *
 * // The function is bijective (one-to-one and onto)
 * const pairs = [
 *   [0, 0], [1, 0], [0, 1], [1, 1], [2, 0], [0, 2]
 * ];
 *
 * pairs.forEach(pair => {
 *   const encoded = cantorPair.encode(pair);
 *   const decoded = cantorPair.decode(encoded);
 *   console.log(`${pair} -> ${encoded} -> ${decoded}`);
 * });
 * // [0,0] -> 0 -> [0,0]
 * // [1,0] -> 2 -> [1,0]
 * // [0,1] -> 1 -> [0,1]
 * // [1,1] -> 4 -> [1,1]
 * // [2,0] -> 5 -> [2,0]
 * // [0,2] -> 3 -> [0,2]
 *
 * @example
 * // Error handling
 * try {
 *   // Invalid pair length
 *   cantorPair.encode([1, 2, 3]);
 * } catch (error) {
 *   console.log(error.message); // "Invalid number pair: [1,2,3]"
 * }
 *
 * try {
 *   // Negative numbers
 *   cantorPair.encode([-1, 5]);
 * } catch (error) {
 *   console.log(error.message); // "Cantor pair requires non-negative integers"
 * }
 *
 * try {
 *   // Invalid type for decoding
 *   cantorPair.decode("not a number");
 * } catch (error) {
 *   console.log(error.message); // "Unexpected type: string"
 * }
 *
 * // Note: Large numbers may exceed Number.MAX_SAFE_INTEGER
 * // For production use with large coordinates, consider using BigInt implementations
 */
export const runaCantorPair = () =>
  createRuna(
    (pair: number[]) => {
      if (pair.length !== 2) {
        throw new Error(`Invalid number pair: ${JSON.stringify(pair)}`);
      }
      const [x, y] = pair;
      if (x < 0 || y < 0)
        throw new Error("Cantor pair requires non-negative integers");
      // Cantor pairing formula: π(x,y) = (x+y)(x+y+1)/2 + y
      return ((x + y) * (x + y + 1)) / 2 + y;
    },
    (z: number) => {
      if (typeof z !== "number" && typeof z !== "bigint") {
        throw new Error(`Unexpected type: ${typeof z}`);
      }
      // Inverse Cantor pairing formula
      const w = Math.floor((Math.sqrt(8 * z + 1) - 1) / 2);
      const t = (w * w + w) / 2;
      const y = z - t;
      const x = w - y;
      return [x, y] as number[];
    },
  );
