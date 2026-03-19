// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

import path from "node:path";

import { EinstellungenGateway } from "../../src/main/infrastructure/einstellungen_gateway";
import { PatientenRepository } from "../../src/main/infrastructure/patienten_repository";
import { DatabaseProvider } from "../../src/main/infrastructure/database_provider";

import { LegacyDatabaseGateway } from "./legacy_database_gateway";
import { erstellePatienten } from "./patienten";
import { erstelleEinstellungen } from "./einstellungen.ts";

// TODO integrate migration into main process
// TODO move settings into database

export class Interactions {
  #legacyDatabase: LegacyDatabaseGateway;
  #einstellungenGateway: EinstellungenGateway;
  #patientenRepository: PatientenRepository;

  constructor(legacyDatabaseFile: string, databasePath: string) {
    this.#legacyDatabase = new LegacyDatabaseGateway(legacyDatabaseFile);
    const schemaPath = path.resolve(
      import.meta.dirname,
      "../../resources/db/schema.sql",
    );
    const databaseProvider = DatabaseProvider.create({
      databasePath,
      schemaPath,
    });
    this.#einstellungenGateway = EinstellungenGateway.create({
      databaseProvider,
    });
    this.#patientenRepository = PatientenRepository.create({
      databaseProvider,
    });
  }

  migriereEinstellungen() {
    try {
      console.log("Migriere Einstellungen ...");
      const agencies = this.#legacyDatabase.queryAgencies();
      const titles = this.#legacyDatabase.queryTitles();
      const familyStatus = this.#legacyDatabase.queryFamilyStatus();
      const handling = this.#legacyDatabase.queryHandling();
      const standardHandling = this.#legacyDatabase.queryStandardHandling();
      const einstellungen = erstelleEinstellungen({
        agencies,
        titles,
        familyStatus,
        handling,
        standardHandling,
      });
      this.#einstellungenGateway.sichere(einstellungen);
      console.log("  Einstellungen migriert.");
    } catch (error) {
      console.error(
        "  Migration der Einstellungen fehlgeschlagen.",
        (error as Error).message,
      );
    }
  }

  migrierePatienten() {
    try {
      console.log("Migriere Patienten ...");
      const customers = this.#legacyDatabase.queryCustomers();
      const patienten = erstellePatienten(customers);
      for (const patient of patienten) {
        this.#patientenRepository.create(patient);
      }
      console.log(`  ${patienten.length} Patienten migriert.`);
    } catch (error) {
      console.error(
        "  Migration der Patienten fehlgeschlagen.",
        (error as Error).message,
      );
    }
  }

  dispose() {
    this.#legacyDatabase.close();
  }
}
