import { runaArraySplit } from "./array-split";
import { runaBufferToArray } from "./buffer-to-array";
import { runaCantorPair } from "./cantor-pair";
import runaNumberToChar from "./number-to-char";
import { createRuna, createRunaAsync } from "./runa";
import { runaStringToBuffer } from "./string-to-buffer";
import type { RunaAsync, RunaSync } from "./types";

const str = "Hello world!";

const strBuf = runaStringToBuffer();
const bufArr = runaBufferToArray();
const arrSplit = runaArraySplit<number>(2);
const cantorPair = runaCantorPair();
const arrFlat = arrSplit.reversed();
const numToChar = runaNumberToChar();

const chain = strBuf.chain(bufArr);

const result = chain.encode(str);
console.log({
  result,
  type:
    typeof result === "object"
      ? (result as Object).constructor.name
      : typeof result,
});
