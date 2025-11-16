import type { Runa } from "./types.js";

export const runaCantorPair = () => {
  return {
    encode: (pair: [number, number]) => {
      const [x, y] = pair;
      if (x < 0 || y < 0)
        throw new Error("Cantor pair requires non-negative integers");
      // Cantor pairing formula: π(x,y) = (x+y)(x+y+1)/2 + y
      return ((x + y) * (x + y + 1)) / 2 + y;
    },
    decode: (z: number) => {
      if (typeof z !== "number" && typeof z !== "bigint") {
        throw new Error(`Unexpected type: ${typeof z}`);
      }
      // Inverse Cantor pairing formula
      const w = Math.floor((Math.sqrt(8 * z + 1) - 1) / 2);
      const t = (w * w + w) / 2;
      const y = z - t;
      const x = w - y;
      return [x, y] as [number, number];
    },
  } as Runa<[number, number], number>;
};
