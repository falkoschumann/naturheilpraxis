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
          SELECT *
            FROM rechnungen
           ORDER BY datum DESC, id;
        `,
      )
      .all();
    return records.map(mapSqlRecord);
  }

  findAllByPatientennummer(nummer: number): Rechnung[] {
    const db = this.#datenbankProvider.get();
    const records = db
      .prepare(
        `
          SELECT *
            FROM rechnungen
           WHERE patient_id = ?
           ORDER BY datum DESC, id;
        `,
      )
      .all(nummer);
    return records.map(mapSqlRecord);
  }

  create(rechnung: Rechnung) {
    try {
      const record: Record<string, SQLInputValue> = {};
      for (const [key, value] of Object.entries(rechnung)) {
        if (value == null || typeof value === "function") {
          continue;
        }

        const columnName = key.toLowerCase();
        if (value instanceof Temporal.PlainDate) {
          record[columnName] = value.toString();
        } else {
          record[columnName] = value;
        }
        if (typeof value === "boolean") {
          record[columnName] = value ? 1 : 0;
        }
      }
      const db = this.#datenbankProvider.get();
      const result = db
        .prepare(
          `
          INSERT INTO rechnungen (id, praxis, nummer, datum, patient_id,
                                  rechnungstext, kommentar, bezahlt, gutschrift)
          VALUES (:id, :praxis, :nummer, :datum, :patientid,
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

function mapSqlRecord(record: Record<string, SQLOutputValue>) {
  return Rechnung.create({
    id: mapNumber(record, "id"),
    praxis: mapString(record, "praxis")!,
    nummer: mapString(record, "nummer")!,
    datum: mapString(record, "datum")!,
    patientId: mapNumber(record, "patient_id")!,
    rechnungstext: mapString(record, "rechnungstext"),
    kommentar: mapString(record, "kommentar"),
    bezahlt: mapBoolean(record, "bezahlt"),
    gutschrift: mapBoolean(record, "gutschrift")!,
  });
}
