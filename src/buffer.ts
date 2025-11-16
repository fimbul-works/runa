import type { Runa } from "./types.js";

export const runaBuffer = () => {
  const encoder = new TextEncoder();
  const decoder = new TextDecoder();
  return {
    encode: (str: string) => encoder.encode(str),
    decode: (buffer: Uint8Array) => decoder.decode(buffer),
  } as Runa<string, Uint8Array>;
};
