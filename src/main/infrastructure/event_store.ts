// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

import fs from "node:fs/promises";
import path from "node:path";

import { CloudEvent, type CloudEventV1 } from "cloudevents";

import * as ndjson from "./ndjson";

export interface EventStore {
  record(event: CloudEventV1<unknown>): Promise<void>;

  replay(): AsyncGenerator<CloudEventV1<unknown>>;
}

export class MemoryEventStore implements EventStore {
  readonly #events: CloudEventV1<unknown>[];

  constructor(...events: CloudEventV1<unknown>[]) {
    this.#events = events;
  }

  async record(event: CloudEventV1<unknown>): Promise<void> {
    this.#events.push(event);
  }

  async *replay(): AsyncGenerator<CloudEventV1<unknown>> {
    for (const event of this.#events) {
      yield event;
    }
  }
}

export class NdjsonEventStore implements EventStore {
  static create({
    fileName = "data/event-log.ndjson",
  }: {
    fileName?: string;
  }): NdjsonEventStore {
    return new NdjsonEventStore(fileName);
  }

  readonly #fileName: string;

  constructor(fileName: string) {
    this.#fileName = fileName;
  }

  async record(event: CloudEventV1<unknown>): Promise<void> {
    let file: fs.FileHandle | undefined;
    try {
      const dirName = path.dirname(this.#fileName);
      await fs.mkdir(dirName, { recursive: true });

      const stringifier = ndjson.stringify();
      const file = await fs.open(this.#fileName, "a");
      const stream = file.createWriteStream();
      stringifier.pipe(stream);
      stringifier.write(new CloudEvent(event));
      stringifier.end();
    } finally {
      await file?.close();
    }
  }

  async *replay(): AsyncGenerator<CloudEventV1<unknown>> {
    let file: fs.FileHandle | undefined;
    try {
      file = await fs.open(this.#fileName);
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
      file?.close();
    }
  }
}
