import type { RunaAsync, RunaSync } from "./types.js";

export const createRuna = <TIn, TOut>(
  encode: (enc: TIn) => TOut,
  decode: (dec: TOut) => TIn,
): RunaSync<TIn, TOut> => {
  const runa = {
    encode,
    decode,
    reversed: () => reverseRuna(encode, decode),
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

export const reverseRuna = <TIn, TOut>(
  encode: (enc: TIn) => TOut,
  decode: (dec: TOut) => TIn,
): RunaSync<TOut, TIn> => {
  return createRuna(decode, encode);
};

export const createRunaAsync = <TIn, TOut>(
  encode: (enc: TIn) => Promise<TOut>,
  decode: (dec: TOut) => Promise<TIn>,
): RunaAsync<TIn, TOut> => {
  const runa = {
    encode,
    decode,
    reversed: () => reverseRunaAsync(encode, decode),
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

export const reverseRunaAsync = <TIn, TOut>(
  encode: (enc: TIn) => Promise<TOut>,
  decode: (dec: TOut) => Promise<TIn>,
) => {
  return createRunaAsync(decode, encode);
};
