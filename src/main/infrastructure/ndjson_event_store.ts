// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

import fs from "node:fs/promises";
import path from "node:path";
import stream from "node:stream";

import { OutputTracker } from "@muspellheim/shared";

import {
  type AppendCondition,
  type Event,
  type EventStore,
  type Query,
  type ReadOptions,
  SequencedEvent,
} from "./event_store";
import * as ndjson from "./ndjson";

export class NdjsonEventStore<E extends Event>
  extends EventTarget
  implements EventStore<E>
{
  static create({
    fileName = "data/event-log.ndjson",
  }: {
    fileName?: string;
  } = {}) {
    return new NdjsonEventStore(fileName, fs);
  }

  static createNull<E extends Event>({ events = [] }: { events?: E[] } = {}) {
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

  async *read(_query: Query, _options?: ReadOptions) {
    // TODO apply query
    let file;
    try {
      file = await this.#fs.open(this.#fileName);
      const parser = file.createReadStream().pipe(ndjson.parse());
      // TODO get position from file
      let position = 0;
      for await (const record of parser) {
        yield new SequencedEvent(record, position);
        position++;
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

  async append(events: Iterable<E> | E, _condition?: AppendCondition) {
    const dirName = path.dirname(this.#fileName);
    await this.#fs.mkdir(dirName, { recursive: true });

    const file = await this.#fs.open(this.#fileName, "a");
    const stream = file.createWriteStream();
    await new Promise<void>((resolve, reject) => {
      const stringifier = ndjson.stringify();
      stringifier.pipe(stream);

      stream.on("close", () => resolve());
      stream.on("error", (error) => reject(error));

      const iterable =
        Symbol.iterator in Object(events)
          ? (events as Iterable<E>)
          : [events as E];
      for (const event of iterable) {
        stringifier.write(event);
      }
      stringifier.end();
    });
    this.dispatchEvent(new CustomEvent("eventsAppended", { detail: events }));
  }

  trackAppendedEvents() {
    return OutputTracker.create<E>(this, "eventsAppended");
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
