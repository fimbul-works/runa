import { createRuna } from "./runa.js";

/**
 * Creates a bidirectional URI component encoding transformation.
 *
 * This utility converts between plain strings and URI-encoded strings using the
 * standard encodeURIComponent/decodeURIComponent functions. Perfect for handling
 * URL parameters, query strings, form data, or any text that needs to be safely
 * transmitted in URLs without breaking encoding standards.
 *
 * The transformation ensures special characters, spaces, and non-ASCII characters
 * are properly encoded for URL transmission and can be perfectly decoded back
 * to their original form.
 *
 * @returns A RunaSync<string, string> instance that provides bidirectional URI encoding/decoding
 *
 * @example
 * const uriEncoder = runaURI();
 *
 * // Encode text for URL transmission
 * const queryParam = "Hello world! & special chars: æøå";
 * const encoded = uriEncoder.encode(queryParam);
 * // "Hello%20world!%20%26%20special%20chars%3A%20%C3%A6%C3%B8%C3%A5"
 *
 * // Decode back to original text
 * const decoded = uriEncoder.decode(encoded);
 * // "Hello world! & special chars: æøå"
 *
 * @example
 * // Handle URL parameters safely
 * const searchTerm = "Café & Restaurant";
 * const urlEncoded = uriEncoder.encode(searchTerm);
 * const searchUrl = `https://example.com/search?q=${urlEncoded}`;
 * // "https://example.com/search?q=Caf%C3%A9%20%26%20Restaurant"
 *
 * const decodedTerm = uriEncoder.decode(urlEncoded);
 * // "Café & Restaurant"
 *
 * @example
 * // Process form data
 * const formData = "name=John Doe&email=john@example.com&message=Hello!";
 * const encodedData = uriEncoder.encode(formData);
 * // "name%3DJohn%20Doe%26email%3Djohn%40example.com%26message%3DHello%21"
 *
 * const restoredData = uriEncoder.decode(encodedData);
 * // "name=John Doe&email=john@example.com&message=Hello!"
 */
export const runaURI = () =>
  createRuna(
    (str: string) => encodeURIComponent(str),
    (str: string) => decodeURIComponent(str),
  );

export default runaURI;
