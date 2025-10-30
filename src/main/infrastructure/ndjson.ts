// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

// See https://github.com/ndjson/ndjson-spec

import stream from "node:stream";

export interface ParseOptions {
  skipEmptyLines?: boolean;
  skipRecordWithError?: boolean;
  onSkip?: (message: string, record: string) => void;
}

export function parse(options: ParseOptions = {}) {
  return new Parser(options);
}

export class Parser extends stream.Transform {
  readonly #skipEmptyLines: boolean;
  readonly #skipRecordWithError: boolean;
  readonly #onSkip?: (message: string, record: string) => void;

  #buffer = "";

  constructor(options: ParseOptions = {}) {
    super({
      writableObjectMode: false,
      readableObjectMode: true,
    });
    this.#skipEmptyLines = options.skipEmptyLines ?? false;
    this.#skipRecordWithError = options.skipRecordWithError ?? false;
    this.#onSkip = options.onSkip;
  }

  _transform(
    chunk: Buffer | string,
    _encoding: BufferEncoding,
    callback: (err?: Error | null) => void,
  ) {
    this.#buffer += chunk.toString();

    let idx: number;
    while ((idx = this.#buffer.indexOf("\n")) !== -1) {
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

        this.emit("error", new SyntaxError("Line is empty."));
      }

      try {
        const json = JSON.parse(trimmed);
        this.push(json);
      } catch (err) {
        if (!this.#skipRecordWithError) {
          this.emit("error", err);
        }

        if (this.#onSkip) {
          this.#onSkip(
            `Skipping record due to error: ${(err as Error).message}`,
            trimmed,
          );
        }
      }
    }

    callback();
  }

  _flush(callback: (err?: Error | null) => void) {
    let line = this.#buffer;
    if (line.endsWith("\r")) {
      line = line.slice(0, -1);
    }

    const trimmed = line.trim();
    if (trimmed !== "") {
      try {
        const json = JSON.parse(trimmed);
        this.push(json);
      } catch (err) {
        this.emit("error", err);
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
      this.emit("error", err);
    }
  }
}
