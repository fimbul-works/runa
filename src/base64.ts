import { createRuna } from "./runa.js";

export const runaBase64 = () => {
  return createRuna(
    (str: string) => btoa(str),
    (b64: string) => atob(b64),
  );
};
