import { createRuna } from "./runa.js";

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
