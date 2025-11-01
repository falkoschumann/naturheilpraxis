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
        '{"foo":"bar"}\n{"baz":42}\n{"qux":[1,2,3]}\n',
      );

      expect(records).toEqual<JsonObject[]>([
        { foo: "bar" },
        { baz: 42 },
        { qux: [1, 2, 3] },
      ]);
    });

    it("should parse with carriage return and newline as line delimiter", async () => {
      const { records } = await parseRecords(
        '{"foo":"bar"}\r\n{"baz":42}\r\n{"qux":[1,2,3]}\r\n',
      );

      expect(records).toEqual<JsonObject[]>([
        { foo: "bar" },
        { baz: 42 },
        { qux: [1, 2, 3] },
      ]);
    });

    it("should emit an error when a line is not parsable", async () => {
      // missing closing brace in second record
      const { errors } = await parseRecords(
        '{"foo":"bar"}\n{"baz":42\n{"qux":[1,2,3]}\n',
      );

      expect(errors).toEqual<JsonObject[]>([expect.any(NdjsonError)]);
      expect(errors[0].message).toMatch(/^Line 2 is not valid JSON: /);
    });

    it("should skip records with error", async () => {
      // missing closing brace in second record
      const { records } = await parseRecords(
        '{"foo":"bar"}\n{"baz":42\n{"qux":[1,2,3]}\n',
        { skipRecordWithError: true },
      );

      expect(records).toEqual<JsonObject[]>([
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

      expect(skipped).toEqual<JsonObject[]>([
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

      expect(skipped).toEqual<JsonObject[]>([
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
        '{"foo":"bar"}\n\n{"qux":[1,2,3]}\n',
      );

      expect(errors).toEqual<JsonObject[]>([expect.any(NdjsonError)]);
      expect(errors[0].message).toBe("Line 2 is empty.");
    });

    it("should skip empty line", async () => {
      // second record is empty
      const { records } = await parseRecords(
        '{"foo":"bar"}\n\n{"qux":[1,2,3]}\n',
        { skipEmptyLines: true },
      );

      expect(records).toEqual<JsonObject[]>([
        { foo: "bar" },
        { qux: [1, 2, 3] },
      ]);
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

    it("should emit an error when object can not stringify", async () => {
      const { errors } = await stringifyRecords([
        { foo: "bar" },
        { baz: BigInt(42) },
        { qux: [1, 2, 3] },
      ]);

      expect(errors).toEqual<JsonObject[]>([expect.any(NdjsonError)]);
    });
  });
});

async function parseRecords(
  data: string,
  options?: ParseOptions,
): Promise<{
  records: JsonObject[];
  errors: Error[];
  skipped: { error: NdjsonError; raw: string }[];
}> {
  const parser = parse(options);
  const records: JsonObject[] = [];
  const errors: Error[] = [];
  const skipped: { error: NdjsonError; raw: string }[] = [];
  parser.on("readable", () => {
    let record;
    while ((record = parser.read()) !== null) {
      records.push(record);
    }
  });
  parser.on("error", (error) => {
    errors.push(error);
  });
  parser.on("skip", (error, raw) => skipped.push({ error, raw }));
  const closed = new Promise((resolve) => {
    parser.on("close", resolve);
  });

  parser.write(data);
  parser.end();
  await closed;

  return { records, errors, skipped };
}

async function stringifyRecords(
  records: JsonObject[],
  options?: StringifyOptions,
): Promise<{ output: string; errors: Error[] }> {
  const stringifier = stringify(options);
  let output = "";
  const errors: Error[] = [];
  stringifier.on("readable", () => {
    let data;
    while ((data = stringifier.read()) !== null) {
      output += data;
    }
  });
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

type JsonObject = Record<string, unknown>;
