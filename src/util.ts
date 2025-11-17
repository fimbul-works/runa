export const concatBuffers = (a: Uint8Array, b: Uint8Array) => {
  const c = a.slice(0);
  const result = new Uint8Array(c.length + b.length);
  result.set(c);
  result.set(b, c.length);
  return result;
};

export const serializeValue = (value: unknown): string => {
  if (typeof value === "number" || typeof value === "bigint") {
    return String(value);
  }
  if (value === null || value === undefined) {
    return String(value);
  }
  if (typeof value === "object" && (value as any).prototype?.name) {
    return String(value);
  }
  return JSON.stringify(value);
};
