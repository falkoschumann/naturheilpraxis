// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

import fsPromise from "node:fs/promises";
import path from "node:path";

import { CloudEvent } from "cloudevents";
import type { CloudEventV1 } from "cloudevents/dist/event/interfaces";
import { beforeEach, describe, expect, it } from "vitest";

import { arrayFromAsync } from "../../src/main/common/polyfills";
import {
  MemoryEventStore,
  NdjsonEventStore,
} from "../../src/main/integration/event-store";

const TEST_FILE = path.resolve(
  __dirname,
  "../../testdata/event-store.test.ndjson",
);
const NON_EXISTING_FILE = path.resolve(
  __dirname,
  "../data/event-store.non-existent.ndjson",
);
const EXAMPLE_FILE = path.resolve(
  __dirname,
  "../data/event-store.example.ndjson",
);
const CORRUPTED_FILE = path.resolve(
  __dirname,
  "../data/event-store.corrupt.ndjson",
);

describe("Event store", () => {
  describe("Memory event store", () => {
    it("Replays recorded events", async () => {
      const store = new MemoryEventStore();

      const event = createTestCloudEvent();
      await store.record(event);
      const events = await arrayFromAsync(store.replay());

      expect(events).toEqual([event]);
    });
  });

  describe("NDJSON event store", () => {
    beforeEach(async () => {
      await fsPromise.rm(TEST_FILE, { force: true });
    });

    it("Replays recorded events", async () => {
      const store = new NdjsonEventStore(TEST_FILE);

      const event = createTestCloudEvent();
      await store.record(event);
      const events = await arrayFromAsync(store.replay());

      expect(events).toEqual([event]);
    });

    it("Replays no events from non existing file", async () => {
      const store = new NdjsonEventStore(NON_EXISTING_FILE);

      const events = await arrayFromAsync(store.replay());

      expect(events).toEqual([]);
    });

    it("Replays events from example file", async () => {
      const store = new NdjsonEventStore(EXAMPLE_FILE);

      const events = await arrayFromAsync(store.replay());

      expect(events).toEqual([
        {
          id: "id-1",
          time: "2025-07-09T06:17:11Z",
          type: "type-1",
          source: "test-source",
          specversion: "1.0",
        },
        {
          id: "id-2",
          time: "2025-07-09T06:17:17Z",
          type: "type-2",
          source: "test-source",
          specversion: "1.0",
        },
      ]);
    });

    it("Fails when file is corrupt", async () => {
      const store = new NdjsonEventStore(CORRUPTED_FILE);

      const result = arrayFromAsync(store.replay());

      await expect(result).rejects.toThrow(SyntaxError);
    });
  });
});

function createTestCloudEvent<T = undefined>(
  event: Partial<CloudEventV1<T>> = {
    id: "test-id",
    type: "test-type",
    source: "test-source",
    specversion: "1.0",
    time: new Date().toISOString(),
  },
): CloudEvent<T> {
  return new CloudEvent(event);
}
