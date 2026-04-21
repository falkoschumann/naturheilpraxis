// Copyright (c) 2026 Falko Schumann. All rights reserved. MIT license.

import type { SQLInputValue, SQLOutputValue } from "node:sqlite";

import { Patient } from "../../shared/domain/patient";
import { mapNumber, mapString } from "./datenbank_mapper";
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
    return records.map(createPatient);
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

    return createPatient(record);
  }

  create(patient: Patient) {
    try {
      const db = this.#datenbankProvider.get();
      const record = createRecord(patient);
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
    } catch (error) {
      throw new Error(
        `Patient konnte nicht erstellt werden: ${JSON.stringify(patient)}.`,
        {
          cause: error,
        },
      );
    }
  }
}

function createRecord(patient: Patient): Record<string, SQLInputValue> {
  return {
    nummer: patient.nummer ?? null,
    nachname: patient.nachname ?? null,
    vorname: patient.vorname ?? null,
    geburtsdatum: patient.geburtsdatum?.toString() ?? null,
    annahmejahr: patient.annahmejahr ?? null,
    praxis: patient.praxis ?? null,
    anrede: patient.anrede ?? null,
    strasse: patient.straße ?? null,
    wohnort: patient.wohnort ?? null,
    postleitzahl: patient.postleitzahl ?? null,
    staat: patient.staat ?? null,
    staatsangehoerigkeit: patient.staatsangehörigkeit ?? null,
    titel: patient.titel ?? null,
    beruf: patient.beruf ?? null,
    telefon: patient.telefon ?? null,
    mobil: patient.mobil ?? null,
    email: patient.eMail ?? null,
    familienstand: patient.familienstand ?? null,
    partner: patient.partner ?? null,
    kinder: patient.kinder ?? null,
    notizen: patient.notizen ?? null,
    schluesselworte: patient.schlüsselworte?.join(",") ?? null,
  };
}

function createPatient(record: Record<string, SQLOutputValue>) {
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
