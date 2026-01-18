// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

import type { Settings } from "../../src/shared/domain/settings";
import { NdjsonEventStore } from "../../src/main/infrastructure/ndjson_event_store";
import { SettingsGateway } from "../../src/main/infrastructure/settings_gateway";

import { DatabaseProvider } from "./database_provider";
import { createEventsFromCustomers } from "./events";
import { createSettings } from "./settings";
import type { EventStore } from "../../src/main/infrastructure/event_store";
import type { CloudEventV1 } from "cloudevents";

export class Interactions {
  #legacyDatabase: DatabaseProvider;
  #settingsGateway: SettingsGateway;
  #eventStore: EventStore<CloudEventV1<unknown>>;

  constructor(
    legacyDatabaseFile: string,
    configurationFile: string,
    eventLogFile: string,
  ) {
    this.#legacyDatabase = new DatabaseProvider(legacyDatabaseFile);
    this.#settingsGateway = SettingsGateway.create({
      fileName: configurationFile,
    });
    this.#eventStore = NdjsonEventStore.create({ fileName: eventLogFile });
  }

  async createSettings() {
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

  async createEventLog(settings: Settings) {
    const customers = this.#legacyDatabase.queryCustomers();
    const events = createEventsFromCustomers(customers, settings);
    await this.#eventStore.append(events);
  }

  dispose() {
    this.#legacyDatabase.close();
  }
}
