export interface CryptoAdapter {
  subtle: SubtleCrypto;
  randomBytes: (size: number) => Uint8Array<ArrayBuffer>;
  deriveKey: (
    keyMaterial: string | BufferSource,
    salt?: BufferSource,
  ) => Promise<CryptoKey>;
}

// Internal lazy singleton
let cryptoAdapter: CryptoAdapter | null = null;

export async function getCrypto(): Promise<CryptoAdapter> {
  if (cryptoAdapter) return cryptoAdapter;

  if (typeof window !== "undefined" && window.crypto) {
    // Browser: use Web Crypto API directly
    const subtle = window.crypto.subtle;
    cryptoAdapter = {
      subtle,
      randomBytes: (size: number) =>
        window.crypto.getRandomValues(new Uint8Array(size)),
      deriveKey: async (
        baseKey: string | BufferSource,
        salt?: BufferSource,
      ) => {
        const encoder = new TextEncoder();
        // Default salt if not provided
        const keySalt = salt
          ? new Uint8Array(salt as ArrayBuffer)
          : new Uint8Array([0, 0, 0, 0, 0, 0, 0, 0]);

        // Convert keyMaterial to Uint8Array
        const keyBytes =
          typeof baseKey === "string"
            ? encoder.encode(baseKey)
            : new Uint8Array(baseKey as ArrayBuffer);

        // Import key material
        const importedKey = await subtle.importKey(
          "raw",
          keyBytes,
          { name: "PBKDF2" },
          false,
          ["deriveKey"],
        );

        // Derive key using PBKDF2
        return await subtle.deriveKey(
          {
            name: "PBKDF2",
            salt: keySalt,
            iterations: 100000,
            hash: "SHA-256",
          },
          importedKey,
          { name: "AES-GCM", length: 256 },
          false,
          ["encrypt", "decrypt"],
        );
      },
    };
  } else {
    // Node: dynamic import to avoid bundling
    const { webcrypto } = await import("node:crypto");
    const subtle = webcrypto.subtle as SubtleCrypto;
    cryptoAdapter = {
      subtle,
      randomBytes: (size: number) =>
        webcrypto.getRandomValues(new Uint8Array(size)),
      deriveKey: async (
        baseKey: string | BufferSource,
        salt?: BufferSource,
      ) => {
        const encoder = new TextEncoder();
        // Default salt if not provided
        const keySalt = salt
          ? new Uint8Array(salt as ArrayBuffer)
          : new Uint8Array([0, 0, 0, 0, 0, 0, 0, 0]);

        // Convert keyMaterial to Uint8Array
        const keyBytes =
          typeof baseKey === "string"
            ? encoder.encode(baseKey)
            : new Uint8Array(baseKey as ArrayBuffer);

        // Import key material
        const importedKey = await subtle.importKey(
          "raw",
          keyBytes,
          { name: "PBKDF2" },
          false,
          ["deriveKey"],
        );

        // Derive key using PBKDF2
        return await subtle.deriveKey(
          {
            name: "PBKDF2",
            salt: keySalt,
            iterations: 100000,
            hash: "SHA-256",
          },
          importedKey,
          { name: "AES-GCM", length: 256 },
          false,
          ["encrypt", "decrypt"],
        );
      },
    };
  }

  return cryptoAdapter;
}
