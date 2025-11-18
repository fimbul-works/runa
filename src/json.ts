import { SuperJSON } from "superjson";
import { createRuna } from "./runa.js";

/**
 * Creates a bidirectional JSON transformation for TypeScript objects with enhanced capabilities.
 *
 * This utility provides type-safe serialization and deserialization between TypeScript objects
 * and their JSON string representations. By default, it uses SuperJSON to handle complex
 * data types like Dates, Maps, Sets, Regular Expressions, and more, ensuring perfect
 * bidirectional conversion even with rich JavaScript objects.
 *
 * The generic type parameter T ensures complete type safety throughout the transformation,
 * maintaining the exact object structure when decoding JSON strings back to TypeScript objects.
 *
 * When `useSuperJSON` is true (default), complex types are preserved:
 * - Date objects remain Date instances (not strings)
 * - Map objects remain Map instances (not plain objects)
 * - Set objects remain Set instances (not plain objects)
 * - RegExp objects remain RegExp instances
 * - Error objects remain Error instances
 * - BigInt values are properly handled
 * - And many more complex JavaScript types
 *
 * When `useSuperJSON` is false, standard JSON.stringify/parse behavior is used:
 * - Dates become ISO strings
 * - Maps/Sets become empty objects
 * - RegExp becomes empty objects
 * - Non-serializable types are lost or converted
 *
 * @template T - The TypeScript type to serialize/deserialize
 * @param useSuperJSON - Whether to use SuperJSON (default: true). Set to false for standard JSON.stringify/parse behavior.
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
 * // Serialize object to JSON string (using SuperJSON)
 * const user: User = {
 *   id: 12345,
 *   name: "John Doe",
 *   email: "john@example.com",
 *   active: true
 * };
 * const jsonString = userJson.encode(user);
 * // '{"json":{"id":12345,"name":"John Doe","email":"john@example.com","active":true}}'
 *
 * // Deserialize JSON string back to object
 * const restoredUser = userJson.decode(jsonString);
 * // { id: 12345, name: "John Doe", email: "john@example.com", active: true }
 *
 * @example
 * // SuperJSON preserves complex types (default behavior)
 * interface ComplexData {
 *   created: Date;
 *   settings: Map<string, boolean>;
 *   tags: Set<string>;
 *   pattern: RegExp;
 * }
 *
 * const complexJson = runaJSON<ComplexData>(); // Uses SuperJSON by default
 *
 * const data: ComplexData = {
 *   created: new Date('2023-01-01'),
 *   settings: new Map([['darkMode', true], ['notifications', false]]),
 *   tags: new Set(['important', 'archived']),
 *   pattern: /test/gi
 * };
 *
 * const serialized = complexJson.encode(data);
 * const restored = complexJson.decode(serialized);
 *
 * // All complex types are perfectly preserved
 * console.log(restored.created instanceof Date); // true
 * console.log(restored.created.getTime()); // 1672531200000
 * console.log(restored.settings instanceof Map); // true
 * console.log(restored.settings.get('darkMode')); // true
 * console.log(restored.tags instanceof Set); // true
 * console.log(restored.tags.has('important')); // true
 * console.log(restored.pattern instanceof RegExp); // true
 * console.log(restored.pattern.flags); // 'gi'
 *
 * @example
 * // Standard JSON compatibility
 * const standardJson = runaJSON<ComplexData>(false); // Uses standard JSON.stringify/parse
 *
 * const standardSerialized = standardJson.encode(data);
 * const standardRestored = standardJson.decode(standardSerialized);
 *
 * // With standard JSON, complex types are converted to plain objects/strings
 * console.log(typeof standardRestored.created); // 'string'
 * console.log(standardRestored.settings instanceof Map); // false
 * console.log(standardRestored.tags instanceof Set); // false
 *
 * @example
 * // Perfect bidirectional transformation
 * const configJson = runaJSON<AppConfig>();
 *
 * const config: AppConfig = {
 *   version: 2,
 *   lastModified: new Date(),
 *   features: new Set(['auth', 'logging']),
 *   cache: new Map([['users', 1000], ['posts', 5000]])
 * };
 *
 * // Encode to string
 * const stored = configJson.encode(config);
 *
 * // Decode back to original object with all complex types intact
 * const loaded = configJson.decode(stored);
 *
 * // Verify perfect restoration
 * expect(loaded).toEqual(config);
 * expect(loaded.lastModified).toBeInstanceOf(Date);
 * expect(loaded.features).toBeInstanceOf(Set);
 * expect(loaded.cache).toBeInstanceOf(Map);
 */
export const runaJSON = <T>(useSuperJSON = true) =>
  createRuna(
    useSuperJSON
      ? (obj: T) => SuperJSON.stringify(obj)
      : (obj: T) => JSON.stringify(obj),
    useSuperJSON
      ? (json: string) => SuperJSON.parse(json) as T
      : (json: string) => JSON.parse(json) as T,
  );
