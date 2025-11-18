

# @fimbul-works/runa

*Runa (ᚱᚢᚾᚨ)* is a TypeScript library for creating elegant, bidirectional, and type-safe data transformations.

At its core, a **Runa** is a composable object with two fundamental methods: `encode` and `decode`. This design ensures that your data transformations are always reversible and perfectly type-safe, whether you're working with synchronous or asynchronous operations.

## Key Features

- **🔄 Bidirectional by Design:** Every transformation comes with an `encode` and a `decode` method, guaranteeing reversibility.
- **⛓️ Type-Safe Chaining:** Seamlessly compose transformations together with the `.chain()` and `.chainAsync()` methods. TypeScript infers the new input and output types at every step.
- **✨ Sync & Async:** Full support for both synchronous (`RunaSync`) and asynchronous (`RunaAsync`) transformations, which can be chained together.
- **🧩 Functional & Composable:** Built with a functional, factory-based approach, making it easy to create and share reusable transformation logic.

## Installation

```bash
npm install @fimbul-works/runa
# or
yarn add @fimbul-works/runa
# or
pnpm add @fimbul-works/runa
```

## Basic Usage

Start by creating a simple bidirectional transformation using `createRuna`.

```typescript
import { createRuna } from '@fimbul-works/runa';

const hex = createRuna(
  (n: number) => n.toString(16),
  (s: string) => parseInt(s, 16)
);

hex.encode(255) // "ff"
hex.decode("ff") // 255
```

## Chaining: String to Buffer to Array

One of the features of Runa is the ability to chain multiple transformations. Here's an example that converts a string to a buffer, and then converts the buffer to an array:

```typescript
import { createRuna } from '@fimbul-works/runa';

// 1. Create a string to buffer converter
const stringToBuffer = createRuna(
  (str: string) => Buffer.from(str, 'utf8'), // encode: string to buffer
  (buf: Buffer) => buf.toString('utf8'),     // decode: buffer to string
);

// 2. Create a buffer to array converter
const bufferToArray = createRuna(
  (buf: Buffer) => Array.from(buf),          // encode: buffer to array
  (arr: number[]) => Buffer.from(arr),       // decode: array to buffer
);

// 3. Chain them together to create a string to array converter
const stringToArray = stringToBuffer.chain(bufferToArray);

// Use the chained converter
const originalString = "Hello, Runa!";
const array = stringToArray.encode(originalString); // => [72, 101, 108, 108, 111, 44, 32, 82, 117, 110, 97, 33]
const reconstructedString = stringToArray.decode(array); // => "Hello, Runa!"

console.log(array); // [72, 101, 108, 108, 111, 44, 32, 82, 117, 110, 97, 33]
console.log(reconstructedString); // "Hello, Runa!"
```

This example demonstrates how Runa enables you to build complex transformation pipelines while maintaining type safety and bidirectional transformations at each step.

### More Examples

For comprehensive, executable examples demonstrating real-world use cases, see the **[./examples](./examples)** directory:

---

## Available Converters

Below is a comprehensive list of pre-built converters provided by the library:

### Core Conversion Utilities

#### `createRuna<TIn, TOut>(encode, decode)` → `RunaSync<TIn, TOut>`
Creates a bidirectional synchronous transformation between any two types.

#### `createRunaAsync<TIn, TOut>(encode, decode)` → `Promise<RunaAsync<TIn, TOut>>`
Creates a bidirectional asynchronous transformation between any two types.

### String & Text Processing

#### `runaBase64()` → `RunaSync<string, string>`
Converts between plain text and Base64 encoding. Handles Unicode characters correctly and works in both Node.js and browser environments.

#### `runaJSON<T>(useSuperJSON?: boolean)` → `RunaSync<T, string>`
Converts between TypeScript objects and JSON strings with enhanced capabilities. Uses SuperJSON by default to handle complex data types like Dates, Maps, Sets, and custom classes, ensuring perfect bidirectional conversion. Set `useSuperJSON` to `false` for standard JSON behavior.

#### `runaURI()` → `RunaSync<string, string>`
Encodes and decodes URI components using `encodeURIComponent` and `decodeURIComponent`.

#### `runaStringSplit(delimiter: string)` → `RunaSync<string, string[]>`
Splits strings into arrays and rejoins them with a specified delimiter.

#### `runaStringToNumber(radix?: number)` → `RunaSync<string, number>`
Converts strings to numbers and back using specified radix (base).

#### `runaStringToBuffer()` → `RunaSync<string, Uint8Array>`
Converts UTF-8 strings to Uint8Array buffers and back.

#### `runaStringPadStart(maxLength: number, fillString: string)` → `RunaSync<string, string>`
Adds padding to the beginning of strings to reach a specified maximum length. Handles multi-character fill strings and Unicode characters.

#### `runaStringPadEnd(maxLength: number, fillString: string)` → `RunaSync<string, string>`
Adds padding to the end of strings to reach a specified maximum length. Handles multi-character fill strings and Unicode characters.

### Arithmetic Operations

#### `runaAdd(additive: number)` → `RunaSync<number, number>`
Adds a constant value during encoding and subtracts it during decoding.

#### `runaMultiply(multiplier: number)` → `RunaSync<number, number>`
Multiplies by a constant value during encoding and divides by the same value during decoding. Throws error if multiplier is zero.

#### `runaPower(exponent: number)` → `RunaSync<number, number>`
Raises to a power during encoding and takes the corresponding root during decoding. Handles negative values with odd exponents and throws error for invalid combinations.

### Number & Array Processing

#### `runaNumberCharset(alphabet: string, minLength = 1)` → `RunaSync<number, string>`
Converts numbers to strings using a custom character set (alphabet) and back.

#### `runaNumberArrayCharset(alphabet: string, minLength = 1)` → `RunaSync<number[], string>`
Converts arrays of numbers to strings using a custom character set and back.

#### `runaNumberToChar()` → `RunaSync<number, string>`
Converts single numbers to their corresponding character representation and back.

#### `runaCantorPair()` → `RunaSync<[number, number], number>`
Encodes two numbers into a single number using the Cantor pairing function and back.

#### `runaCantorPairArray()` → `RunaSync<[number, number][], number[]>`
Applies Cantor pairing to arrays of number pairs.

#### `runaArraySplit<T>(chunkSize: number)` → `RunaSync<T[], T[][]>`
Splits arrays into chunks of specified size and rejoins them.

#### `runaArrayFlatten<T>(chunkSize: number)` → `RunaSync<T[][], T[]>`
Flattens 2D arrays into 1D arrays and re-chunks them. Validates chunk sizes.

#### `runaArrayJoin(separator = "")` → `RunaSync<number[], string>`
Converts arrays of numbers to strings using specified separator and back. Note: Uses different parsing for empty vs custom separators.

#### `runaBufferToArray()` → `RunaSync<Uint8Array, number[]>`
Converts Uint8Array buffers to number arrays and back.

### Cryptographic & Security

#### `runaAesGcm(key: string | BufferSource, salt?: BufferSource)` → `Promise<RunaAsync<string, Uint8ArrayLike>>`
Asynchronous AES-256-GCM encryption/decryption with key derivation.

#### `runaFF1(key: string | Buffer, tweak: string | Buffer, alphabet?: string, minLength?: number, maxLength?: number)` → `RunaAsync<string, string>`
Format-Preserving Encryption (FF1) for strings. Encrypts data while maintaining the same format and length.

## License

MIT License - See [LICENSE](LICENSE) file for details.

---

Built with 🔮 by [FimbulWorks](https://github.com/fimbul-works)
