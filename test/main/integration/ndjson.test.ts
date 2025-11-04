// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

import { finished } from "node:stream/promises";

import type { JsonValue } from "type-fest";
import { describe, expect, it } from "vitest";

import {
  NdjsonError,
  parse,
  type ParseOptions,
  stringify,
  type StringifyOptions,
} from "../../../src/main/infrastructure/ndjson";

describe("NDJSON", () => {
  describe("Parser", () => {
    it("should parse with newline as line delimiter", async () => {
      const { records } = await parseRecords(
        '{"foo":"bar"}\n{"baz":42}\n{"qux":[1,2,3]}\n',
      );

      expect(records).toEqual<JsonValue[]>([
        { foo: "bar" },
        { baz: 42 },
        { qux: [1, 2, 3] },
      ]);
    });

    it("should parse with carriage return and newline as line delimiter", async () => {
      const { records } = await parseRecords(
        '{"foo":"bar"}\r\n{"baz":42}\r\n{"qux":[1,2,3]}\r\n',
      );

      expect(records).toEqual<JsonValue[]>([
        { foo: "bar" },
        { baz: 42 },
        { qux: [1, 2, 3] },
      ]);
    });

    it("should parse without newline at the end", async () => {
      const { records } = await parseRecords(
        '{"foo":"bar"}\n{"baz":42}\n{"qux":[1,2,3]}',
      );

      expect(records).toEqual<JsonValue[]>([
        { foo: "bar" },
        { baz: 42 },
        { qux: [1, 2, 3] },
      ]);
    });

    it("should parse a buffer", async () => {
      const { records } = await parseRecords(
        Buffer.from('{"foo":"bar"}\n{"baz":42}\n{"qux":[1,2,3]}\n'),
      );

      expect(records).toEqual<JsonValue[]>([
        { foo: "bar" },
        { baz: 42 },
        { qux: [1, 2, 3] },
      ]);
    });

    it("should parse an uint array", async () => {
      const { records } = await parseRecords(
        new TextEncoder().encode(
          '{"foo":"bar"}\n{"baz":42}\n{"qux":[1,2,3]}\n',
        ),
      );

      expect(records).toEqual<JsonValue[]>([
        { foo: "bar" },
        { baz: 42 },
        { qux: [1, 2, 3] },
      ]);
    });

    it("should throw an error when a line is not parsable", async () => {
      // missing closing brace in second record
      const result = parseRecords(
        '{"foo":"bar"}\n{"baz":42\n{"qux":[1,2,3]}\n',
      );

      await expect(result).rejects.toThrow(NdjsonError);
      await expect(result).rejects.toThrow(/^Line 2 is not valid JSON: /);
    });

    it("should throw an error when the last line is not parsable without newline at the end", async () => {
      // missing closing brace in second record
      const result = parseRecords('{"foo":"bar"}\n{"baz":42}\n{"qux":[1,2,3]');

      await expect(result).rejects.toThrow(NdjsonError);
      await expect(result).rejects.toThrow(/^Line 3 is not valid JSON: /);
    });

    it("should skip records with error", async () => {
      // missing closing brace in second record
      const { records } = await parseRecords(
        '{"foo":"bar"}\n{"baz":42\n{"qux":[1,2,3]}\n',
        { skipRecordWithError: true },
      );

      expect(records).toEqual<JsonValue[]>([
        { foo: "bar" },
        { qux: [1, 2, 3] },
      ]);
    });

    it("should emit skipped records", async () => {
      // missing closing brace in second record
      const { skipped } = await parseRecords(
        '{"foo":"bar"}\n{"baz":42\n{"qux":[1,2,3]}\n',
        { skipRecordWithError: true },
      );

      expect(skipped).toEqual<JsonValue[]>([
        {
          error: expect.any(NdjsonError),
          raw: '{"baz":42',
        },
      ]);
      expect(skipped[0].error.message).toMatch(/^Line 2 is not valid JSON: /);
    });

    it("should log skipped records", async () => {
      const skipped: { error: NdjsonError; raw: string }[] = [];
      // missing closing brace in second record
      await parseRecords('{"foo":"bar"}\n{"baz":42\n{"qux":[1,2,3]}\n', {
        skipRecordWithError: true,
        onSkip: (error, raw) => skipped.push({ error, raw }),
      });

      expect(skipped).toEqual<JsonValue[]>([
        {
          error: expect.any(NdjsonError),
          raw: '{"baz":42',
        },
      ]);
      expect(skipped[0].error.message).toMatch(/^Line 2 is not valid JSON: /);
    });

    it("should throw an error when a line is empty", async () => {
      // second record is empty
      const result = parseRecords('{"foo":"bar"}\n\n{"qux":[1,2,3]}\n');

      await expect(result).rejects.toThrow(NdjsonError);
      await expect(result).rejects.toThrow("Line 2 is empty.");
    });

    it("should skip empty line", async () => {
      // second record is empty
      const { records } = await parseRecords(
        '{"foo":"bar"}\n\n{"qux":[1,2,3]}\n',
        { skipEmptyLines: true },
      );

      expect(records).toEqual<JsonValue[]>([
        { foo: "bar" },
        { qux: [1, 2, 3] },
      ]);
    });

    it("should throw an error when an argument is invalid", async () => {
      const result = parseRecords(42 as unknown as string);

      await expect(result).rejects.toThrow(NdjsonError);
      await expect(result).rejects.toThrow(
        "Invalid argument, got 42 at index 0",
      );
    });
  });

  describe("Stringify", () => {
    it("should stringify with newline as default line delimiter", async () => {
      const { output } = await stringifyRecords([
        { foo: "bar" },
        { baz: 42 },
        { qux: [1, 2, 3] },
      ]);

      expect(output).toBe('{"foo":"bar"}\n{"baz":42}\n{"qux":[1,2,3]}\n');
    });

    it("should stringify with carriage return and newline as line delimiter", async () => {
      const { output } = await stringifyRecords(
        [{ foo: "bar" }, { baz: 42 }, { qux: [1, 2, 3] }],
        { recordDelimiter: "\r\n" },
      );

      expect(output).toBe('{"foo":"bar"}\r\n{"baz":42}\r\n{"qux":[1,2,3]}\r\n');
    });

    it("should throw an error when object can not stringify", async () => {
      const result = stringifyRecords([
        { foo: "bar" },
        // @ts-expect-error testing invalid value
        { baz: BigInt(42) },
        { qux: [1, 2, 3] },
      ]);

      await expect(result).rejects.toThrow(NdjsonError);
      await expect(result).rejects.toThrow(/^Failed to stringify record #2: /);
    });

    it("should throw an error when an argument is invalid", async () => {
      const result = stringifyRecords(42 as unknown as JsonValue[]);

      await expect(result).rejects.toThrow(NdjsonError);
      await expect(result).rejects.toThrow(
        "Invalid argument, got 42 at index 0",
      );
    });
  });
});

async function parseRecords(
  input: string | Buffer | Uint8Array,
  options: ParseOptions = {},
): Promise<{
  records: JsonValue[];
  skipped: { error: NdjsonError; raw: string }[];
}> {
  let records: JsonValue[] = [];
  const skipped: { error: NdjsonError; raw: string }[] = [];
  const parser = parse(input, options, (_error, output) => {
    if (output) {
      records = output;
    }
  });
  parser.on("skip", (error, raw) => skipped.push({ error, raw }));
  await finished(parser);
  return { records, skipped };
}

async function stringifyRecords(
  records: JsonValue[],
  options: StringifyOptions = {},
): Promise<{ output: string }> {
  let output = "";
  const stringifier = stringify(records, options, (_error, output0) => {
    if (output0) {
      output = output0;
    }
  });
  await finished(stringifier);
  return { output };
}
