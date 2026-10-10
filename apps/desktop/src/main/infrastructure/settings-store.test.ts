// Copyright (c) 2026 Falko Schumann. MIT license.

import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";

import { describe, expect, it } from "vitest";

import { JsonSettingsStore } from "./settings-store.ts";

describe("Settings Store", () => {
  it("sollte ohne Datei keine zuletzt geöffneten Datenbanken kennen", async () => {
    await withTemporaryDirectory((directory) => {
      const store = new JsonSettingsStore(
        path.join(directory, "settings.json"),
      );

      const settings = store.load();

      expect(settings).toEqual({ recentDatabases: [] });
    });
  });

  it("sollte gespeicherte Einstellungen wieder laden", async () => {
    await withTemporaryDirectory((directory) => {
      const filename = path.join(directory, "settings.json");
      new JsonSettingsStore(filename).save({
        recentDatabases: ["/daten/praxis.db", "/daten/alt.db"],
      });

      const settings = new JsonSettingsStore(filename).load();

      expect(settings).toEqual({
        recentDatabases: ["/daten/praxis.db", "/daten/alt.db"],
      });
    });
  });

  it("sollte eine beschädigte Datei wie eine fehlende behandeln", async () => {
    await withTemporaryDirectory(async (directory) => {
      const filename = path.join(directory, "settings.json");
      await fs.writeFile(filename, "{ kaputt");

      const settings = new JsonSettingsStore(filename).load();

      expect(settings).toEqual({ recentDatabases: [] });
    });
  });
});

async function withTemporaryDirectory(
  action: (directory: string) => void | Promise<void>,
): Promise<void> {
  const directory = await fs.mkdtemp(
    path.join(os.tmpdir(), "naturheilpraxis-test-"),
  );
  try {
    await action(directory);
  } finally {
    await fs.rm(directory, { recursive: true, force: true });
  }
}
