import type { Runa } from "./types.js";

export const runaBase64 = () => {
  return {
    encode: (str: string) => btoa(str),
    decode: (b64: string) => atob(b64),
  } as Runa<string, string>;
};
