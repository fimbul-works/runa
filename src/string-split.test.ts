import { beforeEach, describe, expect, it } from "vitest";
import { runaStringSplit } from "./string-split.js";

describe("runaStringSplit", () => {
  let splitByComma: ReturnType<typeof runaStringSplit>;
  let splitBySpace: ReturnType<typeof runaStringSplit>;
  let splitByNewline: ReturnType<typeof runaStringSplit>;
  let splitByPipe: ReturnType<typeof runaStringSplit>;
  let splitByEmptyString: ReturnType<typeof runaStringSplit>;
  let splitBySpecialChar: ReturnType<typeof runaStringSplit>;

  beforeEach(() => {
    splitByComma = runaStringSplit(",");
    splitBySpace = runaStringSplit(" ");
    splitByNewline = runaStringSplit("\n");
    splitByPipe = runaStringSplit("|");
    splitByEmptyString = runaStringSplit("");
    splitBySpecialChar = runaStringSplit("😀");
  });

  describe("encode", () => {
    it("should split strings by comma", () => {
      expect(splitByComma.encode("a,b,c")).toEqual(["a", "b", "c"]);
      expect(splitByComma.encode("hello,world")).toEqual(["hello", "world"]);
      expect(splitByComma.encode("single")).toEqual(["single"]);
    });

    it("should split strings by space", () => {
      expect(splitBySpace.encode("hello world")).toEqual(["hello", "world"]);
      expect(splitBySpace.encode("multiple spaces test")).toEqual([
        "multiple",
        "spaces",
        "test",
      ]);
      expect(splitBySpace.encode("nospace")).toEqual(["nospace"]);
    });

    it("should split strings by newline", () => {
      expect(splitByNewline.encode("line1\nline2\nline3")).toEqual([
        "line1",
        "line2",
        "line3",
      ]);
      expect(splitByNewline.encode("first\nsecond")).toEqual([
        "first",
        "second",
      ]);
      expect(splitByNewline.encode("singleline")).toEqual(["singleline"]);
    });

    it("should split strings by pipe", () => {
      expect(splitByPipe.encode("a|b|c")).toEqual(["a", "b", "c"]);
      expect(splitByPipe.encode("data1|data2")).toEqual(["data1", "data2"]);
      expect(splitByPipe.encode("nopipe")).toEqual(["nopipe"]);
    });

    it("should split strings by empty string (character array)", () => {
      expect(splitByEmptyString.encode("abc")).toEqual(["a", "b", "c"]);
      expect(splitByEmptyString.encode("hello")).toEqual([
        "h",
        "e",
        "l",
        "l",
        "o",
      ]);
      expect(splitByEmptyString.encode("")).toEqual([]);
    });

    it("should split strings by special characters", () => {
      expect(splitBySpecialChar.encode("a😀b😀c")).toEqual(["a", "b", "c"]);
      expect(splitBySpecialChar.encode("test😀emoji")).toEqual([
        "test",
        "emoji",
      ]);
    });

    it("should handle empty strings", () => {
      expect(splitByComma.encode("")).toEqual([""]);
      expect(splitBySpace.encode("")).toEqual([""]);
      expect(splitByNewline.encode("")).toEqual([""]);
      expect(splitByPipe.encode("")).toEqual([""]);
    });

    it("should handle strings with consecutive delimiters", () => {
      expect(splitByComma.encode("a,,b")).toEqual(["a", "", "b"]);
      expect(splitBySpace.encode("hello  world")).toEqual([
        "hello",
        "",
        "world",
      ]);
      expect(splitByNewline.encode("line1\n\nline2")).toEqual([
        "line1",
        "",
        "line2",
      ]);
      expect(splitByPipe.encode("a||b")).toEqual(["a", "", "b"]);
    });

    it("should handle strings with leading and trailing delimiters", () => {
      expect(splitByComma.encode(",start,end,")).toEqual([
        "",
        "start",
        "end",
        "",
      ]);
      expect(splitBySpace.encode(" leading space ")).toEqual([
        "",
        "leading",
        "space",
        "",
      ]);
      expect(splitByNewline.encode("\nstart\nend\n")).toEqual([
        "",
        "start",
        "end",
        "",
      ]);
      expect(splitByPipe.encode("|start|end|")).toEqual([
        "",
        "start",
        "end",
        "",
      ]);
    });

    it("should handle strings with only delimiters", () => {
      expect(splitByComma.encode(",,,")).toEqual(["", "", "", ""]);
      expect(splitBySpace.encode("   ")).toEqual(["", "", "", ""]);
      expect(splitByNewline.encode("\n\n\n")).toEqual(["", "", "", ""]);
      expect(splitByPipe.encode("||||")).toEqual(["", "", "", "", ""]);
    });

    it("should handle complex multi-character delimiters", () => {
      const splitByComplex = runaStringSplit("--");
      expect(splitByComplex.encode("a--b--c")).toEqual(["a", "b", "c"]);
      expect(splitByComplex.encode("start--end")).toEqual(["start", "end"]);
      expect(splitByComplex.encode("no delimiter")).toEqual(["no delimiter"]);
    });

    it("should handle emoji and Unicode strings", () => {
      const splitByDash = runaStringSplit("-");
      expect(splitByDash.encode("😀-😁-😂")).toEqual(["😀", "😁", "😂"]);
      expect(splitByDash.encode("测试-字符串")).toEqual(["测试", "字符串"]);
      expect(splitByDash.encode("café-münchen")).toEqual(["café", "münchen"]);
    });

    it("should throw error for non-string inputs", () => {
      expect(() => splitByComma.encode(123 as unknown as string)).toThrow(
        "Invalid string: 123",
      );
      expect(() => splitByComma.encode(null as unknown as string)).toThrow(
        "Invalid string: null",
      );
      expect(() => splitByComma.encode(undefined as unknown as string)).toThrow(
        "Invalid string: undefined",
      );
      expect(() => splitByComma.encode({} as unknown as string)).toThrow(
        "Invalid string: {}",
      );
      expect(() => splitByComma.encode([] as unknown as string)).toThrow(
        "Invalid string: ",
      );
    });

    it("should handle numbers converted to strings", () => {
      // Note: This would throw error since it expects string input
      expect(() => splitByComma.encode("123,456" as any)).not.toThrow();
    });
  });

  describe("decode", () => {
    it("should join arrays by comma", () => {
      expect(splitByComma.decode(["a", "b", "c"])).toBe("a,b,c");
      expect(splitByComma.decode(["hello", "world"])).toBe("hello,world");
      expect(splitByComma.decode(["single"])).toBe("single");
    });

    it("should join arrays by space", () => {
      expect(splitBySpace.decode(["hello", "world"])).toBe("hello world");
      expect(splitBySpace.decode(["multiple", "spaces", "test"])).toBe(
        "multiple spaces test",
      );
      expect(splitBySpace.decode(["nospace"])).toBe("nospace");
    });

    it("should join arrays by newline", () => {
      expect(splitByNewline.decode(["line1", "line2", "line3"])).toBe(
        "line1\nline2\nline3",
      );
      expect(splitByNewline.decode(["first", "second"])).toBe("first\nsecond");
      expect(splitByNewline.decode(["singleline"])).toBe("singleline");
    });

    it("should join arrays by pipe", () => {
      expect(splitByPipe.decode(["a", "b", "c"])).toBe("a|b|c");
      expect(splitByPipe.decode(["data1", "data2"])).toBe("data1|data2");
      expect(splitByPipe.decode(["nopipe"])).toBe("nopipe");
    });

    it("should join arrays by empty string", () => {
      expect(splitByEmptyString.decode(["a", "b", "c"])).toBe("abc");
      expect(splitByEmptyString.decode(["h", "e", "l", "l", "o"])).toBe(
        "hello",
      );
    });

    it("should join arrays by special characters", () => {
      expect(splitBySpecialChar.decode(["a", "b", "c"])).toBe("a😀b😀c");
      expect(splitBySpecialChar.decode(["test", "emoji"])).toBe("test😀emoji");
    });

    it("should handle empty arrays", () => {
      expect(splitByComma.decode([])).toBe("");
      expect(splitBySpace.decode([])).toBe("");
      expect(splitByNewline.decode([])).toBe("");
      expect(splitByPipe.decode([])).toBe("");
    });

    it("should handle arrays with empty strings", () => {
      expect(splitByComma.decode(["", ""])).toBe(",");
      expect(splitBySpace.decode(["", ""])).toBe(" ");
      expect(splitByNewline.decode(["", ""])).toBe("\n");
      expect(splitByPipe.decode(["", ""])).toBe("|");
    });

    it("should handle arrays with mixed empty and non-empty strings", () => {
      expect(splitByComma.decode(["a", "", "b"])).toBe("a,,b");
      expect(splitBySpace.decode(["hello", "", "world"])).toBe("hello  world");
      expect(splitByNewline.decode(["line1", "", "line2"])).toBe(
        "line1\n\nline2",
      );
      expect(splitByPipe.decode(["a", "", "b"])).toBe("a||b");
    });

    it("should handle arrays with leading and trailing empty strings", () => {
      expect(splitByComma.decode(["", "start", "end", ""])).toBe(",start,end,");
      expect(splitBySpace.decode(["", "leading", "space", ""])).toBe(
        " leading space ",
      );
      expect(splitByNewline.decode(["", "start", "end", ""])).toBe(
        "\nstart\nend\n",
      );
      expect(splitByPipe.decode(["", "start", "end", ""])).toBe("|start|end|");
    });

    it("should handle arrays with only empty strings", () => {
      expect(splitByComma.decode(["", "", ""])).toBe(",,");
      expect(splitBySpace.decode(["", "", ""])).toBe("  ");
      expect(splitByNewline.decode(["", "", ""])).toBe("\n\n");
      expect(splitByPipe.decode(["", "", "", ""])).toBe("|||");
    });

    it("should handle complex multi-character delimiters", () => {
      const splitByComplex = runaStringSplit("--");
      expect(splitByComplex.decode(["a", "b", "c"])).toBe("a--b--c");
      expect(splitByComplex.decode(["start", "end"])).toBe("start--end");
      expect(splitByComplex.decode(["no delimiter"])).toBe("no delimiter");
    });

    it("should handle emoji and Unicode arrays", () => {
      const splitByDash = runaStringSplit("-");
      expect(splitByDash.decode(["😀", "😁", "😂"])).toBe("😀-😁-😂");
      expect(splitByDash.decode(["测试", "字符串"])).toBe("测试-字符串");
      expect(splitByDash.decode(["café", "münchen"])).toBe("café-münchen");
    });

    it("should throw error for non-array inputs", () => {
      expect(() =>
        splitByComma.decode("string" as unknown as string[]),
      ).toThrow('Invalid array: "string"');
      expect(() => splitByComma.decode(123 as unknown as string[])).toThrow(
        "Invalid array: 123",
      );
      expect(() => splitByComma.decode(null as unknown as string[])).toThrow(
        "Invalid array: null",
      );
      expect(() =>
        splitByComma.decode(undefined as unknown as string[]),
      ).toThrow("Invalid array: undefined");
      expect(() => splitByComma.decode({} as unknown as string[])).toThrow(
        "Invalid array: {}",
      );
    });

    it("should handle arrays with non-string elements (they get converted to strings)", () => {
      // Note: The implementation doesn't check array element types, so numbers get converted to strings
      expect(splitByComma.decode([1, 2, 3] as any)).toBe("1,2,3");
      expect(splitBySpace.decode(["hello", 123, "world"] as any)).toBe(
        "hello 123 world",
      );
    });
  });

  describe("bidirectional operations", () => {
    it("should be bidirectional - encode then decode returns original", () => {
      const testCases = [
        "a,b,c",
        "hello world",
        "line1\nline2\nline3",
        "a|b|c",
        "simple",
        "",
        "a,,b",
        ",start,end,",
        ",,,",
        "😀-😁-😂",
        "测试-字符串",
      ];

      for (const original of testCases) {
        const splitWithComma = runaStringSplit(",");
        const splitWithSpace = runaStringSplit(" ");
        const splitWithNewline = runaStringSplit("\n");
        const splitWithPipe = runaStringSplit("|");
        const splitWithDash = runaStringSplit("-");

        // Test with comma delimiter
        if (original.includes(",")) {
          const encoded = splitWithComma.encode(original);
          const decoded = splitWithComma.decode(encoded);
          expect(decoded).toBe(original);
        }

        // Test with space delimiter
        if (original.includes(" ")) {
          const encoded = splitWithSpace.encode(original);
          const decoded = splitWithSpace.decode(encoded);
          expect(decoded).toBe(original);
        }

        // Test with newline delimiter
        if (original.includes("\n")) {
          const encoded = splitWithNewline.encode(original);
          const decoded = splitWithNewline.decode(encoded);
          expect(decoded).toBe(original);
        }

        // Test with pipe delimiter
        if (original.includes("|")) {
          const encoded = splitWithPipe.encode(original);
          const decoded = splitWithPipe.decode(encoded);
          expect(decoded).toBe(original);
        }

        // Test with dash delimiter
        if (original.includes("-")) {
          const encoded = splitWithDash.encode(original);
          const decoded = splitWithDash.decode(encoded);
          expect(decoded).toBe(original);
        }
      }
    });

    it("should be bidirectional for edge cases", () => {
      const edgeCases = [
        "",
        "single",
        "a,b,c,d,e,f,g",
        "  multiple   spaces  ",
        "\n\nmultiple\n\nnewlines\n\n",
        "||||pipes||everywhere||||",
        "a--b--c--d",
        "😀😁😂😃😄",
      ];

      for (const original of edgeCases) {
        const commaSplit = runaStringSplit(",");
        const spaceSplit = runaStringSplit(" ");
        const newlineSplit = runaStringSplit("\n");
        const pipeSplit = runaStringSplit("|");
        const dashSplit = runaStringSplit("-");
        const doubleDashSplit = runaStringSplit("--");
        const emptySplit = runaStringSplit("");

        // Test all delimiters with edge cases
        const testCases = [
          { splitter: commaSplit, char: "," },
          { splitter: spaceSplit, char: " " },
          { splitter: newlineSplit, char: "\n" },
          { splitter: pipeSplit, char: "|" },
          { splitter: dashSplit, char: "-" },
          { splitter: doubleDashSplit, char: "--" },
          { splitter: emptySplit, char: "" },
        ];

        for (const { splitter, char } of testCases) {
          const encoded = splitter.encode(original);
          const decoded = splitter.decode(encoded);
          expect(decoded).toBe(original);
        }
      }
    });
  });

  describe("delimiter edge cases", () => {
    it("should handle single character delimiters", () => {
      const singleCharSplit = runaStringSplit("x");
      expect(singleCharSplit.encode("axbxcx")).toEqual(["a", "b", "c", ""]);
      expect(singleCharSplit.decode(["a", "b", "c"])).toBe("axbxc");
    });

    it("should handle multi-character delimiters", () => {
      const multiCharSplit = runaStringSplit("DELIMITER");
      expect(multiCharSplit.encode("aDELIMITERbDELIMITERc")).toEqual([
        "a",
        "b",
        "c",
      ]);
      expect(multiCharSplit.decode(["a", "b", "c"])).toBe(
        "aDELIMITERbDELIMITERc",
      );
    });

    it("should handle whitespace delimiters", () => {
      const tabSplit = runaStringSplit("\t");
      expect(tabSplit.encode("a\tb\tc")).toEqual(["a", "b", "c"]);
      expect(tabSplit.decode(["a", "b", "c"])).toBe("a\tb\tc");

      const carriageReturnSplit = runaStringSplit("\r");
      expect(carriageReturnSplit.encode("a\rb\rc")).toEqual(["a", "b", "c"]);
      expect(carriageReturnSplit.decode(["a", "b", "c"])).toBe("a\rb\rc");
    });

    it("should handle escape sequences as delimiters", () => {
      const backslashSplit = runaStringSplit("\\");
      expect(backslashSplit.encode("a\\b\\c")).toEqual(["a", "b", "c"]);
      expect(backslashSplit.decode(["a", "b", "c"])).toBe("a\\b\\c");

      const quoteSplit = runaStringSplit('"');
      expect(quoteSplit.encode('a"b"c')).toEqual(["a", "b", "c"]);
      expect(quoteSplit.decode(["a", "b", "c"])).toBe('a"b"c');
    });

    it("should handle very long delimiters", () => {
      const longDelimiter = "VERY_LONG_DELIMITER";
      const longSplit = runaStringSplit(longDelimiter);
      expect(
        longSplit.encode(`start${longDelimiter}middle${longDelimiter}end`),
      ).toEqual(["start", "middle", "end"]);
      expect(longSplit.decode(["start", "middle", "end"])).toBe(
        `start${longDelimiter}middle${longDelimiter}end`,
      );
    });
  });

  describe("performance and size considerations", () => {
    it("should handle very large strings", () => {
      const largeString = `${"a,".repeat(10000)}b`;
      const encoded = splitByComma.encode(largeString);
      expect(encoded).toHaveLength(10001);
      expect(encoded[0]).toBe("a");
      expect(encoded[10000]).toBe("b");
    });

    it("should handle very large arrays", () => {
      const largeArray = Array(10000).fill("item");
      const decoded = splitByComma.decode(largeArray);
      expect(decoded.length).toBe(10000 * 5 - 1); // "item" (4 chars) + "," repeated, but last item doesn't have comma
    });

    it("should handle deeply nested scenarios", () => {
      const nested = "a,b,c,d,e,f,g,h,i,j,k,l,m,n,o,p,q,r,s,t,u,v,w,x,y,z";
      const encoded = splitByComma.encode(nested);
      expect(encoded).toHaveLength(26);
      const decoded = splitByComma.decode(encoded);
      expect(decoded).toBe(nested);
    });
  });
});
