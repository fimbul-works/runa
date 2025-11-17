

# @fimbul-works/runa

> Bidirectional, type-safe transformations for TypeScript.

Runa is a TypeScript library for creating elegant, bidirectional, and type-safe data transformations. Inspired by the Old Norse word for "secret" or "rune", Runa provides the tools to translate data from one form to another and back again, with confidence.

At its core, a "Runa" is a composable object with two fundamental methods: `encode` and `decode`. This design ensures that your data transformations are always reversible and perfectly type-safe, whether you're working with synchronous or asynchronous operations.

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

Start by creating a simple bidirectional transformation using `createRuna`. Then, chain them together to build more complex data pipelines.

```typescript
import { createRuna } from '@fimbul-works/runa';

// 1. Create a simple string <-> number converter
const stringToNumber = createRuna(
  (str: string) => parseInt(str, 10), // encode
  (num: number) => num.toString(),     // decode
);

// Use it
const num = stringToNumber.encode("123"); // => 123 (number)
const str = stringToNumber.decode(123);   // => "123" (string)

// 2. Create another converter
const numberToBoolean = createRuna(
  (num: number) => num > 0,              // encode
  (bool: boolean) => (bool ? 1 : 0),     // decode
);

// 3. Chain them together to create a new string <-> boolean converter
const stringToBoolean = stringToNumber.chain(numberToBoolean);

// The new converter is fully bidirectional and type-safe
const bool = stringToBoolean.encode("99");  // => true
const reversedStr = stringToBoolean.decode(false); // => "0"
```

## Advanced Example: String to Buffer to Array

One of the powerful features of Runa is the ability to chain multiple transformations. Here's an example that converts a string to a buffer, and then converts the buffer to an array:

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

#### `runaJSON<T>()` → `RunaSync<T, string>`
Converts between TypeScript objects and JSON strings. Type-safe serialization/deserialization.

#### `runaURI()` → `RunaSync<string, string>`
Encodes and decodes URI components using `encodeURIComponent` and `decodeURIComponent`.

#### `runaStringSplit(delimiter: string)` → `RunaSync<string, string[]>`
Splits strings into arrays and rejoins them with a specified delimiter. Perfect for CSV-style data.

#### `runaStringClean(separator = "|")` → `RunaSync<string, string>`
*Heuristic-based*: Removes separators from strings and attempts to restore them using chunking patterns. **Not perfectly reversible** - best for approximate restoration.

#### `runaStringSeparator(separator = "|")` → `RunaSync<string, string>`
*Perfectly reversible*: Removes and restores exact separator positions using encoding markers. Ideal for transformation chains.

#### `runaStringToNumber(radix?: number)` → `RunaSync<string, number>`
Converts strings to numbers and back using specified radix (base).

#### `runaStringToBuffer()` → `RunaSync<string, Uint8Array>`
Converts UTF-8 strings to Uint8Array buffers and back.

### Number & Array Processing

#### `runaNumberCharset(alphabet: string, minLength = 1)` → `RunaSync<number, string>`
Converts numbers to strings using a custom character set (alphabet) and back. Perfect for creating custom ID systems.

#### `runaNumberArrayCharset(alphabet: string, minLength = 1)` → `RunaSync<number[], string>`
Converts arrays of numbers to strings using a custom character set and back.

#### `runaNumberToChar()` → `RunaSync<number, string>`
Converts single numbers to their corresponding character representation and back.

#### `runaCantorPair()` → `RunaSync<[number, number], number>`
Encodes two numbers into a single number using the Cantor pairing function and back. Useful for hashing coordinate pairs.

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

#### `runaAESGCM(key: string)` → `Promise<RunaAsync<string, Uint8Array>>`
Asynchronous AES-256-GCM encryption/decryption with key derivation. Perfect for sensitive data in transformation chains.

#### `runaFF1(key: string, options)` → `RunaAsync<string, string>`
Format-Preserving Encryption (FF1) for strings. Encrypts data while maintaining the same format and length. Ideal for ID obfuscation, tokenization, and YouTube-style ID generation.

### Example: ID Generation Pipeline

Create YouTube-style IDs from numbers with perfect reversibility:

```typescript
import { runaNumberCharset, runaStringSplit } from '@fimbul-works/runa';

// YouTube-like alphabet
const alphabet = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
const idEncoder = runaNumberCharset(alphabet);

// Obfuscate numbers by converting to string -> characters
const obfuscateId = runaStringSplit('').chain(idEncoder);
const deobfuscateId = obfuscateId.reversed();

// Usage
const userId = 12345;
const shortId = obfuscateId.encode(userId.toString());    // "a1b"
const originalId = deobfuscateId.decode(shortId);          // "12345"
```

### Example: Secure Data Pipeline

Build a complete data processing pipeline with encryption:

```typescript
import {
  runaJSON,
  runaBase64,
  runaAESGCM,
  createRunaAsync
} from '@fimbul-works/runa';

type SecureData = {
  userId: number;
  message: string;
  timestamp: number;
};

// Build secure pipeline
const securePipeline = runaJSON<SecureData>()
  .chain(runaBase64())
  .chainAsync(await runaAESGCM('your-secret-key'));

const decryptPipeline = securePipeline.reversed();

// Usage
const data: SecureData = {
  userId: 12345,
  message: 'Secret message',
  timestamp: Date.now()
};

const encrypted = await securePipeline.encode(data);
const decrypted = await decryptPipeline.decode(encrypted);

console.log(encrypted); // Encrypted Uint8Array
console.log(decrypted); // Original SecureData object
```

### Example: CSV Processing

Process CSV data with validation and transformation:

```typescript
import { runaStringSplit, createRuna } from '@fimbul-works/runa';

type UserRecord = {
  id: number;
  name: string;
  email: string;
  active: boolean;
};

// Parse CSV with validation
const parseUserCSV = runaStringSplit(',').chain(
  createRuna(
    (fields: string[]) => ({
      id: parseInt(fields[0], 10),
      name: fields[1].trim(),
      email: fields[2].trim().toLowerCase(),
      active: fields[3] === 'true'
    }),
    (user: UserRecord) => [
      user.id.toString(),
      user.name,
      user.email,
      user.active ? 'true' : 'false'
    ].join(',')
  )
);

// Usage
const csvLine = '12345,John Doe,JOHN@EXAMPLE.COM,true';
const userRecord = parseUserCSV.encode(csvLine);
const backToCsv = parseUserCSV.decode(userRecord);

console.log(userRecord);  // { id: 12345, name: "John Doe", email: "john@example.com", active: true }
console.log(backToCsv);  // "12345,John Doe,john@example.com,true"
```

## Custom Transformations

Create your own transformations with `createRuna`:

```typescript
import { createRuna } from '@fimbul-works/runa';

// Temperature conversion
const celsiusToFahrenheit = createRuna(
  (celsius: number) => (celsius * 9/5) + 32,
  (fahrenheit: number) => (fahrenheit - 32) * 5/9
);

// String validation
const validateEmail = createRuna(
  (email: string) => {
    const isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    if (!isValid) throw new Error('Invalid email');
    return email.toLowerCase();
  },
  (email: string) => email
);

// Custom object transformation
const userToDto = createRuna(
  (user: { id: number; name: string; email: string }) => ({
    userId: user.id,
    displayName: user.name.toUpperCase(),
    contact: user.email
  }),
  (dto: { userId: number; displayName: string; contact: string }) => ({
    id: dto.userId,
    name: dto.displayName.toLowerCase(),
    email: dto.contact
  })
);

// Chain custom transformations
const processUser = validateEmail.chain(userToDto);

const result = processUser.encode('John@Example.com');
// { userId: undefined, displayName: 'JOHN@EXAMPLE.COM', contact: 'john@example.com' }
```

## Advanced Usage

### Error Handling
```typescript
const safeTransform = createRuna(
  (data: string) => {
    try {
      return JSON.parse(data);
    } catch (error) {
      throw new Error(`Invalid JSON: ${error.message}`);
    }
  },
  (obj: any) => JSON.stringify(obj)
);
```

### Async Transformations
```typescript
import { createRunaAsync } from '@fimbul-works/runa';

const fetchUser = createRunaAsync(
  async (id: number) => {
    const response = await fetch(`/api/users/${id}`);
    return response.json();
  },
  async (user: any) => {
    const response = await fetch(`/api/users/${user.id}`, {
      method: 'PUT',
      body: JSON.stringify(user)
    });
    return user.id;
  }
);
```

## The Runa Philosophy

**Bidirectional by Nature**: Every transformation in Runa knows how to reverse itself. This design choice eliminates entire classes of bugs where data can be transformed but not perfectly restored.

**Type Safety as Foundation**: TypeScript's type system ensures that your transformation chains are validated at compile-time. If a transformation doesn't make sense (like trying to encode a string as a buffer that expects a number), TypeScript will catch it before runtime.

**Composability as Superpower**: Simple transformations become powerful when chained together. Runa's chaining syntax lets you build complex data pipelines from reusable, testable components.

**Functional Elegance**: Each converter is a pure function factory. Given the same input, it always produces the same output, making your transformations predictable, testable, and side-effect free.

### When to Use Runa

- **Data Pipeline Engineering**: Build reversible data processing pipelines
- **API Response Transformation**: Convert between different data formats while maintaining the ability to reverse
- **Configuration Management**: Encode/decode configuration values safely
- **Cryptographic Applications**: Build encryption/decryption chains with type safety
- **ID Generation & Obfuscation**: Create reversible ID systems
- **Data Validation**: Transform validated data while keeping original values accessible

### When NOT to Use Runa

- **One-way Transformations**: If you never need to reverse a transformation, Runa adds unnecessary overhead
- **Performance-Critical Path**: The type safety and bidirectional nature comes with some overhead
- **Simple Conversions**: For trivial conversions, built-in JavaScript methods may be more appropriate

## Advanced Patterns

### Inheritance Chains
Build transformations with multiple levels of inheritance:

```typescript
import {
  runaStringSplit,
  runaNumberArrayCharset,
  runaCantorPairArray,
  runaArraySplit
} from '@fimbul-works/runa';

// Level 1: Text -> Characters
const textToChars = runaStringSplit('');

// Level 2: Characters -> Numbers
const charsToNumbers = runaNumberArrayCharset('ᚠᚢᚾᛅ'); // Elder Futhark RUNA

// Level 3: Numbers -> Pairs -> Cantor
const numbersToPairs = runaArraySplit<number>(2);
const pairsToCantor = runaCantorPairArray();

// Build the inheritance chain
const transformText = textToChars
  .chain(charsToNumbers)
  .chain(numbersToPairs)
  .chain(pairsToCantor);

const magical = transformText.encode('Runic magic');
// Each step reveals deeper meaning, much like the runes themselves
```

### Arithmetic Transformers
Coming soon - mathematical transformations:
- `runaAdd(value: number)` - Add/subtract with perfect reversibility
- `runaMultiply(factor: number)` - Scale numbers bidirectionally
- `runaPower(exponent: number)` - Mathematical power functions
- `runaModulo(modulus: number)` - Modular arithmetic

Each offers the `reversed()` method for inverse operations.

## License

MIT License - See [LICENSE](LICENSE) file for details.

---

ᚱᚢᚾᛅ - Built with 🔮 by [FimbulWorks](https://github.com/fimbul-works)
