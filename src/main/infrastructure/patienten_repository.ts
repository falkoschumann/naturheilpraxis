// Copyright (c) 2026 Falko Schumann. All rights reserved. MIT license.

import type { SQLInputValue, SQLOutputValue } from "node:sqlite";

import { Patient } from "../../shared/domain/patient";
import { DatenbankProvider } from "./datenbank_provider";

export class PatientenRepository {
  static create({
    datenbankProvider,
  }: {
    datenbankProvider: DatenbankProvider;
  }) {
    return new PatientenRepository(datenbankProvider);
  }

  #datenbankProvider;

  private constructor(datenbankProvider: DatenbankProvider) {
    this.#datenbankProvider = datenbankProvider;
  }

  findAll() {
    const db = this.#datenbankProvider.get();
    const records = db
      .prepare(
        `
        SELECT *
          FROM patienten
         ORDER BY nummer DESC;
        `,
      )
      .all();
    console.log(`Found ${records.length} records`);
    return records.map(mapSqlRecord);
  }

  findByNummer(nummer: number) {
    const db = this.#datenbankProvider.get();
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
    const db = this.#datenbankProvider.get();
    const result = db
      .prepare(
        `
          INSERT INTO patienten (nummer, nachname, vorname, geburtsdatum, annahmejahr,
                                 praxis, anrede, strasse, wohnort, postleitzahl,
                                 staat, staatsangehoerigkeit, titel, beruf, telefon,
                                 mobil, email, familienstand, partner, eltern,
                                 kinder, geschwister, notizen, schluesselworte)
          VALUES (:nummer, :nachname, :vorname, :geburtsdatum, :annahmejahr,
                  :praxis, :anrede, :straße, :wohnort, :postleitzahl,
                  :staat, :staatsangehörigkeit, :titel, :beruf, :telefon,
                  :mobil, :email, :familienstand, :partner, :eltern,
                  :kinder, :geschwister, :notizen, :schlüsselworte);
        `,
      )
      .run(record);
    return result.lastInsertRowid as number;
  }
}

function mapSqlRecord(record: Record<string, SQLOutputValue>) {
  return Patient.create({
    nummer: mapNumber(record, "nummer"),
    nachname: mapString(record, "nachname"),
    vorname: mapString(record, "vorname"),
    geburtsdatum: mapString(record, "geburtsdatum"),
    annahmejahr: mapNumber(record, "annahmejahr"),
    praxis: mapString(record, "praxis"),
    anrede: mapString(record, "anrede"),
    straße: mapString(record, "strasse"),
    wohnort: mapString(record, "wohnort"),
    postleitzahl: mapString(record, "postleitzahl"),
    staat: mapString(record, "staat"),
    staatsangehörigkeit: mapString(record, "staatsangehoerigkeit"),
    titel: mapString(record, "titel"),
    beruf: mapString(record, "beruf"),
    telefon: mapString(record, "telefon"),
    mobil: mapString(record, "mobil"),
    eMail: mapString(record, "email"),
    familienstand: mapString(record, "familienstand"),
    partner: mapString(record, "partner"),
    kinder: mapString(record, "kinder"),
    notizen: mapString(record, "notizen"),
    schlüsselworte: mapString(record, "schluesselworte")?.split(","),
  });
}

function mapNumber(
  record: Record<string, SQLOutputValue>,
  fieldName: string,
): number | undefined {
  const value = record[fieldName];
  if (value == null) {
    return;
  }

  if (typeof value !== "number") {
    console.warn(
      `Expected number but got ${typeof value} for ${fieldName} of #${record["nummer"]}:`,
      value,
    );
    return;
  }

  return value;
}

function mapString(
  record: Record<string, SQLOutputValue>,
  fieldName: string,
): string | undefined {
  const value = record[fieldName];
  if (value == null) {
    return;
  }

  if (typeof value !== "string") {
    console.warn(
      `Expected string but got ${typeof value} for ${fieldName} of #${record["nummer"]}:`,
      value,
    );
    return;
  }

  return value;
}
