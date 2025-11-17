import type { RunaAsync, RunaSync } from "./types.js";

/**
 * Creates a bidirectional synchronous transformation (RunaSync) between two types.
 *
 * This factory function creates a composable object that can transform data in both directions:
 * from TIn to TOut (encode) and from TOut back to TIn (decode). Each Runa transformation
 * knows how to reverse itself, ensuring perfect data integrity throughout transformation chains.
 *
 * The returned object provides methods for:
 * - `encode(data)` - Transform data from TIn to TOut
 * - `decode(data)` - Transform data from TOut back to TIn
 * - `reversed()` - Create a new Runa with encode/decode swapped
 * - `chain(next)` - Compose with another synchronous transformation
 * - `chainAsync(next)` - Compose with an asynchronous transformation
 *
 * @template TIn - The input type for encoding and output type for decoding
 * @template TOut - The output type for encoding and input type for decoding
 *
 * @param encode - Pure function that transforms data from TIn to TOut
 * @param decode - Pure function that transforms data from TOut back to TIn
 *
 * @returns A RunaSync instance that provides bidirectional transformation capabilities
 *
 * @example
 * // Create a simple string to number converter
 * const stringToNumber = createRuna(
 *   (str: string) => parseInt(str, 10),
 *   (num: number) => num.toString()
 * );
 *
 * // Use the transformation
 * const number = stringToNumber.encode("42"); // 42
 * const original = stringToNumber.decode(number); // "42"
 *
 * // Chain transformations together
 * const numberToBoolean = createRuna(
 *   (num: number) => num > 0,
 *   (bool: boolean) => bool ? 1 : 0
 * );
 *
 * const stringToBoolean = stringToNumber.chain(numberToBoolean);
 * const result = stringToBoolean.encode("99"); // true
 * const backToString = stringToBoolean.decode(false); // "0"
 */
export const createRuna = <TIn, TOut>(
  encode: (enc: TIn) => TOut,
  decode: (dec: TOut) => TIn,
): RunaSync<TIn, TOut> => {
  const runa = {
    encode,
    decode,
    reversed: () => createRuna(decode, encode),
    chain: <TNextOut>(next: RunaSync<TOut, TNextOut>) =>
      createRuna(
        (enc: TIn) => next.encode(runa.encode(enc)),
        (dec: TNextOut) => runa.decode(next.decode(dec)),
      ),
    chainAsync: <TNextOut>(next: RunaAsync<TOut, TNextOut>) =>
      createRunaAsync(
        async (enc: TIn) => await next.encode(runa.encode(enc)),
        async (dec: TNextOut) => runa.decode(await next.decode(dec)),
      ),
  };
  return runa;
};

/**
 * Creates a bidirectional asynchronous transformation (RunaAsync) between two types.
 *
 * This factory function creates a composable object that can asynchronously transform data
 * in both directions: from TIn to TOut (encode) and from TOut back to TIn (decode). Perfect for
 * operations that require async/await such as network requests, file I/O, database operations,
 * or cryptographic functions.
 *
 * The returned object provides methods for:
 * - `encode(data)` - Asynchronously transform data from TIn to TOut (returns Promise)
 * - `decode(data)` - Asynchronously transform data from TOut back to TIn (returns Promise)
 * - `reversed()` - Create a new RunaAsync with encode/decode swapped
 * - `chain(next)` - Compose with a synchronous transformation
 * - `chainAsync(next)` - Compose with another asynchronous transformation
 *
 * @template TIn - The input type for encoding and output type for decoding
 * @template TOut - The output type for encoding and input type for decoding
 *
 * @param encode - Async function that transforms data from TIn to TOut (must return Promise<TOut>)
 * @param decode - Async function that transforms data from TOut back to TIn (must return Promise<TIn>)
 *
 * @returns A RunaAsync instance that provides bidirectional asynchronous transformation capabilities
 *
 * @example
 * // Create an async transformation that fetches user data
 * const userToServer = createRunaAsync(
 *   async (user: UserData) => {
 *     const response = await fetch('/api/users', {
 *       method: 'POST',
 *       body: JSON.stringify(user)
 *     });
 *     return response.json();
 *   },
 *   async (serverUser: any) => {
 *     const response = await fetch(`/api/users/${serverUser.id}`);
 *     return response.json();
 *   }
 * );
 *
 * // Use the async transformation
 * const serverResponse = await userToServer.encode(userData);
 * const originalUser = await userToServer.decode(serverResponse);
 */
export const createRunaAsync = <TIn, TOut>(
  encode: (enc: TIn) => Promise<TOut>,
  decode: (dec: TOut) => Promise<TIn>,
): RunaAsync<TIn, TOut> => {
  const runa = {
    encode,
    decode,
    reversed: () => createRunaAsync(decode, encode),
    chain: <TNextOut>(next: RunaSync<TOut, TNextOut>) =>
      createRunaAsync(
        async (enc: TIn) => next.encode(await runa.encode(enc)),
        async (dec: TNextOut) => await runa.decode(next.decode(dec)),
      ),
    chainAsync: <TNextOut>(next: RunaAsync<TOut, TNextOut>) =>
      createRunaAsync(
        async (enc: TIn) => await next.encode(await runa.encode(enc)),
        async (dec: TNextOut) => await runa.decode(await next.decode(dec)),
      ),
  };
  return runa;
};
