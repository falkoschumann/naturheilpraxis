// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

// See https://github.com/ndjson/ndjson-spec

import stream from "node:stream";

import type { JsonValue } from "type-fest";

export type ParserCallback<T = JsonValue> = (
  error?: NdjsonError,
  records?: T[],
) => void;

export interface ParseOptions {
  skipEmptyLines?: boolean;
  skipRecordWithError?: boolean;
  onSkip?: (error: NdjsonError, raw: string) => void;
}

export function parse<T = JsonValue>(
  input?: string | Buffer | Uint8Array,
  options?: ParseOptions,
  callback?: ParserCallback<T>,
): Parser;
export function parse<T = JsonValue>(
  options: ParseOptions,
  callback?: ParserCallback<T>,
): Parser;
export function parse<T = JsonValue>(
  input?: string | Buffer | Uint8Array,
  callback?: ParserCallback<T>,
): Parser;
export function parse<T = JsonValue>(callback?: ParserCallback<T>): Parser;
export function parse<T = JsonValue>(...args: unknown[]): Parser {
  let input: string | Buffer | Uint8Array | undefined;
  let options: ParseOptions | undefined;
  let callback: ParserCallback<T> | undefined;
  for (const i in args) {
    const argument = args[i];
    if (
      input === undefined &&
      (typeof argument === "string" ||
        Buffer.isBuffer(argument) ||
        argument instanceof Uint8Array)
    ) {
      input = argument;
    } else if (options === undefined && isObject(argument)) {
      options = argument as ParseOptions;
    } else if (callback === undefined && typeof argument === "function") {
      callback = argument as ParserCallback<T>;
    } else {
      throw new NdjsonError(
        `Invalid arguments: got ${JSON.stringify(argument)} at index ${i}.`,
      );
    }
  }

  const parser = new Parser(options);
  if (callback) {
    const records: T[] = [];
    parser.on("readable", () => {
      let record;
      while ((record = parser.read()) !== null) {
        records.push(record);
      }
    });
    parser.on("error", (error) => {
      callback(error);
    });
    parser.on("end", () => {
      callback(undefined, records);
    });
  }
  if (input !== undefined) {
    const writer = () => {
      parser.write(input);
      parser.end();
    };
    setTimeout(writer, 0);
  }

  return parser;
}

export class Parser extends stream.Transform {
  readonly #skipEmptyLines: boolean;
  readonly #skipRecordWithError: boolean;
  readonly #onSkip: (error: NdjsonError, raw: string) => void;

  #buffer = "";
  #line = 0;

  constructor(options: ParseOptions = {}) {
    super({
      writableObjectMode: false,
      readableObjectMode: true,
    });
    this.#skipEmptyLines = options.skipEmptyLines ?? false;
    this.#skipRecordWithError = options.skipRecordWithError ?? false;
    this.#onSkip =
      options.onSkip ??
      ((error, chunk) => {
        this.emit("skip", error, chunk);
      });
  }

  _transform(
    chunk: Buffer | string,
    _encoding: BufferEncoding,
    callback: (err?: Error | null) => void,
  ) {
    this.#buffer += chunk.toString();

    let idx: number;
    while ((idx = this.#buffer.indexOf("\n")) !== -1) {
      this.#line++;
      let line = this.#buffer.slice(0, idx);
      this.#buffer = this.#buffer.slice(idx + 1);
      if (line.endsWith("\r")) {
        line = line.slice(0, -1);
      }

      const trimmed = line.trim();
      if (trimmed === "") {
        if (this.#skipEmptyLines) {
          continue;
        }

        const ndjsonError = new NdjsonError(`Line ${this.#line} is empty.`);
        callback(ndjsonError);
        this.destroy(ndjsonError);
        return;
      }

      try {
        const json = JSON.parse(trimmed);
        this.push(json);
      } catch (error) {
        const ndjsonError = new NdjsonError(
          `Line ${this.#line} is not valid JSON: ${(error as Error).message}`,
        );
        if (!this.#skipRecordWithError) {
          callback(ndjsonError);
          this.destroy(ndjsonError);
          return;
        }

        this.#onSkip(ndjsonError, line);
      }
    }

    callback();
  }

  _flush(callback: (err?: Error | null) => void) {
    this.#line++;
    const line = this.#buffer;
    const trimmed = line.trim();
    if (trimmed !== "") {
      try {
        const json = JSON.parse(trimmed);
        this.push(json);
      } catch (error) {
        const ndjsonError = new NdjsonError(
          `Line ${this.#line} is not valid JSON: ${(error as Error).message}`,
        );
        callback(ndjsonError);
        this.destroy(ndjsonError);
        return;
      }
    }

    callback();
  }
}

export type StringifyCallback = (error?: NdjsonError, output?: string) => void;

export interface StringifyOptions {
  recordDelimiter?: string;
}

export function stringify(callback?: StringifyCallback): Stringifier;
export function stringify(
  options: StringifyOptions,
  callback?: StringifyCallback,
): Stringifier;
export function stringify(
  input: JsonValue,
  callback?: StringifyCallback,
): Stringifier;
export function stringify(
  input: JsonValue,
  options?: StringifyOptions,
  callback?: StringifyCallback,
): Stringifier;
export function stringify(...args: unknown[]): Stringifier {
  let input: JsonValue | undefined;
  let options: StringifyOptions | undefined;
  let callback: StringifyCallback | undefined;
  for (const i in args) {
    const argument = args[i];
    if (input === undefined && Array.isArray(argument)) {
      input = argument as JsonValue;
    } else if (options === undefined && isObject(argument)) {
      options = argument as StringifyOptions;
    } else if (callback === undefined && typeof argument === "function") {
      callback = argument as StringifyCallback;
    } else {
      throw new NdjsonError(
        `Invalid arguments: got ${JSON.stringify(argument)} at index ${i}.`,
      );
    }
  }

  const stringifier = new Stringifier(options);
  if (callback) {
    const chunks: string[] = [];
    stringifier.on("readable", () => {
      let chunk;
      while ((chunk = stringifier.read()) !== null) {
        chunks.push(chunk);
      }
    });
    stringifier.on("error", (error) => {
      callback(error);
    });
    stringifier.on("end", () => {
      try {
        callback(undefined, chunks.join(""));
      } catch (error) {
        // This can happen if chunks is extremely large.
        callback(error as Error);
        return;
      }
    });
  }
  if (input !== undefined) {
    const writer = () => {
      if (Array.isArray(input)) {
        input.forEach((record) => stringifier.write(record));
      } else {
        stringifier.write(input);
      }
      stringifier.end();
    };
    setTimeout(writer, 0);
  }
  return stringifier;
}

export class Stringifier extends stream.Transform {
  #recordDelimiter: string;
  #recordNumber = 0;

  constructor(options: StringifyOptions = {}) {
    super({
      writableObjectMode: true,
      readableObjectMode: false,
    });
    this.#recordDelimiter = options.recordDelimiter ?? "\n";
  }

  _transform(
    chunk: unknown,
    _encoding: BufferEncoding,
    callback: (err?: Error | null) => void,
  ) {
    try {
      this.#recordNumber++;
      const json = JSON.stringify(chunk);
      this.push(json + this.#recordDelimiter);
      callback();
    } catch (err) {
      const ndjsonError = new NdjsonError(
        `Failed to stringify record #${this.#recordNumber}: ` +
          (err as Error).message,
      );
      callback(ndjsonError);
      this.destroy(ndjsonError);
      return;
    }
  }
}

export class NdjsonError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "NdjsonError";
  }
}

const isObject = function (obj: unknown): obj is Record<string, unknown> {
  return typeof obj === "object" && obj !== null && !Array.isArray(obj);
};
