// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

import fs from "node:fs/promises";
import path from "node:path";
import stream from "node:stream";

import { OutputTracker } from "@muspellheim/shared";
import { CloudEvent, type CloudEventV1 } from "cloudevents";

import * as ndjson from "./ndjson";

export class EventStore extends EventTarget {
  static create({
    fileName = "data/event-log.ndjson",
  }: {
    fileName?: string;
  } = {}) {
    return new EventStore(fileName, fs);
  }

  static createNull({
    events = [],
  }: { events?: CloudEventV1<unknown>[] } = {}) {
    return new EventStore(
      "null/event-log.ndjson",
      new FileSystemStub(events) as unknown as typeof fs,
    );
  }

  readonly #fileName: string;
  readonly #fs: typeof fs;

  private constructor(fileName: string, fsModule: typeof fs) {
    super();
    this.#fileName = fileName;
    this.#fs = fsModule;
  }

  async record(event: CloudEventV1<unknown>) {
    const dirName = path.dirname(this.#fileName);
    await this.#fs.mkdir(dirName, { recursive: true });

    const file = await this.#fs.open(this.#fileName, "a");
    const stream = file.createWriteStream();
    await new Promise<void>((resolve, reject) => {
      const stringifier = ndjson.stringify();
      stringifier.pipe(stream);

      stream.on("close", () => resolve());
      stream.on("error", (error) => reject(error));

      stringifier.write(new CloudEvent(event));
      stringifier.end();
    });
    this.dispatchEvent(new CustomEvent("eventRecorded", { detail: event }));
  }

  trackRecordedEvents() {
    return OutputTracker.create<CloudEventV1<unknown>>(this, "eventRecorded");
  }

  async *replay() {
    let file;
    try {
      file = await this.#fs.open(this.#fileName);
      const parser = file.createReadStream().pipe(ndjson.parse());
      for await (const record of parser) {
        yield new CloudEvent(record);
      }
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === "ENOENT") {
        // No such file or directory, no events recorded yet
        return;
      }

      throw error;
    } finally {
      await file?.close();
    }
  }
}

class FileSystemStub {
  #events;

  constructor(events: CloudEventV1<unknown>[]) {
    this.#events = events;
  }

  async mkdir() {}

  async open() {
    const chunk = this.#events.map((event) => JSON.stringify(event)).join("\n");
    return new FileHandleStub([chunk]);
  }
}

class FileHandleStub {
  #chunks;

  constructor(chunks: string[]) {
    this.#chunks = chunks;
  }

  createReadStream() {
    return new ArrayReadableStream(this.#chunks);
  }

  createWriteStream() {
    return new stream.Writable({
      write(_chunk, _encoding, callback) {
        callback();
      },
    });
  }

  close() {}
}

class ArrayReadableStream extends stream.Readable {
  #chunks;
  #currentIndex = 0;

  constructor(chunks: unknown[]) {
    super({ objectMode: true }); // Aktiviert das Object Mode, wenn du Objekte streamen möchtest
    this.#chunks = chunks;
  }

  _read() {
    if (this.#currentIndex < this.#chunks.length) {
      // Wenn das Array noch Elemente hat, hole das nächste Element
      const chunk = this.#chunks[this.#currentIndex++];
      this.push(chunk); // Schiebe das Element in den Stream
    } else {
      // Wenn kein Element mehr vorhanden ist, beende den Stream
      this.push(null);
    }
  }
}
