// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

import fsPromise from "node:fs/promises";
import path from "node:path";

import { CloudEvent, type CloudEventV1 } from "cloudevents";
import { describe, expect, it } from "vitest";

import { NdjsonEventStore } from "../../../src/main/infrastructure/ndjson_event_store";
import { NdjsonError } from "../../../src/main/infrastructure/ndjson";
import {
  Query,
  SequencedEvent,
} from "../../../src/main/infrastructure/event_store";
import type { CloudEventV1WithData } from "../../../src/main/infrastructure/cloud_event_store";

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
  describe("Read", () => {
    it("should not read any event from non-existent file", async () => {
      const store = NdjsonEventStore.create({ fileName: NON_EXISTENT_FILE });

      const events = await Array.fromAsync(store.read(Query.all()));

      expect(events).toEqual<CloudEventV1<unknown>[]>([]);
    });

    it("should read events from example file", async () => {
      const store = NdjsonEventStore.create({ fileName: EXAMPLE_FILE });

      const events = await Array.fromAsync(store.read(Query.all()));

      expect(events).toEqual<SequencedEvent<CloudEventV1WithData>[]>([
        new SequencedEvent(
          {
            id: "id-1",
            specversion: "1.0",
            source: "/test-source",
            type: "type-1",
            time: "2025-07-09T06:17:11Z",
            data: "test-data-1",
          },
          0,
        ),
        new SequencedEvent(
          {
            id: "id-2",
            specversion: "1.0",
            source: "/test-source",
            type: "type-2",
            time: "2025-07-09T06:17:17Z",
            data: "test-data-2",
          },
          1,
        ),
      ]);
    });

    it("should throw an error when file is corrupt", async () => {
      const store = NdjsonEventStore.create({ fileName: CORRUPTED_FILE });

      const result = Array.fromAsync(store.read(Query.all()));

      await expect(result).rejects.toThrow(NdjsonError);
    });
  });

  describe("Append", () => {
    it("should read stored events", async () => {
      await fsPromise.rm(TEST_FILE, { force: true });
      const store = NdjsonEventStore.create({ fileName: TEST_FILE });

      const event = createTestCloudEvent();
      await store.append(event);
      const events = await Array.fromAsync(store.read(Query.all()));

      expect(events).toEqual<SequencedEvent<CloudEventV1WithData>[]>([
        new SequencedEvent(event, 0),
      ]);
    });
  });

  describe("Nullable", () => {
    it("should append events", async () => {
      await fsPromise.rm(TEST_FILE, { force: true });
      const store = NdjsonEventStore.createNull();
      const appendedEvents = store.trackAppendedEvents();

      const event1 = createTestCloudEvent({ id: "event-1", data: "data-1" });
      const event2 = createTestCloudEvent({ id: "event-2", data: "data-2" });
      await store.append([event1, event2]);

      expect(appendedEvents.data).toEqual<CloudEventV1<unknown>[][]>([
        [event1, event2],
      ]);
    });

    it("should read events", async () => {
      await fsPromise.rm(TEST_FILE, { force: true });
      const event1 = createTestCloudEvent({ id: "event-1", data: "data-1" });
      const event2 = createTestCloudEvent({ id: "event-2", data: "data-2" });
      const store = NdjsonEventStore.createNull({ events: [event1, event2] });

      const events = await Array.fromAsync(store.read(Query.all()));

      expect(events).toEqual<SequencedEvent<CloudEventV1WithData>[]>([
        new SequencedEvent(event1, 0),
        new SequencedEvent(event2, 1),
      ]);
    });
  });
});

function createTestCloudEvent({
  id = "test-id",
  specversion = "1.0",
  source = "/test-source",
  type = "test-type",
  time = new Date().toISOString(),
  data = "test-data",
}: Partial<CloudEventV1WithData<string>> = {}): CloudEventV1WithData {
  return new CloudEvent({
    id,
    specversion,
    source,
    type,
    time,
    data,
  }) as CloudEventV1WithData;
}
