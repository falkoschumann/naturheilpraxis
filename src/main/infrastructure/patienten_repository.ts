// Copyright (c) 2026 Falko Schumann. All rights reserved. MIT license.

import type { SQLInputValue, SQLOutputValue } from "node:sqlite";

import { Temporal } from "@js-temporal/polyfill";

import { Patient } from "../../shared/domain/patient";
import { DatabaseProvider } from "./database_provider";

export class PatientenRepository {
  static create({ databaseProvider }: { databaseProvider: DatabaseProvider }) {
    return new PatientenRepository(databaseProvider);
  }

  #databaseProvider;

  private constructor(databaseProvider: DatabaseProvider) {
    this.#databaseProvider = databaseProvider;
  }

  findAll() {
    const db = this.#databaseProvider.getDatabase();
    const records = db
      .prepare(
        `
        SELECT *
          FROM patienten
         ORDER BY nummer DESC;
        `,
      )
      .all();
    return records.map((record) => mapSqlRecord(record));
  }

  findByNummer(nummer: number) {
    const db = this.#databaseProvider.getDatabase();
    const record = db
      .prepare(
        `
        SELECT nummer, nachname, vorname, geburtsdatum, annahmejahr,
               praxis,anrede, strasse, wohnort, postleitzahl,
               staat, staatsangehoerigkeit, titel, beruf, telefon,
               mobil, email, familienstand, partner, kinder,
               notizen, schluesselworte
          FROM patienten
         WHERE nummer = ?;
        `,
      )
      .get(nummer);
    if (record == null) {
      return;
    }

    return mapSqlRecord(record);
  }

  create(patient: Omit<PatientRecord, "nummer">) {
    const record: Record<string, SQLInputValue> = {};
    for (const [key, value] of Object.entries(patient)) {
      if (key === "nummer" || value == null || typeof value === "function") {
        continue;
      }

      const columnName = key.toLowerCase();
      if (value instanceof Temporal.PlainDate) {
        record[columnName] = value.toString();
      } else if (Array.isArray(value)) {
        record[columnName] = value.join(",");
      } else {
        record[columnName] = value;
      }
    }
    const db = this.#databaseProvider.getDatabase();
    const result = db
      .prepare(
        `
        INSERT INTO patienten (nachname, vorname, geburtsdatum, annahmejahr, praxis,
                               anrede, strasse, wohnort, postleitzahl, staat,
                               staatsangehoerigkeit, titel, beruf, telefon, mobil,
                               email, familienstand, partner, kinder, notizen,
                               schluesselworte)
        VALUES (:nachname, :vorname, :geburtsdatum, :annahmejahr, :praxis,
                :anrede, :strasse, :wohnort, :postleitzahl, :staat,
                :staatsangehoerigkeit, :titel, :beruf, :telefon, :mobil,
                :email, :familienstand, :partner, :kinder, :notizen,
                :schluesselworte);
        `,
      )
      .run(record);
    return result.lastInsertRowid as number;
  }
}

export interface PatientRecord {
  readonly nummer: number;
  readonly nachname: string;
  readonly vorname: string; // TODO can be empty
  readonly geburtsdatum: Temporal.PlainDate; // TODO can be empty
  readonly annahmejahr: number;
  readonly praxis: string; // TODO can be empty
  readonly anrede?: string;
  readonly strasse?: string;
  readonly wohnort?: string;
  readonly postleitzahl?: string;
  readonly staat?: string;
  readonly staatsangehoerigkeit?: string;
  readonly titel?: string;
  readonly beruf?: string;
  readonly telefon?: string;
  readonly mobil?: string;
  readonly eMail?: string;
  readonly familienstand?: string;
  readonly partner?: string; // TODO link to patient ID
  readonly eltern?: string; // TODO link to patient ID
  readonly kinder?: string; // TODO link to patient ID
  readonly geschwister?: string; // TODO link to patient ID
  readonly notizen?: string;
  readonly schluesselworte?: string[]; // TODO should be undefined if empty
}

function mapSqlRecord(result: Record<string, SQLOutputValue>) {
  return Patient.create({
    nummer: result.nummer as number,
    nachname: result.nachname as string,
    vorname: result.vorname as string,
    geburtsdatum: Temporal.PlainDate.from(result.geburtsdatum as string),
    annahmejahr: result.annahmejahr as number,
    praxis: result.praxis as string,
    anrede: (result.anrede as string) || undefined,
    strasse: (result.strasse as string) || undefined,
    wohnort: (result.wohnort as string) || undefined,
    postleitzahl: (result.postleitzahl as string) || undefined,
    staat: (result.staat as string) || undefined,
    staatsangehoerigkeit: (result.staatsangehoerigkeit as string) || undefined,
    titel: (result.titel as string) || undefined,
    beruf: (result.beruf as string) || undefined,
    telefon: (result.telefon as string) || undefined,
    mobil: (result.mobil as string) || undefined,
    eMail: (result.email as string) || undefined,
    familienstand: (result.familienstand as string) || undefined,
    partner: (result.partner as string) || undefined,
    kinder: (result.kinder as string) || undefined,
    notizen: (result.notizen as string) || undefined,
    schluesselworte: (result.schluesselworte as string).split(","),
  });
}
