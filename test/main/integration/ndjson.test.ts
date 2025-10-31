// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

import { describe, expect, it } from "vitest";

import {
  parse,
  type ParseOptions,
  stringify,
  type StringifyOptions,
} from "../../../src/main/infrastructure/ndjson";

describe("NDJSON", () => {
  describe("Parser", () => {
    it("should parse with newline as line delimiter", () => {
      const records = parseRecords(
        undefined,
        '{"foo":"bar"}\n{"baz":42}\n{"qux":[1,2,3]}\n',
      );

      expect(records).toEqual([
        { foo: "bar" },
        { baz: 42 },
        { qux: [1, 2, 3] },
      ]);
    });

    it("should parse with carriage return and newline as line delimiter", () => {
      const records = parseRecords(
        undefined,
        '{"foo":"bar"}\r\n{"baz":42}\r\n{"qux":[1,2,3]}\r\n',
      );

      expect(records).toEqual<Record<string, unknown>[]>([
        { foo: "bar" },
        { baz: 42 },
        { qux: [1, 2, 3] },
      ]);
    });

    it("should throw an error when a line is not parsable", () => {
      // missing closing brace in second record
      expect(() =>
        parseRecords(undefined, '{"foo":"bar"}\n{"baz":42\n{"qux":[1,2,3]}\n'),
      ).toThrow(SyntaxError);
      expect(() =>
        parseRecords(undefined, '{"foo":"bar"}\n{"baz":42\n{"qux":[1,2,3]}\n'),
      ).toThrow(/^Line 2 is not valid JSON: /);
    });

    it("should skip records with error", () => {
      // missing closing brace in second record
      const records = parseRecords(
        { skipRecordWithError: true },
        '{"foo":"bar"}\n{"baz":42\n{"qux":[1,2,3]}\n',
      );

      expect(records).toEqual([{ foo: "bar" }, { qux: [1, 2, 3] }]);
    });

    it.skip("should emit skipped records", () => {
      const skipped: { message: string; record: string }[] = [];
      // TODO add skip event listener
      // missing closing brace in second record
      parseRecords(
        {
          skipRecordWithError: true,
        },
        '{"foo":"bar"}\n{"baz":42\n{"qux":[1,2,3]}\n',
      );

      expect(skipped).toEqual([
        {
          message: expect.stringMatching(/^Skipping line 2 due to error: /),
          record: '{"baz":42',
        },
      ]);
    });

    it("should log skipped records", () => {
      const skipped: { message: string; record: string }[] = [];
      // missing closing brace in second record
      parseRecords(
        {
          skipRecordWithError: true,
          onSkip: (message, record) => skipped.push({ message, record }),
        },
        '{"foo":"bar"}\n{"baz":42\n{"qux":[1,2,3]}\n',
      );

      expect(skipped).toEqual([
        {
          message: expect.stringMatching(/^Skipping line 2 due to error: /),
          record: '{"baz":42',
        },
      ]);
    });

    it("should throw an error when a line is empty", () => {
      // second record is empty
      expect(() =>
        parseRecords(undefined, '{"foo":"bar"}\n\n{"qux":[1,2,3]}\n'),
      ).toThrow(SyntaxError("Line 2 is empty."));
    });

    it("should skip empty line", () => {
      // second record is empty
      const records = parseRecords(
        { skipEmptyLines: true },
        '{"foo":"bar"}\n\n{"qux":[1,2,3]}\n',
      );

      expect(records).toEqual([{ foo: "bar" }, { qux: [1, 2, 3] }]);
    });
  });

  describe("Stringify", () => {
    it("should stringify with newline as default line delimiter", () => {
      const output = stringifyRecords(
        undefined,
        { foo: "bar" },
        { baz: 42 },
        { qux: [1, 2, 3] },
      );

      expect(output).toEqual<string>(
        '{"foo":"bar"}\n{"baz":42}\n{"qux":[1,2,3]}\n',
      );
    });

    it("should stringify with carriage return and newline as line delimiter", () => {
      const output = stringifyRecords(
        { recordDelimiter: "\r\n" },
        { foo: "bar" },
        { baz: 42 },
        { qux: [1, 2, 3] },
      );

      expect(output).toEqual<string>(
        '{"foo":"bar"}\r\n{"baz":42}\r\n{"qux":[1,2,3]}\r\n',
      );
    });

    it("should throw an error when object can not stringify", () => {
      expect(() =>
        stringifyRecords(
          undefined,
          { foo: "bar" },
          { baz: BigInt(42) },
          { qux: [1, 2, 3] },
        ),
      ).toThrow(TypeError);
    });
  });
});

function parseRecords(
  options?: ParseOptions,
  ...chunks: string[]
): Record<string, unknown>[] {
  const parser = parse(options);
  const records: Record<string, unknown>[] = [];
  parser.on("data", (record) => records.push(record));

  chunks.forEach((chunk) => parser.write(chunk));
  parser.end();

  return records;
}

function stringifyRecords(
  options?: StringifyOptions,
  ...records: Record<string, unknown>[]
): string {
  const stringifier = stringify(options);
  let output = "";
  stringifier.on("data", (record) => (output += record));

  records.forEach((record) => stringifier.write(record));
  stringifier.end();
  return output;
}
