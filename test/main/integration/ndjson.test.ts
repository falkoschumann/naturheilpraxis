// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

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
        undefined,
        '{"foo":"bar"}\n{"baz":42}\n{"qux":[1,2,3]}\n',
      );

      expect(records).toEqual([
        { foo: "bar" },
        { baz: 42 },
        { qux: [1, 2, 3] },
      ]);
    });

    it("should parse with carriage return and newline as line delimiter", async () => {
      const { records } = await parseRecords(
        undefined,
        '{"foo":"bar"}\r\n{"baz":42}\r\n{"qux":[1,2,3]}\r\n',
      );

      expect(records).toEqual<Record<string, unknown>[]>([
        { foo: "bar" },
        { baz: 42 },
        { qux: [1, 2, 3] },
      ]);
    });

    it("should emit an error when a line is not parsable", async () => {
      // missing closing brace in second record
      const { errors } = await parseRecords(
        undefined,
        '{"foo":"bar"}\n{"baz":42\n{"qux":[1,2,3]}\n',
      );

      expect(errors).toEqual([expect.any(NdjsonError)]);
      expect(errors[0].message).toMatch(/^Line 2 is not valid JSON: /);
    });

    it("should skip records with error", async () => {
      // missing closing brace in second record
      const { records } = await parseRecords(
        { skipRecordWithError: true },
        '{"foo":"bar"}\n{"baz":42\n{"qux":[1,2,3]}\n',
      );

      expect(records).toEqual([{ foo: "bar" }, { qux: [1, 2, 3] }]);
    });

    it("should emit skipped records", async () => {
      // missing closing brace in second record
      const { skipped } = await parseRecords(
        {
          skipRecordWithError: true,
        },
        '{"foo":"bar"}\n{"baz":42\n{"qux":[1,2,3]}\n',
      );

      expect(skipped).toEqual([
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
      await parseRecords(
        {
          skipRecordWithError: true,
          onSkip: (error, raw) => skipped.push({ error, raw }),
        },
        '{"foo":"bar"}\n{"baz":42\n{"qux":[1,2,3]}\n',
      );

      expect(skipped).toEqual([
        {
          error: expect.any(NdjsonError),
          raw: '{"baz":42',
        },
      ]);
      expect(skipped[0].error.message).toMatch(/^Line 2 is not valid JSON: /);
    });

    it("should emit an error when a line is empty", async () => {
      // second record is empty
      const { errors } = await parseRecords(
        undefined,
        '{"foo":"bar"}\n\n{"qux":[1,2,3]}\n',
      );

      expect(errors).toEqual([expect.any(NdjsonError)]);
      expect(errors[0].message).toEqual("Line 2 is empty.");
    });

    it("should skip empty line", async () => {
      // second record is empty
      const { records } = await parseRecords(
        { skipEmptyLines: true },
        '{"foo":"bar"}\n\n{"qux":[1,2,3]}\n',
      );

      expect(records).toEqual([{ foo: "bar" }, { qux: [1, 2, 3] }]);
    });
  });

  describe("Stringify", () => {
    it("should stringify with newline as default line delimiter", async () => {
      const { output } = await stringifyRecords(
        undefined,
        { foo: "bar" },
        { baz: 42 },
        { qux: [1, 2, 3] },
      );

      expect(output).toEqual<string>(
        '{"foo":"bar"}\n{"baz":42}\n{"qux":[1,2,3]}\n',
      );
    });

    it("should stringify with carriage return and newline as line delimiter", async () => {
      const { output } = await stringifyRecords(
        { recordDelimiter: "\r\n" },
        { foo: "bar" },
        { baz: 42 },
        { qux: [1, 2, 3] },
      );

      expect(output).toEqual<string>(
        '{"foo":"bar"}\r\n{"baz":42}\r\n{"qux":[1,2,3]}\r\n',
      );
    });

    it("should emit an error when object can not stringify", async () => {
      const { errors } = await stringifyRecords(
        undefined,
        { foo: "bar" },
        { baz: BigInt(42) },
        { qux: [1, 2, 3] },
      );

      expect(errors).toEqual([expect.any(NdjsonError)]);
    });
  });
});

async function parseRecords(
  options?: ParseOptions,
  ...chunks: string[]
): Promise<{
  records: Record<string, unknown>[];
  errors: Error[];
  skipped: { error: NdjsonError; raw: string }[];
}> {
  const parser = parse(options);
  const records: Record<string, unknown>[] = [];
  const errors: Error[] = [];
  const skipped: { error: NdjsonError; raw: string }[] = [];
  parser.on("data", (record) => records.push(record));
  parser.on("error", (error) => {
    errors.push(error);
  });
  parser.on("skip", (error, raw) => skipped.push({ error, raw }));
  const closed = new Promise((resolve) => {
    parser.on("close", resolve);
  });

  chunks.forEach((chunk) => parser.write(chunk));
  parser.end();
  await closed;

  return { records, errors, skipped };
}

async function stringifyRecords(
  options?: StringifyOptions,
  ...records: Record<string, unknown>[]
): Promise<{ output: string; errors: Error[] }> {
  const stringifier = stringify(options);
  let output = "";
  const errors: Error[] = [];
  stringifier.on("data", (record) => (output += record));
  stringifier.on("error", (error) => {
    errors.push(error);
  });
  const closed = new Promise((resolve) => {
    stringifier.on("close", resolve);
  });

  records.forEach((record) => stringifier.write(record));
  stringifier.end();
  await closed;

  return { output, errors };
}
