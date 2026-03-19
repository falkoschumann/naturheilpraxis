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
    nummer: record["nummer"] as number,
    nachname: record["nachname"] as string,
    vorname: record["vorname"] as string,
    geburtsdatum: Temporal.PlainDate.from(record["geburtsdatum"] as string),
    annahmejahr: record["annahmejahr"] as number,
    praxis: record["praxis"] as string,
    anrede: (record["anrede"] as string) || undefined,
    strasse: (record["strasse"] as string) || undefined,
    wohnort: (record["wohnort"] as string) || undefined,
    postleitzahl: (record["postleitzahl"] as string) || undefined,
    staat: (record["staat"] as string) || undefined,
    staatsangehoerigkeit:
      (record["staatsangehoerigkeit"] as string) || undefined,
    titel: (record["titel"] as string) || undefined,
    beruf: (record["beruf"] as string) || undefined,
    telefon: (record["telefon"] as string) || undefined,
    mobil: (record["mobil"] as string) || undefined,
    eMail: (record["email"] as string) || undefined,
    familienstand: (record["familienstand"] as string) || undefined,
    partner: (record["partner"] as string) || undefined,
    kinder: (record["kinder"] as string) || undefined,
    notizen: (record["notizen"] as string) || undefined,
    schluesselworte: (record["schluesselworte"] as string).split(","),
  });
}
