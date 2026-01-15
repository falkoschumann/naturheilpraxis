// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

import type { Settings } from "../../src/shared/domain/settings";
import { SettingsGateway } from "../../src/main/infrastructure/settings_gateway";
import { EventStore } from "../../src/main/infrastructure/event_store";

import { DatabaseProvider } from "./database_provider";
import { createSettings } from "./settings";
import { erzeugeEventsFuerPatienten } from "./events";

export class Interactions {
  #legacyDatabase: DatabaseProvider;
  #settingsGateway: SettingsGateway;
  #eventStore: EventStore;

  constructor(
    legacyDatabaseFile: string,
    configurationFile: string,
    eventLogFile: string,
  ) {
    this.#legacyDatabase = new DatabaseProvider(legacyDatabaseFile);
    this.#settingsGateway = SettingsGateway.create({
      fileName: configurationFile,
    });
    this.#eventStore = EventStore.create({ fileName: eventLogFile });
  }

  async createSettings(): Promise<Settings> {
    let agencies;
    let titles;
    let familyStatus;
    let handling;
    let standardHandling;
    try {
      agencies = this.#legacyDatabase.queryAgencies();
      titles = this.#legacyDatabase.queryTitles();
      familyStatus = this.#legacyDatabase.queryFamilyStatus();
      handling = this.#legacyDatabase.queryHandling();
      standardHandling = this.#legacyDatabase.queryStandardHandling();
      const settings = createSettings({
        agencies,
        titles,
        familyStatus,
        handling,
        standardHandling,
      });
      await this.#settingsGateway.store(settings);
      return settings;
    } catch (error) {
      console.error(
        "Migration of settings failed.",
        {
          agencies,
          titles,
          familyStatus,
          handling,
          standardHandling,
        },
        error,
      );
      throw Error("Migration of settings failed.", { cause: error });
    }
  }

  async erstelleEventLog(settings: Settings): Promise<void> {
    const customers = this.#legacyDatabase.queryCustomers();
    const events = erzeugeEventsFuerPatienten(customers, settings);
    for (const event of events) {
      await this.#eventStore.record(event);
    }
  }

  dispose() {
    this.#legacyDatabase.close();
  }
}
