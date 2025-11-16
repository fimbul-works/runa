import type { Runa } from "./types.js";

export const runaJSON = <T>() => {
  return {
    encode: (str: T) => JSON.stringify(str),
    decode: (json: string) => JSON.parse(json) as T,
  } as Runa<T, string>;
};
