// Copyright (c) 2026 Falko Schumann. All rights reserved. MIT license.

import { DatenbankProvider } from "./datenbank_provider";
import type { SQLInputValue } from "node:sqlite";
import { Temporal } from "@js-temporal/polyfill";
import type { Leistung } from "../../shared/domain/leistung";
import { Währung } from "../../shared/domain/waehrung";

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
