// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

import fs from "node:fs/promises";
import path from "node:path";
import stream from "node:stream";

import { OutputTracker } from "@muspellheim/shared";

import {
  type AppendCondition,
  type Event,
  type EventStore,
  Query,
  type ReadOptions,
} from "../domain/event_store";
import * as ndjson from "./ndjson";
import { CloudEvent } from "cloudevents";

// TODO Write to folder instead of single file
// TODO Write segments named by start position
// TODO Write metadata files per segment
// - 00000000000000000000.log -> event log
// - 00000000000000000000.index -> mapping event position to offset in event log
// - 00000000000000000000.timeindex -> mapping event time to offset in event log

// TODO Configure event store segmentation
// - segment.ms=604800000 (7 days in milliseconds)
// - segment.bytes	1073741824 (1 GB)

export class NdjsonEventStore<T> extends EventTarget implements EventStore<T> {
  static create({
    fileName = "data/event-log.ndjson",
  }: {
    fileName?: string;
  } = {}) {
    return new NdjsonEventStore(fileName, fs);
  }

  static createNull<T>({ events = [] }: { events?: Event<T>[] } = {}) {
    return new NdjsonEventStore(
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

  async *replay(_query: Query, _options?: ReadOptions) {
    // TODO apply query
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

  async record(
    events: Iterable<Event<T>> | Event<T>,
    _condition?: AppendCondition,
  ) {
    const dirName = path.dirname(this.#fileName);
    await this.#fs.mkdir(dirName, { recursive: true });

    let position = -1;
    const replay = this.replay(Query.all());
    for await (const event of replay) {
      if (typeof event.position === "number") {
        position = event.position;
      }
    }

    const file = await this.#fs.open(this.#fileName, "a");
    const stream = file.createWriteStream();
    await new Promise<void>((resolve, reject) => {
      const stringifier = ndjson.stringify();
      stringifier.pipe(stream);

      stream.on("close", () => resolve());
      stream.on("error", (error) => reject(error));

      const iterable =
        Symbol.iterator in Object(events)
          ? (events as Iterable<Event<T>>)
          : [events as Event<T>];
      for (const event of iterable) {
        position += 1;
        const sequencedEvent = new CloudEvent(event).cloneWith({ position });
        stringifier.write(sequencedEvent);
      }
      stringifier.end();
    });
    this.dispatchEvent(new CustomEvent("eventsRecorded", { detail: events }));
  }

  trackRecordedEvents() {
    return OutputTracker.create<Event<T> | Event<T>[]>(this, "eventsRecorded");
  }
}

class FileSystemStub<E extends Event> {
  #events;

  constructor(events: E[]) {
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
