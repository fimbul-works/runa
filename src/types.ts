export interface Runa<TIn, TOut> {
  encode(input: TIn): TOut;
  decode(output: TOut): TIn;
}

// Async version for operations that need async encode/decode
export interface AsyncRuna<TIn, TOut> {
  encode(input: TIn): Promise<TOut>;
  decode(output: TOut): Promise<TIn>;
}

// Type alias for Uint8Array with proper typing
export type Uint8ArrayLike = Uint8Array<ArrayBufferLike>;
