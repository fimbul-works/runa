import { createRuna } from "./runa.js";

export const runaBufferToArray = () => {
  return createRuna(
    (buffer: Iterable<number>) => Array.from(buffer) as Array<number>,
    (arr: Array<number>) => new Uint8Array(arr),
  );
};
