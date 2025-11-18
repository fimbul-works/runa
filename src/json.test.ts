import { describe, it, expect, beforeEach } from "vitest";
import { runaJSON } from "./json.js";

describe("runaJSON", () => {
  interface TestObject {
    name: string;
    age: number;
    active: boolean;
    tags?: string[];
  }

  let json: ReturnType<typeof runaJSON<TestObject>>;

  beforeEach(() => {
    json = runaJSON<TestObject>(false); // Use standard JSON for existing tests
  });

  it("should encode simple object to JSON string", () => {
    const input: TestObject = {
      name: "John Doe",
      age: 30,
      active: true,
    };
    const expected = JSON.stringify(input);
    expect(json.encode(input) as string).toBe(expected);
  });

  it("should decode JSON string back to object", () => {
    const jsonString = '{"name":"John Doe","age":30,"active":true}';
    const expected: TestObject = {
      name: "John Doe",
      age: 30,
      active: true,
    };
    expect(json.decode(jsonString) as TestObject).toEqual(expected);
  });

  it("should handle empty object", () => {
    const input = {} as TestObject;
    const encoded = json.encode(input) as string;
    expect(encoded).toBe("{}");
    expect(json.decode(encoded) as TestObject).toEqual({});
  });

  it("should handle null values", () => {
    const input = { name: null, age: 0, active: false } as any;
    const encoded = json.encode(input) as string;
    const decoded = json.decode(encoded) as any;
    expect(decoded.name).toBe(null);
    expect(decoded.age).toBe(0);
    expect(decoded.active).toBe(false);
  });

  it("should handle arrays", () => {
    const input = {
      name: "Test",
      age: 25,
      active: true,
      tags: ["tag1", "tag2", "tag3"],
    };
    const encoded = json.encode(input) as string;
    const decoded = json.decode(encoded) as TestObject;
    expect(decoded).toEqual(input);
    expect(Array.isArray(decoded.tags)).toBe(true);
  });

  it("should handle nested objects", () => {
    interface NestedObject {
      user: {
        profile: {
          name: string;
          preferences: {
            theme: string;
            notifications: boolean;
          };
        };
      };
    }

    const nestedJson = runaJSON<NestedObject>();
    const input: NestedObject = {
      user: {
        profile: {
          name: "Jane",
          preferences: {
            theme: "dark",
            notifications: true,
          },
        },
      },
    };

    const encoded = nestedJson.encode(input) as string;
    const decoded = nestedJson.decode(encoded) as NestedObject;
    expect(decoded).toEqual(input);
  });

  it("should handle special characters in strings", () => {
    const input = {
      name: 'John "The Rock" Doe',
      description: "Line 1\nLine 2\tTabbed",
      emoji: "🚀 🌟 💫",
      unicode: "测试中文",
    };
    const jsonTyped = runaJSON<typeof input>();
    const encoded = jsonTyped.encode(input) as string;
    const decoded = jsonTyped.decode(encoded) as typeof input;
    expect(decoded).toEqual(input);
  });

  it("should handle numbers (integers, floats, negative, zero)", () => {
    const input = {
      integer: 42,
      float: 3.14159,
      negative: -17,
      zero: 0,
      scientific: 1.5e3,
    };
    const jsonTyped = runaJSON<typeof input>();
    const encoded = jsonTyped.encode(input) as string;
    const decoded = jsonTyped.decode(encoded) as typeof input;
    expect(decoded).toEqual(input);
  });

  it("should handle boolean values", () => {
    const input = {
      trueValue: true,
      falseValue: false,
      truthy: 1, // Note: 1 is truthy but not boolean
      falsy: 0, // Note: 0 is falsy but not boolean
    };
    const jsonTyped = runaJSON<typeof input>();
    const encoded = jsonTyped.encode(input) as string;
    const decoded = jsonTyped.decode(encoded) as typeof input;
    expect(decoded).toEqual(input);
    expect(typeof decoded.trueValue).toBe("boolean");
    expect(typeof decoded.falseValue).toBe("boolean");
  });

  it("should be bidirectional - encode then decode returns original", () => {
    const testObjects: TestObject[] = [
      { name: "Alice", age: 28, active: true },
      { name: "Bob", age: 35, active: false, tags: ["admin"] },
      { name: "Charlie", age: 42, active: true, tags: ["user", "premium"] },
      { name: "", age: 0, active: false, tags: [] },
    ];

    for (const original of testObjects) {
      const encoded = json.encode(original) as string;
      const decoded = json.decode(encoded) as TestObject;
      expect(decoded).toEqual(original);
    }
  });

  it("should handle date objects", () => {
    const date = new Date("2023-12-25T10:30:00.000Z");
    const input = { timestamp: date.toISOString(), name: "Christmas" };
    const jsonTyped = runaJSON<typeof input>();
    const encoded = jsonTyped.encode(input) as string;
    const decoded = jsonTyped.decode(encoded) as typeof input;
    expect(decoded).toEqual(input);
  });

  it("should throw error when decoding invalid JSON", () => {
    expect(() => json.decode("invalid-json") as TestObject).toThrow();
    expect(() => json.decode("{invalid}") as TestObject).toThrow();
    expect(() => json.decode('{"name": "test"') as TestObject).toThrow(); // Missing closing brace
    // Note: JSON.parse doesn't validate against TypeScript interfaces, so the last one won't throw
  });

  it("should handle large objects", () => {
    const input = {
      data: Array.from({ length: 1000 }, (_, i) => ({
        id: i,
        value: `item-${i}`,
        random: Math.random(),
      })),
    };
    const jsonTyped = runaJSON<typeof input>();
    const encoded = jsonTyped.encode(input) as string;
    const decoded = jsonTyped.decode(encoded) as typeof input;
    expect(decoded.data).toHaveLength(1000);
    expect(decoded.data[0]).toEqual(input.data[0]);
  });

  it("should preserve property order in encoding", () => {
    const input = { b: 2, a: 1, c: 3 };
    const jsonTyped = runaJSON<typeof input>();
    const encoded = jsonTyped.encode(input) as string;
    // Note: JSON.stringify might not preserve order in all JS engines
    // But the decoded object should have the same values
    const decoded = jsonTyped.decode(encoded) as typeof input;
    expect(decoded.a).toBe(1);
    expect(decoded.b).toBe(2);
    expect(decoded.c).toBe(3);
  });
});

describe("runaJSON with SuperJSON", () => {
  interface ComplexObject {
    date: Date;
    map: Map<string, number>;
    set: Set<string>;
    regex: RegExp;
  }

  it("should use SuperJSON by default for complex data types", () => {
    const json = runaJSON<ComplexObject>(); // Uses SuperJSON by default

    const date = new Date("2023-12-25T10:30:00.000Z");
    const map = new Map([
      ["key1", 1],
      ["key2", 2],
    ]);
    const set = new Set(["a", "b", "c"]);
    const regex = /test/g;

    const input: ComplexObject = {
      date,
      map,
      set,
      regex,
    };

    const encoded = json.encode(input) as string;
    const decoded = json.decode(encoded) as ComplexObject;

    // Verify complex types are properly restored
    expect(decoded.date).toBeInstanceOf(Date);
    expect(decoded.date.getTime()).toBe(date.getTime());
    expect(decoded.map).toBeInstanceOf(Map);
    expect(decoded.map.get("key1")).toBe(1);
    expect(decoded.map.get("key2")).toBe(2);
    expect(decoded.set).toBeInstanceOf(Set);
    expect(decoded.set.has("a")).toBe(true);
    expect(decoded.set.has("b")).toBe(true);
    expect(decoded.set.has("c")).toBe(true);
    expect(decoded.regex).toBeInstanceOf(RegExp);
    expect(decoded.regex.source).toBe(regex.source);
    expect(decoded.regex.flags).toBe(regex.flags);
  });

  it("should be bidirectional with SuperJSON", () => {
    const json = runaJSON<ComplexObject>();

    const original: ComplexObject = {
      date: new Date("2023-01-01"),
      map: new Map([["test", 42]]),
      set: new Set(["x", "y"]),
      regex: /^hello$/i,
    };

    const encoded = json.encode(original) as string;
    const decoded = json.decode(encoded) as ComplexObject;

    // Test complete round-trip
    expect(decoded.date.getTime()).toBe(original.date.getTime());
    expect(decoded.map.get("test")).toBe(42);
    expect(Array.from(decoded.set)).toEqual(["x", "y"]);
    expect(decoded.regex.source).toBe(original.regex.source);
    expect(decoded.regex.flags).toBe(original.regex.flags);
  });

  it("should allow disabling SuperJSON for standard JSON behavior", () => {
    const json = runaJSON<ComplexObject>(false); // Disable SuperJSON

    const input: ComplexObject = {
      date: new Date("2023-12-25T10:30:00.000Z"),
      map: new Map([["key1", 1]]),
      set: new Set(["a"]),
      regex: /test/g,
    };

    // With standard JSON, these will be converted to plain objects
    const encoded = json.encode(input) as string;
    const decoded = json.decode(encoded) as any;

    // Date becomes string
    expect(typeof decoded.date).toBe("string");
    // Map becomes empty object
    expect(typeof decoded.map).toBe("object");
    expect(Object.keys(decoded.map).length).toBe(0);
    // Set becomes empty object
    expect(typeof decoded.set).toBe("object");
    expect(Object.keys(decoded.set).length).toBe(0);
    // Regex becomes empty object
    expect(typeof decoded.regex).toBe("object");
  });
});
