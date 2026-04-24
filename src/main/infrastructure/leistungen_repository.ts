// Copyright (c) 2026 Falko Schumann. All rights reserved. MIT license.

import type { SQLInputValue, SQLOutputValue } from "node:sqlite";

import { Leistung } from "../../shared/domain/leistung";
import { mapNumber, mapString } from "./datenbank_mapper";
import { DatenbankProvider } from "./datenbank_provider";

export class LeistungenRepository {
  static create({
    datenbankProvider,
  }: {
    datenbankProvider: DatenbankProvider;
  }) {
    return new LeistungenRepository(datenbankProvider);
  }

  #datenbankProvider;

  private constructor(datenbankProvider: DatenbankProvider) {
    this.#datenbankProvider = datenbankProvider;
  }

  findAllByPatientennummer(nummer: number): Leistung[] {
    const db = this.#datenbankProvider.get();
    const records = db
      .prepare(
        `
          SELECT leistungen.*,
                 leistungen.einzelpreis * leistungen.anzahl AS summe,
                 rechnungen.nummer AS rechnungsnummer
            FROM leistungen
            LEFT JOIN rechnungen ON leistungen.rechnung_id = rechnungen.id
           WHERE leistungen.patient_id = ?
           ORDER BY leistungen.datum DESC;
        `,
      )
      .all(nummer);
    return records.map(createLeistung);
  }

  create(leistung: Leistung) {
    try {
      const db = this.#datenbankProvider.get();
      const record = createRecord(leistung);
      const result = db
        .prepare(
          `
          INSERT INTO leistungen (id, praxis, patient_id, rechnung_id, datum,
                                 gebuehrenziffer, beschreibung, kommentar, einzelpreis, anzahl)
          VALUES (:id, :praxis, :patient_id, :rechnung_id, :datum,
                  :gebuehrenziffer, :beschreibung, :kommentar, :einzelpreis, :anzahl);
        `,
        )
        .run(record);
      return result.lastInsertRowid as number;
    } catch (error) {
      throw new Error(
        `Leistung konnte nicht erstellt werden: ${JSON.stringify(leistung)}.`,
        {
          cause: error,
        },
      );
    }
  }
}

function createRecord(leistung: Leistung): Record<string, SQLInputValue> {
  return {
    id: leistung.id ?? null,
    praxis: leistung.praxis,
    patient_id: leistung.patientId,
    rechnung_id: leistung.rechnungId ?? null,
    datum: leistung.datum.toString(),
    gebuehrenziffer: leistung.gebührenziffer,
    beschreibung: leistung.beschreibung,
    kommentar: leistung.kommentar ?? null,
    einzelpreis: leistung.einzelpreis.cents,
    anzahl: leistung.anzahl,
  };
}

function createLeistung(record: Record<string, SQLOutputValue>) {
  return Leistung.create({
    id: mapNumber(record, "id"),
    praxis: mapString(record, "praxis")!,
    patientId: mapNumber(record, "patient_id")!,
    rechnungId: mapNumber(record, "rechnung_id"),
    rechnungsnummer: mapString(record, "rechnungsnummer"),
    datum: mapString(record, "datum")!,
    gebührenziffer: mapString(record, "gebuehrenziffer")!,
    beschreibung: mapString(record, "beschreibung")!,
    kommentar: mapString(record, "kommentar"),
    einzelpreis: mapNumber(record, "einzelpreis")!,
    anzahl: mapNumber(record, "anzahl")!,
    summe: mapNumber(record, "summe")!,
  });
}
