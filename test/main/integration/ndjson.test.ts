// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

import { describe, expect, it } from "vitest";

import {
  parse,
  stringify,
  type StringifyOptions,
} from "../../../src/main/infrastructure/ndjson";

describe("NDJSON", () => {
  describe("Parser", () => {
    it("should parse with newline as line delimiter", async () => {
      const records = parseRecords(
        '{"foo":"bar"}\n{"baz":42}\n{"qux":[1,2,3]}\n',
      );

      expect(records).toEqual([
        { foo: "bar" },
        { baz: 42 },
        { qux: [1, 2, 3] },
      ]);
    });

    it("should parse with carriage return and newline as line delimiter", async () => {
      const records = parseRecords(
        '{"foo":"bar"}\r\n{"baz":42}\r\n{"qux":[1,2,3]}\r\n',
      );

      expect(records).toEqual<Record<string, unknown>[]>([
        { foo: "bar" },
        { baz: 42 },
        { qux: [1, 2, 3] },
      ]);
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
  });
});

function parseRecords(...chunks: string[]): Record<string, unknown>[] {
  const parser = parse();
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
