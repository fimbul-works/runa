import type { Runa } from "./types.js";

export const runaURI = () => {
  return {
    encode: (str: string) => encodeURIComponent(str),
    decode: (str: string) => decodeURIComponent(str),
  } as Runa<string, string>;
};

export default runaURI;
