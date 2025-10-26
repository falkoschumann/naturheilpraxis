// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

import { describe, it } from "vitest";

import { NaturheilpraxisService } from "../../../src/main/application/naturheilpraxis-service";
import { NdjsonEventStore } from "../../../src/main/infrastructure/event-store";

describe("Performance", () => {
  it("Queries Patientenkartei", async () => {
    const service = NaturheilpraxisService.create({
      eventStore: new NdjsonEventStore("data/events.ndjson"),
    });

    const start = Date.now();
    const result = await service.patientenkartei({});
    const end = Date.now();

    console.info(
      "Patientenkartei queried, number of Patienten",
      result.patienten.length,
    );
    console.info(`Query Patientenkartei took ${end - start} ms`);
  }, 60_000_000);
});
