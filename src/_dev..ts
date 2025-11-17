import {
  runaArraySplit,
  runaCantorPairArray,
  runaStringSplit,
  createRuna
} from "./index.js";

// Level 1: Text -> Characters
const textToChars = runaStringSplit("");

// Level 2: Characters -> Numbers
const charsToNumbers = createRuna(
  (chars: string[]) => chars.map(char => char.charCodeAt(0)),
  (nums: number[]) => nums.map(num => String.fromCharCode(num))
);

// Level 3: Numbers -> Pairs -> Cantor
const numbersToPairs = runaArraySplit<number>(2);
const pairsToCantor = runaCantorPairArray();

// Build the inheritance chain
const transformed = textToChars
      .chain(charsToNumbers)
      .chain(numbersToPairs)
      .chain(pairsToCantor);

const magical = transformed.encode("Runic magic");
console.log({ original: "Runic magic", transformed: magical })
