// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

import fsPromise from "node:fs/promises";
import path from "node:path";

import { CloudEvent, type CloudEventV1 } from "cloudevents";
import { describe, expect, it } from "vitest";

import { EventStore } from "../../../src/main/infrastructure/event_store";
import { NdjsonError } from "../../../src/main/infrastructure/ndjson";

const NON_EXISTENT_FILE = path.resolve(
  __dirname,
  "../data/event-store/non-existent.ndjson",
);

const EXAMPLE_FILE = path.resolve(
  __dirname,
  "../data/event-store/example.ndjson",
);

const CORRUPTED_FILE = path.resolve(
  __dirname,
  "../data/event-store/corrupt.ndjson",
);

const TEST_FILE = path.resolve(
  __dirname,
  "../../../testdata/event-store.test.ndjson",
);

describe("Event store", () => {
  describe("Replay", () => {
    it("should not replay any event from non-existent file", async () => {
      const store = EventStore.create({ fileName: NON_EXISTENT_FILE });

      const events = await Array.fromAsync(store.replay());

      expect(events).toEqual<CloudEventV1<unknown>[]>([]);
    });

    it("should replay events from example file", async () => {
      const store = EventStore.create({ fileName: EXAMPLE_FILE });

      const events = await Array.fromAsync(store.replay());

      expect(events).toEqual<CloudEventV1<unknown>[]>([
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

    it("should throw an error when file is corrupt", async () => {
      const store = EventStore.create({ fileName: CORRUPTED_FILE });

      const result = Array.fromAsync(store.replay());

      await expect(result).rejects.toThrow(NdjsonError);
    });
  });

  describe("Record", () => {
    it("should replay recorded events", async () => {
      await fsPromise.rm(TEST_FILE, { force: true });
      const store = EventStore.create({ fileName: TEST_FILE });

      const event = createTestCloudEvent();
      await store.record(event);
      const events = await Array.fromAsync(store.replay());

      expect(events).toEqual<CloudEventV1<unknown>[]>([event]);
    });
  });

  describe("Nullable", () => {
    it("should record events", async () => {
      await fsPromise.rm(TEST_FILE, { force: true });
      const store = EventStore.createNull();
      const recordedEvents = store.trackRecordedEvents();

      const event1 = createTestCloudEvent({ id: "event-1", data: "data-1" });
      await store.record(event1);
      const event2 = createTestCloudEvent({ id: "event-2", data: "data-2" });
      await store.record(event2);

      expect(recordedEvents.data).toEqual<CloudEventV1<unknown>[]>([
        event1,
        event2,
      ]);
    });

    it("should replay events", async () => {
      await fsPromise.rm(TEST_FILE, { force: true });
      const event1 = createTestCloudEvent({ id: "event-1", data: "data-1" });
      const event2 = createTestCloudEvent({ id: "event-2", data: "data-2" });
      const store = EventStore.createNull({ events: [event1, event2] });

      const events = await Array.fromAsync(store.replay());

      expect(events).toEqual<CloudEventV1<unknown>[]>([event1, event2]);
    });
  });
});

function createTestCloudEvent<T>({
  id = "test-id",
  type = "test-type",
  source = "test-source",
  specversion = "1.0",
  time = new Date().toISOString(),
  data = undefined,
}: Partial<CloudEventV1<T>> = {}): CloudEventV1<T> {
  return new CloudEvent<T>({ id, type, source, specversion, time, data });
}
