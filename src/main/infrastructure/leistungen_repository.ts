// Copyright (c) 2026 Falko Schumann. All rights reserved. MIT license.

import type { SQLInputValue, SQLOutputValue } from "node:sqlite";

import { Leistung } from "../../shared/domain/leistung";
import { Währung } from "../../shared/domain/waehrung";
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
          SELECT *
            FROM leistungen
           WHERE patient_id = ?
           ORDER BY datum, id;
        `,
      )
      .all(nummer);
    return records.map(mapSqlRecord);
  }

  create(leistung: Leistung) {
    const record: Record<string, SQLInputValue> = {};
    for (const [key, value] of Object.entries(leistung)) {
      if (key === "id" || value == null || typeof value === "function") {
        continue;
      }

      const columnName = key.toLowerCase();
      if (value instanceof Temporal.PlainDate) {
        record[columnName] = value.toString();
      } else if (value instanceof Währung) {
        record[columnName] = value.cents;
      } else {
        record[columnName] = value;
      }
    }
    const db = this.#datenbankProvider.get();
    const result = db
      .prepare(
        `
          INSERT INTO leistungen (id, praxis, patient_id, rechnung_id, datum,
                                 gebuehrenziffer, beschreibung, kommentar, einzelpreis, anzahl)
          VALUES (:id, :praxis, :patientid, :rechnungid, :datum,
                  :gebührenziffer, :beschreibung, :kommentar, :einzelpreis, :anzahl);
        `,
      )
      .run(record);
    return result.lastInsertRowid as number;
  }
}

function mapSqlRecord(record: Record<string, SQLOutputValue>) {
  return Leistung.create({
    id: mapNumber(record, "id"),
    praxis: mapString(record, "praxis")!,
    patientId: mapNumber(record, "patient_id")!,
    rechnungId: mapNumber(record, "rechnung_id"),
    datum: mapString(record, "datum")!,
    gebührenziffer: mapString(record, "gebuehrenziffer")!,
    beschreibung: mapString(record, "beschreibung")!,
    kommentar: mapString(record, "kommentar"),
    einzelpreis: mapNumber(record, "einzelpreis")!,
    anzahl: mapNumber(record, "anzahl")!,
  });
}
