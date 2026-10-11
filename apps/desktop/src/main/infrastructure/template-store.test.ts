// Copyright (c) 2026 Falko Schumann. MIT license.

import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";

import { describe, expect, it } from "vitest";

import { SqliteEventStore } from "./event-store.ts";
import { SqliteTemplateStore } from "./template-store.ts";

describe("Template Store", () => {
  it("sollte keine Vorlage liefern, solange keine gesichert ist", () => {
    const store = SqliteTemplateStore.createInMemory();

    const vorlage = store.find("rechnung");

    expect(vorlage).toBeUndefined();
  });

  it("sollte nur die zuletzt gesicherte Vorlage liefern", () => {
    const store = SqliteTemplateStore.createInMemory();
    store.save("rechnung", "<p>alt</p>");

    store.save("rechnung", "<p>neu</p>");

    expect(store.find("rechnung")).toBe("<p>neu</p>");
  });

  it("sollte die Vorlage in der Datei des Event Stores sichern", async () => {
    const directory = await fs.mkdtemp(
      path.join(os.tmpdir(), "naturheilpraxis-"),
    );
    try {
      const filename = path.join(directory, "naturheilpraxis.db");
      SqliteEventStore.create(filename).close();
      const store = SqliteTemplateStore.open(filename);
      store.save("rechnung", "<p>Rechnung</p>");
      store.close();

      const reopened = SqliteTemplateStore.open(filename);
      const vorlage = reopened.find("rechnung");
      reopened.close();

      expect(vorlage).toBe("<p>Rechnung</p>");
      const eventStore = SqliteEventStore.open(filename);
      expect(eventStore.query()).toEqual([]);
      eventStore.close();
    } finally {
      await fs.rm(directory, { recursive: true, force: true });
    }
  });
});
