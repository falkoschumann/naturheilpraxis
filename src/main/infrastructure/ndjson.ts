// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

// See https://github.com/ndjson/ndjson-spec

import stream from "node:stream";

export function parse() {
  return new Parser();
}

export class Parser extends stream.Transform {
  #buffer = "";

  constructor() {
    super({ writableObjectMode: false, readableObjectMode: true });
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
        continue;
      }

      try {
        const json = JSON.parse(trimmed);
        this.push(json);
      } catch (err) {
        callback(err as Error);
        return;
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
        callback(err as Error);
        return;
      }
    }
    callback();
  }
}

export function stringify() {
  return new Stringify();
}

export class Stringify extends stream.Transform {
  constructor() {
    super({ writableObjectMode: true, readableObjectMode: false });
  }

  _transform(
    chunk: unknown,
    _encoding: BufferEncoding,
    callback: (err?: Error | null) => void,
  ) {
    try {
      const json = JSON.stringify(chunk);
      this.push(json + "\n");
      callback();
    } catch (err) {
      callback(err as Error);
    }
  }
}
