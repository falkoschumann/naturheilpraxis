// Copyright (c) 2026 Falko Schumann. MIT license.

import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";

import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { SqliteEventStore } from "../infrastructure/event-store.ts";
import type { FileDialog } from "../infrastructure/file-dialog.ts";
import type {
  Settings,
  SettingsStore,
} from "../infrastructure/settings-store.ts";
import { DatabaseService } from "./database-service.ts";

describe("Database Service", () => {
  let directory: string;

  beforeEach(async () => {
    directory = await fs.mkdtemp(
      path.join(os.tmpdir(), "naturheilpraxis-test-"),
    );
  });

  afterEach(async () => {
    await fs.rm(directory, { recursive: true, force: true });
  });

  function datei(name: string): string {
    return path.join(directory, name);
  }

  function createService({
    recentDatabases = [],
    fileDialog = new FakeFileDialog(),
  }: {
    recentDatabases?: readonly string[];
    fileDialog?: FileDialog;
  } = {}) {
    const settingsStore = new MemorySettingsStore({ recentDatabases });
    const service = new DatabaseService({
      settingsStore,
      fileDialog,
      defaultDatabase: datei("naturheilpraxis.db"),
    });
    return { service, settingsStore };
  }

  describe("Start", () => {
    it("sollte ohne zuletzt geöffnete Datenbank keine öffnen", () => {
      const { service } = createService();

      const status = service.start();

      expect(status).toEqual({});
      expect(() => service.naturheilpraxis).toThrow(
        "Es ist keine Datenbank geöffnet.",
      );
    });

    it("sollte die zuletzt geöffnete Datenbank öffnen", async () => {
      legeDatenbankAn(datei("praxis.db"), "NHP");
      const { service } = createService({
        recentDatabases: [datei("praxis.db")],
      });

      const status = service.start();

      expect(status).toEqual({ filename: datei("praxis.db") });
      expect(await praxen(service)).toEqual(["NHP"]);
    });

    it("sollte die Datenbank am bisherigen Ort weiter nutzen", () => {
      legeDatenbankAn(datei("naturheilpraxis.db"), "NHP");
      const { service, settingsStore } = createService();

      const status = service.start();

      expect(status).toEqual({ filename: datei("naturheilpraxis.db") });
      expect(settingsStore.settings.recentDatabases).toEqual([
        datei("naturheilpraxis.db"),
      ]);
    });

    it("sollte melden, wenn die zuletzt geöffnete Datenbank fehlt", () => {
      const { service } = createService({
        recentDatabases: [datei("netzlaufwerk.db")],
      });

      const status = service.start();

      expect(status).toEqual({
        errorMessage: `Die Datenbank „${datei("netzlaufwerk.db")}“ wurde nicht gefunden. Bitte prüfen Sie, ob das Laufwerk verbunden ist, oder wählen Sie eine andere Datenbank.`,
        retryFilename: datei("netzlaufwerk.db"),
      });
    });

    it("sollte die fehlende Datenbank melden, bis eine Datenbank geöffnet ist", () => {
      const { service } = createService({
        recentDatabases: [datei("netzlaufwerk.db")],
      });
      service.start();

      const status = service.getStatus();

      expect(status).toEqual({
        errorMessage: `Die Datenbank „${datei("netzlaufwerk.db")}“ wurde nicht gefunden. Bitte prüfen Sie, ob das Laufwerk verbunden ist, oder wählen Sie eine andere Datenbank.`,
        retryFilename: datei("netzlaufwerk.db"),
      });
    });

    it("sollte die Datenbank erneut öffnen, sobald sie wieder erreichbar ist", () => {
      const { service } = createService({
        recentDatabases: [datei("netzlaufwerk.db")],
      });
      service.start();
      legeDatenbankAn(datei("netzlaufwerk.db"), "NHP");

      const status = service.reopenDatabase();

      expect(status).toEqual({ filename: datei("netzlaufwerk.db") });
    });
  });

  describe("Neue Datenbank anlegen", () => {
    it("sollte eine neue Datenbank anlegen und merken", async () => {
      const { service, settingsStore } = createService({
        fileDialog: new FakeFileDialog({ newDatabase: datei("neu.db") }),
      });
      service.start();

      const status = await service.createDatabase();

      expect(status).toEqual({ filename: datei("neu.db") });
      expect(await praxen(service)).toEqual([]);
      expect(settingsStore.settings.recentDatabases).toEqual([datei("neu.db")]);
    });

    // The file dialog of the system has asked the user to confirm.
    it("sollte eine vorhandene Datei überschreiben", async () => {
      legeDatenbankAn(datei("alt.db"), "NHP");
      const { service } = createService({
        fileDialog: new FakeFileDialog({ newDatabase: datei("alt.db") }),
      });
      service.start();

      const status = await service.createDatabase();

      expect(status).toEqual({ filename: datei("alt.db") });
      expect(await praxen(service)).toEqual([]);
    });

    it("sollte die geöffnete Datenbank überschreiben", async () => {
      legeDatenbankAn(datei("praxis.db"), "NHP");
      const { service } = createService({
        recentDatabases: [datei("praxis.db")],
        fileDialog: new FakeFileDialog({ newDatabase: datei("praxis.db") }),
      });
      service.start();

      const status = await service.createDatabase();

      expect(status).toEqual({ filename: datei("praxis.db") });
      expect(await praxen(service)).toEqual([]);
    });

    it("sollte nichts ändern, wenn der Nutzer abbricht", async () => {
      legeDatenbankAn(datei("praxis.db"), "NHP");
      const { service } = createService({
        recentDatabases: [datei("praxis.db")],
      });
      service.start();

      const status = await service.createDatabase();

      expect(status).toEqual({ filename: datei("praxis.db") });
    });
  });

  describe("Datenbank öffnen", () => {
    it("sollte die gewählte Datenbank öffnen und die bisherige schließen", async () => {
      legeDatenbankAn(datei("praxis.db"), "NHP");
      legeDatenbankAn(datei("andere.db"), "ABC");
      const opened: string[] = [];
      const { service, settingsStore } = createService({
        recentDatabases: [datei("praxis.db")],
        fileDialog: new FakeFileDialog({
          existingDatabase: datei("andere.db"),
        }),
      });
      service.onOpened((filename) => opened.push(filename));
      service.start();

      const status = await service.openDatabase();

      expect(status).toEqual({ filename: datei("andere.db") });
      expect(await praxen(service)).toEqual(["ABC"]);
      expect(settingsStore.settings.recentDatabases).toEqual([
        datei("andere.db"),
        datei("praxis.db"),
      ]);
      expect(opened).toEqual([datei("praxis.db"), datei("andere.db")]);
    });

    it("sollte eine zuletzt geöffnete Datenbank ohne Dialog öffnen", async () => {
      legeDatenbankAn(datei("praxis.db"), "NHP");
      legeDatenbankAn(datei("andere.db"), "ABC");
      const { service } = createService({
        recentDatabases: [datei("praxis.db"), datei("andere.db")],
      });
      service.start();

      const status = await service.openDatabase(datei("andere.db"));

      expect(status).toEqual({ filename: datei("andere.db") });
    });

    it("sollte eine fremde Datei ablehnen und die bisherige Datenbank behalten", async () => {
      legeDatenbankAn(datei("praxis.db"), "NHP");
      await fs.writeFile(datei("notiz.txt"), "Keine Datenbank");
      const { service } = createService({
        recentDatabases: [datei("praxis.db")],
        fileDialog: new FakeFileDialog({
          existingDatabase: datei("notiz.txt"),
        }),
      });
      service.start();

      const status = await service.openDatabase();

      expect(status).toEqual({
        filename: datei("praxis.db"),
        errorMessage: `Die Datei „${datei("notiz.txt")}“ ist keine Datenbank der Naturheilpraxis. Bitte wählen Sie eine andere Datei.`,
      });
      expect(await praxen(service)).toEqual(["NHP"]);
    });

    it("sollte höchstens fünf zuletzt geöffnete Datenbanken merken", async () => {
      const zuletzt = ["1.db", "2.db", "3.db", "4.db", "5.db"].map(datei);
      legeDatenbankAn(datei("1.db"), "NHP");
      legeDatenbankAn(datei("6.db"), "ABC");
      const { service, settingsStore } = createService({
        recentDatabases: zuletzt,
        fileDialog: new FakeFileDialog({ existingDatabase: datei("6.db") }),
      });
      service.start();

      await service.openDatabase();

      expect(settingsStore.settings.recentDatabases).toEqual(
        ["6.db", "1.db", "2.db", "3.db", "4.db"].map(datei),
      );
    });
  });
});

function legeDatenbankAn(filename: string, praxiskuerzel: string) {
  const store = SqliteEventStore.create(filename);
  store.append([
    {
      type: "praxis-angelegt",
      data: {
        praxiskuerzel,
        name: `Praxis ${praxiskuerzel}`,
        anschrift: {
          strasse: "Marktplatz 1",
          postleitzahl: "12345",
          ort: "Musterstadt",
        },
      },
    },
  ]);
  store.close();
}

async function praxen(service: DatabaseService): Promise<string[]> {
  const result = await service.naturheilpraxis.praxenErmitteln({
    type: "praxen-ermitteln",
    parameters: {},
  });
  return result.map((praxis) => praxis.praxiskuerzel);
}

class MemorySettingsStore implements SettingsStore {
  settings: Settings;

  constructor(settings: Settings) {
    this.settings = settings;
  }

  load(): Settings {
    return this.settings;
  }

  save(settings: Settings): void {
    this.settings = settings;
  }
}

// Answers the file dialogs like a user who chooses the given files, or cancels
// without them.
class FakeFileDialog implements FileDialog {
  readonly #newDatabase: string | undefined;
  readonly #existingDatabase: string | undefined;

  constructor({
    newDatabase,
    existingDatabase,
  }: { newDatabase?: string; existingDatabase?: string } = {}) {
    this.#newDatabase = newDatabase;
    this.#existingDatabase = existingDatabase;
  }

  chooseNewDatabase(): Promise<string | undefined> {
    return Promise.resolve(this.#newDatabase);
  }

  chooseExistingDatabase(): Promise<string | undefined> {
    return Promise.resolve(this.#existingDatabase);
  }
}
