import { createRuna } from "./runa.js";

export const runaJSON = <T>() =>
  createRuna(
    (str: T) => JSON.stringify(str),
    (json: string) => JSON.parse(json) as T,
  );
