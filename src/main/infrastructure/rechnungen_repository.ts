// Copyright (c) 2026 Falko Schumann. All rights reserved. MIT license.

import type { SQLInputValue, SQLOutputValue } from "node:sqlite";

import { Rechnung } from "../../shared/domain/rechnung";
import { mapBoolean, mapNumber, mapString } from "./datenbank_mapper";
import { DatenbankProvider } from "./datenbank_provider";

export class RechnungenRepository {
  static create({
    datenbankProvider,
  }: {
    datenbankProvider: DatenbankProvider;
  }) {
    return new RechnungenRepository(datenbankProvider);
  }

  #datenbankProvider;

  private constructor(datenbankProvider: DatenbankProvider) {
    this.#datenbankProvider = datenbankProvider;
  }

  findAll(): Rechnung[] {
    const db = this.#datenbankProvider.get();
    const records = db
      .prepare(
        `
          SELECT rechnungen.*,
                 patienten.nachname,
                 patienten.vorname,
                 patienten.geburtsdatum,
                 (SELECT sum(leistungen.einzelpreis * leistungen.anzahl)
                    FROM leistungen
                   WHERE leistungen.rechnung_id = rechnungen.id
                 ) AS summe
            FROM rechnungen
                   INNER JOIN patienten ON rechnungen.patient_id = patienten.nummer
           ORDER BY rechnungen.datum DESC;
        `,
      )
      .all();
    return records.map(createRechnung);
  }

  findAllByPatientennummer(nummer: number): Rechnung[] {
    const db = this.#datenbankProvider.get();
    const records = db
      .prepare(
        `
          SELECT rechnungen.*,
                 (SELECT sum(leistungen.einzelpreis * leistungen.anzahl)
                    FROM leistungen
                   WHERE leistungen.rechnung_id = rechnungen.id
                 ) AS summe
            FROM rechnungen
           INNER JOIN patienten ON rechnungen.patient_id = patienten.nummer
           WHERE rechnungen.patient_id = ?
           ORDER BY rechnungen.datum DESC;
        `,
      )
      .all(nummer);
    return records.map(createRechnung);
  }

  create(rechnung: Rechnung) {
    // TODO handle duplicate Rechnungsnummer
    try {
      const db = this.#datenbankProvider.get();
      const record = createRecord(rechnung);
      const result = db
        .prepare(
          `
          INSERT INTO rechnungen (id, praxis, nummer, datum, patient_id,
                                  rechnungstext, kommentar, bezahlt, gutschrift)
          VALUES (:id, :praxis, :nummer, :datum, :patient_id,
                  :rechnungstext, :kommentar, :bezahlt, :gutschrift);
        `,
        )
        .run(record);
      return result.lastInsertRowid as number;
    } catch (error) {
      throw new Error(
        `Rechnung konnte nicht erstellt werden: ${JSON.stringify(rechnung)}.`,
        {
          cause: error,
        },
      );
    }
  }
}

function createRecord(rechnung: Rechnung): Record<string, SQLInputValue> {
  return {
    id: rechnung.id ?? null,
    praxis: rechnung.praxis,
    nummer: rechnung.nummer,
    datum: rechnung.datum.toString(),
    patient_id: rechnung.patientId,
    rechnungstext: rechnung.rechnungstext ?? null,
    kommentar: rechnung.kommentar ?? null,
    bezahlt: rechnung.bezahlt ? 1 : 0,
    gutschrift: rechnung.gutschrift ? 1 : 0,
  };
}

function createRechnung(record: Record<string, SQLOutputValue>) {
  return Rechnung.create({
    id: mapNumber(record, "id"),
    praxis: mapString(record, "praxis")!,
    nummer: mapString(record, "nummer"),
    datum: mapString(record, "datum")!,
    patientId: mapNumber(record, "patient_id")!,
    summe: mapNumber(record, "summe"),
    rechnungstext: mapString(record, "rechnungstext"),
    kommentar: mapString(record, "kommentar"),
    bezahlt: mapBoolean(record, "bezahlt"),
    gutschrift: mapBoolean(record, "gutschrift"),
    nachname: mapString(record, "nachname"),
    vorname: mapString(record, "vorname"),
    geburtsdatum: mapString(record, "geburtsdatum"),
  });
}
