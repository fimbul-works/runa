import { createRuna } from "./runa.js";

/**
 * Creates a bidirectional JSON transformation for TypeScript objects.
 *
 * This utility provides type-safe serialization and deserialization between TypeScript objects
 * and their JSON string representations. Perfect for configuration management, API communication,
 * or any scenario where objects need to be converted to storable/transmittable strings and back.
 *
 * The generic type parameter T ensures complete type safety throughout the transformation,
 * maintaining the exact object structure when decoding JSON strings back to TypeScript objects.
 *
 * @template T - The TypeScript type to serialize/deserialize
 * @returns A RunaSync<T, string> instance that provides bidirectional JSON serialization/deserialization
 *
 * @example
 * interface User {
 *   id: number;
 *   name: string;
 *   email: string;
 *   active: boolean;
 * }
 *
 * const userJson = runaJSON<User>();
 *
 * // Serialize object to JSON string
 * const user: User = {
 *   id: 12345,
 *   name: "John Doe",
 *   email: "john@example.com",
 *   active: true
 * };
 * const jsonString = userJson.encode(user);
 * // '{"id":12345,"name":"John Doe","email":"john@example.com","active":true}'
 *
 * // Deserialize JSON string back to object
 * const restoredUser = userJson.decode(jsonString);
 * // { id: 12345, name: "John Doe", email: "john@example.com", active: true }
 *
 * @example
 * // Complex nested object with arrays
 * interface Config {
 *   database: {
 *     host: string;
 *     port: number;
 *   };
 *   features: string[];
 *   version: string;
 * }
 *
 * const configJson = runaJSON<Config>();
 * const config: Config = {
 *   database: { host: "localhost", port: 5432 },
 *   features: ["auth", "logging", "cache"],
 *   version: "1.0.0"
 * };
 *
 * const stored = configJson.encode(config);
 * const loaded = configJson.decode(stored);
 * console.log(loaded.database.host); // "localhost"
 */
export const runaJSON = <T>() =>
  createRuna(
    (str: T) => JSON.stringify(str),
    (json: string) => JSON.parse(json) as T,
  );
