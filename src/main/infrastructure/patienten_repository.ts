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
    return records.map(mapSqlRecord);
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

  create(patient: Patient) {
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
          INSERT INTO patienten (nummer, nachname, vorname, geburtsdatum, annahmejahr,
                                 praxis, anrede, strasse, wohnort, postleitzahl,
                                 staat, staatsangehoerigkeit, titel, beruf, telefon,
                                 mobil, email, familienstand, partner, eltern,
                                 kinder, geschwister, notizen, schluesselworte)
          VALUES (:nummer, :nachname, :vorname, :geburtsdatum, :annahmejahr,
                  :praxis, :anrede, :strasse, :wohnort, :postleitzahl,
                  :staat, :staatsangehoerigkeit, :titel, :beruf, :telefon,
                  :mobil, :email, :familienstand, :partner, :eltern,
                  :kinder, :geschwister, :notizen, :schluesselworte);
        `,
      )
      .run(record);
    return result.lastInsertRowid as number;
  }
}

function mapSqlRecord(record: Record<string, SQLOutputValue>) {
  return Patient.create({
    nummer: mapNumber(record["nummer"]),
    nachname: mapString(record["nachname"]),
    vorname: mapString(record["vorname"]),
    geburtsdatum: mapString(record["geburtsdatum"]),
    annahmejahr: mapNumber(record["annahmejahr"]),
    praxis: mapString(record["praxis"]),
    anrede: mapString(record["anrede"]),
    strasse: mapString(record["strasse"]),
    wohnort: mapString(record["wohnort"]),
    postleitzahl: mapString(record["postleitzahl"]),
    staat: mapString(record["staat"]),
    staatsangehoerigkeit: mapString(record["staatsangehoerigkeit"]),
    titel: mapString(record["titel"]),
    beruf: mapString(record["beruf"]),
    telefon: mapString(record["telefon"]),
    mobil: mapString(record["mobil"]),
    eMail: mapString(record["email"]),
    familienstand: mapString(record["familienstand"]),
    partner: mapString(record["partner"]),
    kinder: mapString(record["kinder"]),
    notizen: mapString(record["notizen"]),
    schluesselworte: mapString(record["schluesselworte"])?.split(","),
  });
}

function mapNumber(value?: SQLOutputValue): number | undefined {
  if (value == null) {
    return;
  }

  if (typeof value !== "number") {
    console.warn(`Expected number but got ${typeof value}:`, value);
    return;
  }

  return value;
}

function mapString(value?: SQLOutputValue): string | undefined {
  if (value == null) {
    return;
  }

  if (typeof value !== "string") {
    console.warn(`Expected string but got ${typeof value}:`, value);
    return;
  }

  return value;
}
