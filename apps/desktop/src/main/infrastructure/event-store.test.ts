// Copyright (c) 2026 Falko Schumann. MIT license.

import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";

import { describe, expect, it } from "vitest";

import type { DomainEvent } from "../../shared/domain/events.ts";
import { SqliteEventStore } from "./event-store.ts";

describe("Event Store", () => {
  it("sollte leer sein, wenn noch keine Events angehängt wurden", () => {
    const store = SqliteEventStore.createInMemory();

    const events = store.query();

    expect(events).toEqual([]);
  });

  it("sollte alle Events in der Reihenfolge des Anhängens liefern", () => {
    const store = SqliteEventStore.createInMemory();
    store.append([createPraxisAngelegt("NHP")]);
    store.append([createPraxisAngelegt("ABC"), createPraxisGeaendert("NHP")]);

    const events = store.query();

    expect(events).toEqual([
      createPraxisAngelegt("NHP"),
      createPraxisAngelegt("ABC"),
      createPraxisGeaendert("NHP"),
    ]);
  });

  it("sollte nur Events mit passendem Typ und Tag liefern", () => {
    const store = SqliteEventStore.createInMemory();
    store.append([
      createPraxisAngelegt("NHP"),
      createPraxisAngelegt("ABC"),
      createPraxisGeaendert("NHP"),
    ]);

    const events = store.query({
      types: ["praxis-angelegt"],
      tags: ["praxis:NHP"],
    });

    expect(events).toEqual([createPraxisAngelegt("NHP")]);
  });

  it("sollte Events dauerhaft in einer Datei speichern", async () => {
    const directory = await fs.mkdtemp(
      path.join(os.tmpdir(), "naturheilpraxis-test-"),
    );
    try {
      const filename = path.join(directory, "naturheilpraxis.db");
      const writer = SqliteEventStore.create(filename);
      writer.append([createPraxisAngelegt("NHP")]);
      writer.close();

      const reader = SqliteEventStore.create(filename);
      const events = reader.query();
      reader.close();

      expect(events).toEqual([createPraxisAngelegt("NHP")]);
    } finally {
      await fs.rm(directory, { recursive: true, force: true });
    }
  });
});

function createPraxisAngelegt(praxiskuerzel: string): DomainEvent {
  return {
    type: "praxis-angelegt",
    data: {
      praxiskuerzel,
      name: "Naturheilpraxis am Markt",
      anschrift: {
        strasse: "Marktplatz 1",
        postleitzahl: "12345",
        ort: "Musterstadt",
      },
    },
  };
}

function createPraxisGeaendert(praxiskuerzel: string): DomainEvent {
  return {
    type: "praxisdaten-geaendert",
    data: {
      praxiskuerzel,
      name: "Naturheilpraxis am Markt",
      anschrift: {
        strasse: "Marktplatz 2",
        postleitzahl: "12345",
        ort: "Musterstadt",
      },
    },
  };
}
