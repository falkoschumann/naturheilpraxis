// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

import fsPromise from "node:fs/promises";
import path from "node:path";

import { CloudEvent, type CloudEventV1 } from "cloudevents";
import { describe, expect, it } from "vitest";

import type { Event } from "../../../src/main/domain/event";
import { Query } from "../../../src/main/infrastructure/event_store";
import { NdjsonEventStore } from "../../../src/main/infrastructure/ndjson_event_store";
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
      const store = NdjsonEventStore.create({ fileName: NON_EXISTENT_FILE });

      const events = await Array.fromAsync(store.replay(Query.all()));

      expect(events).toEqual<CloudEventV1<unknown>[]>([]);
    });

    it("should replay events from example file", async () => {
      const store = NdjsonEventStore.create({ fileName: EXAMPLE_FILE });

      const events = await Array.fromAsync(store.replay(Query.all()));

      expect(events).toEqual<Event[]>([
        {
          id: "id-1",
          specversion: "1.0",
          source: "/test-source",
          type: "type-1",
          position: 0,
          time: "2025-07-09T06:17:11Z",
          tags: ["foo"],
          data: "test-data-1",
        },
        {
          id: "id-2",
          specversion: "1.0",
          source: "/test-source",
          type: "type-2",
          position: 1,
          time: "2025-07-09T06:17:17Z",
          tags: ["foo", "bar"],
          data: "test-data-2",
        },
      ]);
    });

    it("should return events that match any type", async () => {
      const event1 = createTestEvent({ id: "id-1", type: "EventType1" });
      const event2 = createTestEvent({ id: "id-2", type: "EventType2" });
      const event3 = createTestEvent({ id: "id-3", type: "EventType1" });
      const event4 = createTestEvent({ id: "id-4", type: "EventType3" });
      const store = NdjsonEventStore.createNull({
        events: [event1, event2, event3, event4],
      });

      const events = await Array.fromAsync(
        store.replay(
          Query.fromItems([{ types: ["EventType1", "EventType2"] }]),
        ),
      );

      expect(events).toEqual<Event[]>([event1, event2, event3]);
    });

    it("should return events that match all tags", async () => {
      const event1 = createTestEvent({ id: "id-1", tags: ["tag1"] });
      const event2 = createTestEvent({ id: "id-2" });
      const event3 = createTestEvent({ id: "id-3", tags: ["tag2"] });
      const event4 = createTestEvent({ id: "id-4", tags: ["tag1", "tag2"] });
      const event5 = createTestEvent({ id: "id-5", tags: ["tag2", "tag3"] });
      const event6 = createTestEvent({
        id: "id-6",
        tags: ["tag1", "tag2", "tag3"],
      });
      const store = NdjsonEventStore.createNull({
        events: [event1, event2, event3, event4, event5, event6],
      });

      const events = await Array.fromAsync(
        store.replay(Query.fromItems([{ tags: ["tag1", "tag2"] }])),
      );

      expect(events).toEqual<Event[]>([event4, event6]);
    });

    it("should return events that match any type and all tags", async () => {
      const event1 = createTestEvent({
        id: "id-1",
        type: "EventType1",
        tags: ["tag1", "tag2", "tag3"],
      });
      const event2 = createTestEvent({
        id: "id-2",
        type: "EventType2",
        tags: ["tag1", "tag2", "tag3"],
      });
      const event3 = createTestEvent({
        id: "id-3",
        type: "EventType3",
        tags: ["tag1", "tag2"],
      });
      const event4 = createTestEvent({
        id: "id-4",
        type: "EventType1",
        tags: ["tag1", "tag3"],
      });
      const event5 = createTestEvent({
        id: "id-5",
        type: "EventType2",
      });
      const store = NdjsonEventStore.createNull({
        events: [event1, event2, event3, event4, event5],
      });

      const events = await Array.fromAsync(
        store.replay(
          Query.fromItems([
            { types: ["EventType2", "EventType3"], tags: ["tag1", "tag3"] },
          ]),
        ),
      );

      expect(events).toEqual<Event[]>([event2]);
    });

    it("should return events that match any query item", async () => {
      // match by type
      const event1 = createTestEvent({
        id: "id-1",
        type: "EventType1",
        tags: ["tag3", "tag4"],
      });
      // match by tags
      const event2 = createTestEvent({
        id: "id-2",
        type: "EventType4",
        tags: ["tag1", "tag2"],
      });
      // match by type and tags
      const event3 = createTestEvent({
        id: "id-3",
        type: "EventType2",
        tags: ["tag1", "tag3"],
      });
      // no match
      const event4 = createTestEvent({
        id: "id-4",
        type: "EventType3",
        tags: ["tag1"],
      });
      const store = NdjsonEventStore.createNull({
        events: [event1, event2, event3, event4],
      });

      const events = await Array.fromAsync(
        store.replay(
          Query.fromItems([
            { types: ["EventType1", "EventType2"] },
            { tags: ["tag1", "tag2"] },
            { types: ["EventType2", "EventType3"], tags: ["tag1", "tag3"] },
          ]),
        ),
      );

      expect(events).toEqual<Event[]>([event1, event2, event3]);
    });

    it("should throw an error when file is corrupt", async () => {
      const store = NdjsonEventStore.create({ fileName: CORRUPTED_FILE });

      const result = Array.fromAsync(store.replay(Query.all()));

      await expect(result).rejects.toThrow(NdjsonError);
    });
  });

  describe("Record", () => {
    it("should replay recorded events", async () => {
      await fsPromise.rm(TEST_FILE, { force: true });
      const store = NdjsonEventStore.create({ fileName: TEST_FILE });

      const event = createTestEvent();
      await store.record(event);
      const events = await Array.fromAsync(store.replay(Query.all()));

      expect(events).toEqual<Event[]>([{ ...event, position: 0 }]);
    });
  });

  describe("Nullable", () => {
    it("should record events", async () => {
      await fsPromise.rm(TEST_FILE, { force: true });
      const store = NdjsonEventStore.createNull();
      const recordedEvents = store.trackRecordedEvents();

      const event1 = createTestEvent({ id: "event-1", data: "data-1" });
      const event2 = createTestEvent({ id: "event-2", data: "data-2" });
      await store.record([event1, event2]);

      expect(recordedEvents.data).toEqual<CloudEventV1<unknown>[][]>([
        [event1, event2],
      ]);
    });

    it("should replay events", async () => {
      await fsPromise.rm(TEST_FILE, { force: true });
      const event1 = createTestEvent({
        id: "event-1",
        position: 0,
        data: "data-1",
      });
      const event2 = createTestEvent({
        id: "event-2",
        position: 1,
        data: "data-2",
      });
      const store = NdjsonEventStore.createNull({ events: [event1, event2] });

      const events = await Array.fromAsync(store.replay(Query.all()));

      expect(events).toEqual<Event[]>([event1, event2]);
    });
  });
});

function createTestEvent({
  id = "test-id",
  specversion = "1.0",
  source = "/test-source",
  type = "test-type",
  time = new Date().toISOString(),
  data = "test-data",
  ...rest
}: Partial<Event> = {}): Event {
  return new CloudEvent({
    ...rest,
    id,
    specversion,
    source,
    type,
    time,
    data,
  }) as Event;
}
