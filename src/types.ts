export interface RunaSync<TIn, TOut> {
  encode(input: TIn): TOut;
  decode(output: TOut): TIn;
  reversed(): RunaSync<TOut, TIn>;
  chain<TNextOut>(next: RunaSync<TOut, TNextOut>): RunaSync<TIn, TNextOut>;
  chainAsync<TNextOut>(
    next: RunaAsync<TOut, TNextOut>,
  ): RunaAsync<TIn, TNextOut>;
}

// Async version for operations that need async encode/decode
export interface RunaAsync<TIn, TOut> {
  encode(input: TIn): Promise<TOut>;
  decode(output: TOut): Promise<TIn>;
  reversed(): RunaAsync<TOut, TIn>;
  chain<TNextOut>(next: RunaSync<TOut, TNextOut>): RunaAsync<TIn, TNextOut>;
  chainAsync<TNextOut>(
    next: RunaAsync<TOut, TNextOut>,
  ): RunaAsync<TIn, TNextOut>;
}

// Type alias for Uint8Array with proper typing
export type Uint8ArrayLike = Uint8Array<ArrayBufferLike>;
