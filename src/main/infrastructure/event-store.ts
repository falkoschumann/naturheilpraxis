// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

import fsPromise from "node:fs/promises";
import path from "node:path";

import { CloudEvent, type CloudEventV1 } from "cloudevents";

export interface EventStore {
  record(event: CloudEventV1<unknown>): Promise<void>;

  replay(): AsyncGenerator<CloudEventV1<unknown>>;
}

export class MemoryEventStore implements EventStore {
  readonly #events: CloudEventV1<unknown>[] = [];

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
  readonly #fileName: string;

  constructor(fileName: string) {
    this.#fileName = fileName;
  }

  async record(event: CloudEventV1<unknown>): Promise<void> {
    const dirName = path.dirname(this.#fileName);
    await fsPromise.mkdir(dirName, { recursive: true });

    const json = JSON.stringify(event);
    const file = await fsPromise.open(this.#fileName, "a");
    await file.write(`${json}\n`, null, "utf8");
    await file.close();
  }

  async *replay(): AsyncGenerator<CloudEventV1<unknown>> {
    try {
      const file = await fsPromise.open(this.#fileName, "r");
      for await (const line of file.readLines({ encoding: "utf8" })) {
        const json = JSON.parse(line);
        yield new CloudEvent(json);
      }
      await file.close();
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === "ENOENT") {
        // No such file or directory, no events recorded yet
        return;
      }

      throw error;
    }
  }
}
