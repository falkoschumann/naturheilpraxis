// Copyright (c) 2026 Falko Schumann. MIT license.

import fs from "node:fs";

import type { DatabaseStatus } from "../../shared/application/database-api.ts";
import { SqliteEventStore } from "../infrastructure/event-store.ts";
import type { FileDialog } from "../infrastructure/file-dialog.ts";
import type { Printer } from "../infrastructure/printer.ts";
import type { SettingsStore } from "../infrastructure/settings-store.ts";
import { SqliteTemplateStore } from "../infrastructure/template-store.ts";
import { NaturheilpraxisService } from "./naturheilpraxis-service.ts";
import { RechnungsdruckService } from "./rechnungsdruck-service.ts";

// The app remembers this many databases for the menu "Zuletzt geöffnet".
const maximumRecentDatabases = 5;

type Failure = Readonly<{ errorMessage: string; retryFilename?: string }>;

type Database = Readonly<{
  filename: string;
  eventStore: SqliteEventStore;
  templateStore: SqliteTemplateStore;
  naturheilpraxis: NaturheilpraxisService;
  rechnungsdruck: RechnungsdruckService;
}>;

// Opens the database with the event store the user has chosen. A failed
// attempt keeps the database opened before.
export class DatabaseService {
  readonly #settingsStore: SettingsStore;
  readonly #fileDialog: FileDialog;
  readonly #printer: Printer;
  readonly #defaultDatabase: string;
  readonly #listeners: ((filename: string) => void)[] = [];
  #database: Database | undefined;
  // Why the start could not open the database opened last. The renderer asks
  // for the status only after the start.
  #startFailure: Failure | undefined;

  constructor({
    settingsStore,
    fileDialog,
    printer,
    defaultDatabase,
  }: {
    settingsStore: SettingsStore;
    fileDialog: FileDialog;
    printer: Printer;
    // Where the app kept its database before the user could choose one.
    defaultDatabase: string;
  }) {
    this.#settingsStore = settingsStore;
    this.#fileDialog = fileDialog;
    this.#printer = printer;
    this.#defaultDatabase = defaultDatabase;
  }

  get naturheilpraxis(): NaturheilpraxisService {
    if (this.#database === undefined) {
      throw new Error("Es ist keine Datenbank geöffnet.");
    }
    return this.#database.naturheilpraxis;
  }

  get rechnungsdruck(): RechnungsdruckService {
    if (this.#database === undefined) {
      throw new Error("Es ist keine Datenbank geöffnet.");
    }
    return this.#database.rechnungsdruck;
  }

  get recentDatabases(): readonly string[] {
    return this.#settingsStore.load().recentDatabases;
  }

  onOpened(listener: (filename: string) => void): void {
    this.#listeners.push(listener);
  }

  getStatus(): DatabaseStatus {
    return this.#status(this.#startFailure);
  }

  // Opens the database opened last. Without one, it takes over a database at
  // the former default location.
  start(): DatabaseStatus {
    const [lastDatabase] = this.recentDatabases;
    const filename =
      lastDatabase ??
      (fs.existsSync(this.#defaultDatabase)
        ? this.#defaultDatabase
        : undefined);
    if (filename === undefined) {
      return this.#status();
    }

    const status = this.#open(filename);
    if (status.errorMessage !== undefined) {
      this.#startFailure = {
        errorMessage: status.errorMessage,
        ...(status.retryFilename !== undefined && {
          retryFilename: status.retryFilename,
        }),
      };
    }
    return status;
  }

  reopenDatabase(): DatabaseStatus {
    const [lastDatabase] = this.recentDatabases;
    return lastDatabase === undefined
      ? this.#status()
      : this.#open(lastDatabase);
  }

  // The file dialog of the system asks the user to confirm overwriting an
  // existing file. An open database is closed to overwrite it.
  async createDatabase(): Promise<DatabaseStatus> {
    const filename = await this.#fileDialog.chooseNewDatabase();
    if (filename === undefined) {
      return this.#status();
    }

    const previous = this.#database?.filename;
    if (filename === previous) {
      this.close();
    }
    let eventStore: SqliteEventStore;
    try {
      fs.rmSync(filename, { force: true });
      eventStore = SqliteEventStore.create(filename);
    } catch {
      if (this.#database === undefined && previous !== undefined) {
        this.#open(previous);
      }
      return this.#status({
        errorMessage: `Die Datenbank „${filename}“ konnte nicht angelegt werden. Bitte wählen Sie einen Speicherort, an dem Sie Dateien anlegen dürfen.`,
      });
    }
    return this.#use(filename, eventStore);
  }

  // Opens the given database, or the one the user chooses.
  async openDatabase(filename?: string): Promise<DatabaseStatus> {
    const chosen =
      filename ?? (await this.#fileDialog.chooseExistingDatabase());
    return chosen === undefined ? this.#status() : this.#open(chosen);
  }

  close(): void {
    this.#database?.eventStore.close();
    this.#database?.templateStore.close();
    this.#database = undefined;
  }

  #open(filename: string): DatabaseStatus {
    if (!fs.existsSync(filename)) {
      return this.#status({
        errorMessage: `Die Datenbank „${filename}“ wurde nicht gefunden. Bitte prüfen Sie, ob das Laufwerk verbunden ist, oder wählen Sie eine andere Datenbank.`,
        retryFilename: filename,
      });
    }

    let eventStore: SqliteEventStore;
    try {
      eventStore = SqliteEventStore.open(filename);
    } catch {
      return this.#status({
        errorMessage: `Die Datei „${filename}“ ist keine Datenbank der Naturheilpraxis. Bitte wählen Sie eine andere Datei.`,
      });
    }
    return this.#use(filename, eventStore);
  }

  #use(filename: string, eventStore: SqliteEventStore): DatabaseStatus {
    this.close();
    this.#startFailure = undefined;
    const templateStore = SqliteTemplateStore.open(filename);
    const naturheilpraxis = new NaturheilpraxisService(eventStore);
    this.#database = {
      filename,
      eventStore,
      templateStore,
      naturheilpraxis,
      rechnungsdruck: new RechnungsdruckService(
        naturheilpraxis,
        templateStore,
        this.#printer,
      ),
    };
    this.#settingsStore.save({
      recentDatabases: [
        filename,
        ...this.recentDatabases.filter((recent) => recent !== filename),
      ].slice(0, maximumRecentDatabases),
    });
    this.#listeners.forEach((listener) => listener(filename));
    return this.#status();
  }

  // A database to retry only makes sense while none is open.
  #status(failure: Failure | undefined = undefined): DatabaseStatus {
    const filename = this.#database?.filename;
    return {
      ...(filename !== undefined && { filename }),
      ...(failure !== undefined && { errorMessage: failure.errorMessage }),
      ...(filename === undefined &&
        failure?.retryFilename !== undefined && {
          retryFilename: failure.retryFilename,
        }),
    };
  }
}
