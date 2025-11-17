import { createRuna } from "./runa.js";

export const runaNumberToChar = () => {
  return createRuna(
    (charCode: number) => {
      if (typeof charCode !== "number") {
        throw new Error(`Invalid character code: ${charCode}`);
      }
      if (charCode <= 0 || charCode > 255) {
        throw new Error(`Character code out of range 0-255: ${charCode}`);
      }
      return String.fromCharCode(charCode);
    },
    (char: string) => {
      if (typeof char !== "string" || char.length !== 1) {
        throw new Error(`Invalid character: ${JSON.stringify(char)}`);
      }
      return char.charCodeAt(0);
    },
  );
};

export default runaNumberToChar;
