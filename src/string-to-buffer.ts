import { createRuna } from "./runa.js";

export const runaStringToBuffer = () => {
  const encoder = new TextEncoder();
  const decoder = new TextDecoder();
  return createRuna(
    (str: string) => {
      if (str === null || str === undefined || str.length === 0) {
        throw new Error("String cannot be empty");
      }
      return encoder.encode(str) as Uint8Array<ArrayBufferLike>;
    },
    (buffer: Uint8Array<ArrayBufferLike>) => {
      if (buffer === null || buffer === undefined || buffer.length === 0) {
        throw new Error("Buffer cannot be empty");
      }
      return decoder.decode(buffer);
    },
  );
};
