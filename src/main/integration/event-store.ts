// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

import * as fsPromise from "node:fs/promises";
import * as path from "node:path";

import { CloudEvent } from "cloudevents";

export interface EventStore {
  record(event: CloudEvent<unknown>): Promise<void>;

  replay(): AsyncGenerator<CloudEvent<unknown>>;
}

export class MemoryEventStore implements EventStore {
  readonly #events: CloudEvent[] = [];

  async record(event: CloudEvent): Promise<void> {
    this.#events.push(event);
  }

  async *replay(): AsyncGenerator<CloudEvent> {
    for (const event of this.#events) {
      yield event;
    }
  }
}

export class NdjsonEventStore implements EventStore {
  readonly #fileName: string;

  constructor(fileName: string) {
    this.#fileName = fileName;
  }

  async record(event: CloudEvent): Promise<void> {
    const dirName = path.dirname(this.#fileName);
    await fsPromise.mkdir(dirName, { recursive: true });

    const json = JSON.stringify(event);
    const file = await fsPromise.open(this.#fileName, "a");
    await file.write(`${json}\n`, null, "utf8");
    await file.close();
  }

  async *replay(): AsyncGenerator<CloudEvent> {
    try {
      const file = await fsPromise.open(this.#fileName, "r");
      for await (const line of file.readLines({ encoding: "utf8" })) {
        const json = JSON.parse(line);
        yield new CloudEvent(json);
      }
      await file.close();
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === "ENOENT") {
        // No such file or directory
        return;
      }

      throw error;
    }
  }
}
