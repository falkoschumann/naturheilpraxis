// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

import path from "node:path";

import { DatenbankProvider } from "../../src/main/infrastructure/datenbank_provider";
import { EinstellungenProvider } from "../../src/main/infrastructure/einstellungen_provider";
import { LeistungenRepository } from "../../src/main/infrastructure/leistungen_repository";
import { PatientenRepository } from "../../src/main/infrastructure/patienten_repository";

import { erstelleEinstellungen } from "./einstellungen";
import { LegacyDatabaseGateway } from "./legacy_database_gateway";
import { erstelleLeistungen } from "./leistungen";
import { erstellePatienten } from "./patienten";

export class Interactions {
  static create({
    legacyDatabasePath,
    datenbankPfad,
  }: {
    legacyDatabasePath: string;
    datenbankPfad: string;
  }) {
    const legacyDatabase = new LegacyDatabaseGateway(legacyDatabasePath);
    const schemaPfad = path.resolve(
      import.meta.dirname,
      "../../resources/db/schema.sql",
    );
    const datenbankProvider = DatenbankProvider.create({
      datenbankPfad: datenbankPfad,
      schemaPfad: schemaPfad,
    });
    return new Interactions(legacyDatabase, datenbankProvider);
  }

  #legacyDatabase: LegacyDatabaseGateway;
  #einstellungenProvider: EinstellungenProvider;
  #patientenRepository: PatientenRepository;
  #leistungenRepository: LeistungenRepository;

  private constructor(
    legacyDatabase: LegacyDatabaseGateway,
    datenbankProvider: DatenbankProvider,
  ) {
    this.#legacyDatabase = legacyDatabase;
    this.#einstellungenProvider = EinstellungenProvider.create({
      datenbankProvider,
    });
    this.#patientenRepository = PatientenRepository.create({
      datenbankProvider,
    });
    this.#leistungenRepository = LeistungenRepository.create({
      datenbankProvider,
    });
  }

  migriereDatenbank() {
    this.#migriereEinstellungen();
    this.#migrierePatienten();
    this.#migriereLeistungen();
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

  #migriereLeistungen() {
    try {
      console.log("Migriere Leistungen ...");
      const activities = this.#legacyDatabase.queryActivities();
      const leistungen = erstelleLeistungen(activities);
      for (const leistung of leistungen) {
        this.#leistungenRepository.create(leistung);
      }
      console.log(`  ${leistungen.length} Leistungen migriert.`);
    } catch (error) {
      console.error(
        "  Migration der Leistungen fehlgeschlagen.",
        (error as Error).message,
      );
    }
  }
}
