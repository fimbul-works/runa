import { createRuna } from "./runa.js";

export const runaStringToBuffer = () => {
  const encoder = new TextEncoder();
  const decoder = new TextDecoder();
  return createRuna(
    (str: string) => encoder.encode(str),
    (buffer: Uint8Array) => decoder.decode(buffer),
  );
};
