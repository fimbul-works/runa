import { runaCantorPair } from "./cantor-pair.js";
import { createRuna } from "./runa.js";

export const runaCantorPairArray = () => {
  const cantorPair = runaCantorPair();

  return createRuna(
    (pairs: number[][]) => {
      if (!Array.isArray(pairs)) {
        throw new Error(`Invalid array: ${pairs}`);
      }

      return pairs.map((pair, index) => {
        if (!Array.isArray(pair)) {
          throw new Error(`Invalid pair at index ${index}: ${JSON.stringify(pair)}`);
        }
        return cantorPair.encode(pair);
      });
    },
    (numbers: number[]) => {
      if (!Array.isArray(numbers)) {
        throw new Error(`Invalid array: ${numbers}`);
      }

      return numbers.map((num, index) => {
        if (typeof num !== 'number') {
          throw new Error(`Invalid number at index ${index}: ${JSON.stringify(num)}`);
        }
        return cantorPair.decode(num);
      });
    }
  );
};