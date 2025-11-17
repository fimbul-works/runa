import { createRuna } from "./runa.js";

export const runaURI = () =>
  createRuna(
    (str: string) => encodeURIComponent(str),
    (str: string) => decodeURIComponent(str),
  );

export default runaURI;
