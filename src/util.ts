export const concatBuffers = (a: Uint8Array, b: Uint8Array) => {
  const c = a.slice(0);
  const result = new Uint8Array(c.length + b.length);
  result.set(c);
  result.set(b, c.length);
  return result;
};
