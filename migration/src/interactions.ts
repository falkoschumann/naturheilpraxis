// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

import path from "node:path";

import { EinstellungenProvider } from "../../src/main/infrastructure/einstellungen_provider";
import { PatientenRepository } from "../../src/main/infrastructure/patienten_repository";
import { DatabaseProvider } from "../../src/main/infrastructure/database_provider";

import { LegacyDatabaseGateway } from "./legacy_database_gateway";
import { erstellePatienten } from "./patienten";
import { erstelleEinstellungen } from "./einstellungen";

export class Interactions {
  static create({
    legacyDatabasePath,
    databasePath,
  }: {
    legacyDatabasePath: string;
    databasePath: string;
  }) {
    const legacyDatabase = new LegacyDatabaseGateway(legacyDatabasePath);
    const schemaPath = path.resolve(
      import.meta.dirname,
      "../../resources/db/schema.sql",
    );
    const databaseProvider = DatabaseProvider.create({
      databasePath,
      schemaPath,
    });
    return new Interactions(legacyDatabase, databaseProvider);
  }

  #legacyDatabase: LegacyDatabaseGateway;
  #einstellungenProvider: EinstellungenProvider;
  #patientenRepository: PatientenRepository;

  private constructor(
    legacyDatabase: LegacyDatabaseGateway,
    databaseProvider: DatabaseProvider,
  ) {
    this.#legacyDatabase = legacyDatabase;
    this.#einstellungenProvider = EinstellungenProvider.create({
      databaseProvider,
    });
    this.#patientenRepository = PatientenRepository.create({
      databaseProvider,
    });
  }

  migriereDatenbank() {
    this.#migriereEinstellungen();
    this.#migrierePatienten();
  }

  #migriereEinstellungen() {
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
      this.#einstellungenProvider.sichere(einstellungen);
      console.log("  Einstellungen migriert.");
    } catch (error) {
      console.error(
        "  Migration der Einstellungen fehlgeschlagen.",
        (error as Error).message,
      );
    }
  }

  #migrierePatienten() {
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
}
