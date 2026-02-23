// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

import path from "node:path";

import type { Settings } from "../../src/shared/domain/settings";
import { SettingsGateway } from "../../src/main/infrastructure/settings_gateway";
import { PatientenRepository } from "../../src/main/infrastructure/patienten_repository";
import { DatabaseProvider } from "../../src/main/infrastructure/database_provider";

import { LegacyDatabaseGateway } from "./legacy_database_gateway";
import { createPatientenFromCustomers } from "./patienten";
import { createSettings } from "./settings";

// TODO integrate migration into main process
// TODO move settings into database

export class Interactions {
  #legacyDatabase: LegacyDatabaseGateway;
  #settingsGateway: SettingsGateway;
  #patientenRepository: PatientenRepository;

  constructor(
    legacyDatabaseFile: string,
    configurationFile: string,
    dbPath: string,
  ) {
    this.#legacyDatabase = new LegacyDatabaseGateway(legacyDatabaseFile);
    this.#settingsGateway = SettingsGateway.create({
      fileName: configurationFile,
    });
    const schemaPath = path.resolve(
      import.meta.dirname,
      "../../resources/db/schema.sql",
    );
    const databaseProvider = DatabaseProvider.create({ dbPath, schemaPath });
    this.#patientenRepository = PatientenRepository.create({
      databaseProvider,
    });
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

  createDatabase(settings: Settings) {
    const customers = this.#legacyDatabase.queryCustomers();
    const patienten = createPatientenFromCustomers(customers, settings);
    for (const event of patienten) {
      this.#patientenRepository.create(event);
    }
  }

  dispose() {
    this.#legacyDatabase.close();
  }
}
