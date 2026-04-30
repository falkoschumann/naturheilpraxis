// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

import path from "node:path";

import { DatenbankProvider } from "../../src/main/infrastructure/datenbank_provider";
import { DiagnosenRepository } from "../../src/main/infrastructure/diagnosen_repository";
import { EinstellungenRepository } from "../../src/main/infrastructure/einstellungen_repository";
import { LeistungenRepository } from "../../src/main/infrastructure/leistungen_repository";
import { PatientenRepository } from "../../src/main/infrastructure/patienten_repository";
import { RechnungenRepository } from "../../src/main/infrastructure/rechnungen_repository";

import { erstelleDiagnosen } from "./diagnosen";
import { LegacyDatabaseGateway } from "./legacy_database_gateway";
import { erstelleLeistungen } from "./leistungen";
import { erstellePatienten } from "./patienten";
import { erstelleRechnungen } from "./rechnungen";
import { erstelleSchlüsselworte } from "./schlüsselworte";

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
  #einstellungenRepository: EinstellungenRepository;
  #patientenRepository: PatientenRepository;
  #leistungenRepository: LeistungenRepository;
  #rechnungenRepository: RechnungenRepository;
  #diagnoseRepository: DiagnosenRepository;

  private constructor(
    legacyDatabase: LegacyDatabaseGateway,
    datenbankProvider: DatenbankProvider,
  ) {
    this.#legacyDatabase = legacyDatabase;
    this.#einstellungenRepository = EinstellungenRepository.create({
      datenbankProvider,
    });
    this.#patientenRepository = PatientenRepository.create({
      datenbankProvider,
    });
    this.#leistungenRepository = LeistungenRepository.create({
      datenbankProvider,
    });
    this.#rechnungenRepository = RechnungenRepository.create({
      datenbankProvider,
    });
    this.#diagnoseRepository = DiagnosenRepository.create({
      datenbankProvider,
    });
  }

  migriereDatenbank() {
    this.#migrierePraxen();
    this.#migriereAnreden();
    this.#migriereFamilienstände();
    this.#migriereSchlüsselworte();
    this.#migrierePatienten();
    this.#migriereRechnungen();
    this.#migriereLeistungen();
    this.#migriereDiagnosen();
  }

  #migrierePraxen() {
    try {
      console.log("Migriere Praxen ...");
      const praxen = this.#legacyDatabase.queryAgencies();
      this.#einstellungenRepository.updatePraxen(praxen);
      console.log(`  ${praxen.length} Praxen migriert.`);
    } catch (error) {
      console.error("  Migration der Praxen fehlgeschlagen.", error);
    }
  }

  #migriereAnreden() {
    try {
      console.log("Migriere Anreden ...");
      const anreden = this.#legacyDatabase.queryTitles();
      this.#einstellungenRepository.updateAnreden(anreden);
      console.log(`  ${anreden.length} Anreden migriert.`);
    } catch (error) {
      console.error("  Migration der Anreden fehlgeschlagen.", error);
    }
  }

  #migriereFamilienstände() {
    try {
      console.log("Migriere Familienstände ...");
      const familienstände = this.#legacyDatabase.queryFamilyStatus();
      this.#einstellungenRepository.updateFamilienstände(familienstände);
      console.log(`  ${familienstände.length} Familienstände migriert.`);
    } catch (error) {
      console.error("  Migration der Familienstände fehlgeschlagen.", error);
    }
  }

  #migriereSchlüsselworte() {
    try {
      console.log("Migriere Schlüsselworte ...");
      const handling = this.#legacyDatabase.queryHandling();
      const schlüsselworte = erstelleSchlüsselworte(handling);
      this.#einstellungenRepository.updateSchlüsselworte(schlüsselworte);
      console.log(
        `  ${Object.keys(schlüsselworte).length} Schlüsselworte migriert.`,
      );
    } catch (error) {
      console.error("  Migration der Schlüsselworte fehlgeschlagen.", error);
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
      console.log(`  ${patienten.length}  Patienten migriert.`);
    } catch (error) {
      console.error("  Migration der Patienten fehlgeschlagen.", error);
    }
  }

  #migriereRechnungen() {
    try {
      console.log("Migriere Rechnungen ...");
      const invoices = this.#legacyDatabase.queryInvoices();
      const rechnungen = erstelleRechnungen(invoices);
      for (const rechnung of rechnungen) {
        this.#rechnungenRepository.create(rechnung);
      }
      console.log(`  ${rechnungen.length} Rechnungen migriert.`);
    } catch (error) {
      console.error("  Migration der Rechnungen fehlgeschlagen.", error);
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
      console.error("  Migration der Leistungen fehlgeschlagen.", error);
    }
  }

  #migriereDiagnosen() {
    try {
      console.log("Migriere Diagnosen ...");
      const diagnoses = this.#legacyDatabase.queryDiagnoses();
      const diagnosen = erstelleDiagnosen(diagnoses);
      for (const diagnose of diagnosen) {
        this.#diagnoseRepository.create(diagnose);
      }
      console.log(`  ${diagnosen.length} Diagnosen migriert.`);
    } catch (error) {
      console.error("  Migration der Diagnosen fehlgeschlagen.", error);
    }
  }
}
