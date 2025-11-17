/**
 * Represents a bidirectional transformation between two types (TIn and TOut) that operates synchronously.
 *
 * A RunaSync instance provides methods to transform data in both directions:
 * - encode: Transforms from TIn to TOut
 * - decode: Transforms from TOut to TIn
 *
 * It also supports chaining transformations and creating a reversed version.
 *
 * @template TIn - The input type for encoding and output type for decoding
 * @template TOut - The output type for encoding and input type for decoding
 */
export interface RunaSync<TIn, TOut> {
  /**
   * Transforms input data of type TIn to output data of type TOut
   * @param input - The input data to transform
   * @returns The transformed data of type TOut
   */
  encode(input: TIn): TOut;

  /**
   * Transforms output data of type TOut back to input data of type TIn
   * @param output - The output data to transform back
   * @returns The transformed data of type TIn
   */
  decode(output: TOut): TIn;

  /**
   * Creates a new RunaSync instance with the encode and decode functions swapped
   * @returns A new RunaSync instance with TOut as input and TIn as output
   */
  reversed(): RunaSync<TOut, TIn>;

  /**
   * Chains this transformation with another synchronous transformation
   * The result is a new transformation that first applies this transformation,
   * then applies the next transformation to the result.
   *
   * @template TNextOut - The output type of the next transformation
   * @param next - The next transformation to chain with this one
   * @returns A new RunaSync instance that combines both transformations
   */
  chain<TNextOut>(next: RunaSync<TOut, TNextOut>): RunaSync<TIn, TNextOut>;

  /**
   * Chains this transformation with an asynchronous transformation
   * The result is a new asynchronous transformation that first applies this transformation,
   * then applies the next transformation to the result.
   *
   * @template TNextOut - The output type of the next transformation
   * @param next - The next asynchronous transformation to chain with this one
   * @returns A new RunaAsync instance that combines both transformations
   */
  chainAsync<TNextOut>(
    next: RunaAsync<TOut, TNextOut>,
  ): RunaAsync<TIn, TNextOut>;
}

/**
 * Represents a bidirectional transformation between two types (TIn and TOut) that operates asynchronously.
 *
 * A RunaAsync instance provides methods to transform data in both directions:
 * - encode: Transforms from TIn to TOut asynchronously
 * - decode: Transforms from TOut to TIn asynchronously
 *
 * It also supports chaining transformations and creating a reversed version.
 *
 * @template TIn - The input type for encoding and output type for decoding
 * @template TOut - The output type for encoding and input type for decoding
 */
export interface RunaAsync<TIn, TOut> {
  /**
   * Asynchronously transforms input data of type TIn to output data of type TOut
   * @param input - The input data to transform
   * @returns A Promise that resolves to the transformed data of type TOut
   */
  encode(input: TIn): Promise<TOut>;

  /**
   * Asynchronously transforms output data of type TOut back to input data of type TIn
   * @param output - The output data to transform back
   * @returns A Promise that resolves to the transformed data of type TIn
   */
  decode(output: TOut): Promise<TIn>;

  /**
   * Creates a new RunaAsync instance with the encode and decode functions swapped
   * @returns A new RunaAsync instance with TOut as input and TIn as output
   */
  reversed(): RunaAsync<TOut, TIn>;

  /**
   * Chains this asynchronous transformation with a synchronous transformation
   * The result is a new asynchronous transformation that first applies this transformation,
   * then applies the next transformation to the result.
   *
   * @template TNextOut - The output type of the next transformation
   * @param next - The next synchronous transformation to chain with this one
   * @returns A new RunaAsync instance that combines both transformations
   */
  chain<TNextOut>(next: RunaSync<TOut, TNextOut>): RunaAsync<TIn, TNextOut>;

  /**
   * Chains this asynchronous transformation with another asynchronous transformation
   * The result is a new asynchronous transformation that first applies this transformation,
   * then applies the next transformation to the result.
   *
   * @template TNextOut - The output type of the next transformation
   * @param next - The next asynchronous transformation to chain with this one
   * @returns A new RunaAsync instance that combines both transformations
   */
  chainAsync<TNextOut>(
    next: RunaAsync<TOut, TNextOut>,
  ): RunaAsync<TIn, TNextOut>;
}

/**
 * Type alias for Uint8Array with proper typing
 * Represents a typed array of 8-bit unsigned integers with ArrayBufferLike backing
 */
export type Uint8ArrayLike = Uint8Array<ArrayBufferLike>;
