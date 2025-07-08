// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

import { open } from "node:fs/promises";

import { CloudEvent } from "cloudevents";

export interface EventStore {
  record(event: CloudEvent): Promise<void>;

  replay(): AsyncGenerator<CloudEvent>;
}

export class MemoryEventStore implements EventStore {
  private events: CloudEvent[] = [];

  async record(event: CloudEvent): Promise<void> {
    this.events.push(event);
  }

  async *replay(): AsyncGenerator<CloudEvent> {
    for (const event of this.events) {
      yield event;
    }
  }
}

export class NdjsonEventStore implements EventStore {
  async record(event: CloudEvent): Promise<void> {
    const file = await open("events.ndjson", "a");
    await file.write(`${event.toString()}\n`);
    await file.close();
  }

  async *replay(): AsyncGenerator<CloudEvent> {
    const file = await open("events.ndjson", "r");
    for await (const line of file.readLines()) {
      const json = JSON.parse(line);
      yield new CloudEvent(json);
    }
  }
}
