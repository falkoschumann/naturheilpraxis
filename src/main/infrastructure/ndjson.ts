// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

// See https://github.com/ndjson/ndjson-spec

import stream from "node:stream";

export interface ParseOptions {
  skipEmptyLines?: boolean;
  skipRecordWithError?: boolean;
  onSkip?: (error: NdjsonError, raw: string) => void;
}

export function parse(options: ParseOptions = {}) {
  return new Parser(options);
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

export interface StringifyOptions {
  recordDelimiter?: string;
}

export function stringify(options: StringifyOptions = {}) {
  return new Stringifier(options);
}

export class Stringifier extends stream.Transform {
  #recordDelimiter: string;

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
      const json = JSON.stringify(chunk);
      this.push(json + this.#recordDelimiter);
      callback();
    } catch (err) {
      const ndjsonError = new NdjsonError(
        "Failed to stringify record: " + (err as Error).message,
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
