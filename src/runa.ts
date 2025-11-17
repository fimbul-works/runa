import type { RunaAsync, RunaSync } from "./types.js";

/**
 * Creates a bidirectional synchronous transformation (RunaSync) between two types.
 *
 * This factory function creates an object that can transform data in both directions:
 * from TIn to TOut (encode) and from TOut back to TIn (decode). The returned object
 * also provides methods to chain transformations and create a reversed version.
 *
 * @template TIn - The input type for encoding and output type for decoding
 * @template TOut - The output type for encoding and input type for decoding
 *
 * @param encode - Function that transforms data from TIn to TOut
 * @param decode - Function that transforms data from TOut to TIn
 *
 * @returns A RunaSync instance that provides bidirectional transformation capabilities
 *
 * @example
 * // Create a transformation between strings and numbers
 * const stringToNumber = createRuna(
 *   (str: string) => parseInt(str, 10),
 *   (num: number) => num.toString()
 * );
 *
 * // Use the transformation
 * const number = stringToNumber.encode("42"); // 42
 * const string = stringToNumber.decode(42); // "42"
 *
 * // Chain with another transformation
 * const numberToBoolean = createRuna(
 *   (num: number) => num > 0,
 *   (bool: boolean) => bool ? 1 : 0
 * );
 *
 * const stringToBoolean = stringToNumber.chain(numberToBoolean);
 * const bool = stringToBoolean.encode("42"); // true
 * const str = stringToBoolean.decode(true); // "1"
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
 * This factory function creates an object that can asynchronously transform data in both directions:
 * from TIn to TOut (encode) and from TOut back to TIn (decode). The returned object
 * also provides methods to chain transformations and create a reversed version.
 *
 * @template TIn - The input type for encoding and output type for decoding
 * @template TOut - The output type for encoding and input type for decoding
 *
 * @param encode - Async function that transforms data from TIn to TOut
 * @param decode - Async function that transforms data from TOut to TIn
 *
 * @returns A RunaAsync instance that provides bidirectional asynchronous transformation capabilities
 *
 * @example
 * // Create an async transformation between strings and numbers
 * const stringToNumberAsync = createRunaAsync(
 *   async (str: string) => {
 *     await someAsyncOperation();
 *     return parseInt(str, 10);
 *   },
 *   async (num: number) => {
 *     await someAsyncOperation();
 *     return num.toString();
 *   }
 * );
 *
 * // Use the async transformation
 * const number = await stringToNumberAsync.encode("42"); // 42
 * const string = await stringToNumberAsync.decode(42); // "42"
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
