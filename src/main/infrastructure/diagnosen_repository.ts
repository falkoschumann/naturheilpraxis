// Copyright (c) 2026 Falko Schumann. All rights reserved. MIT license.

import type { SQLInputValue, SQLOutputValue } from "node:sqlite";

import { Diagnose } from "../../shared/domain/diagnose";
import { mapNumber, mapString } from "./datenbank_mapper";
import { DatenbankProvider } from "./datenbank_provider";

export class DiagnosenRepository {
  static create({
    datenbankProvider,
  }: {
    datenbankProvider: DatenbankProvider;
  }) {
    return new DiagnosenRepository(datenbankProvider);
  }

  #datenbankProvider;

  private constructor(datenbankProvider: DatenbankProvider) {
    this.#datenbankProvider = datenbankProvider;
  }

  findAllByPatientennummer(nummer: number): Diagnose[] {
    const db = this.#datenbankProvider.get();
    const records = db
      .prepare(
        `
          SELECT *
            FROM diagnosen
           WHERE diagnosen.patient_id = ?
           ORDER BY diagnosen.datum DESC;
        `,
      )
      .all(nummer);
    return records.map(createDiagnose);
  }

  create(diagnose: Diagnose) {
    try {
      const db = this.#datenbankProvider.get();
      const record = createRecord(diagnose);
      const result = db
        .prepare(
          `
          INSERT INTO diagnosen (id, patient_id, datum, beschreibung)
          VALUES (:id, :patient_id, :datum, :beschreibung);
        `,
        )
        .run(record);
      return result.lastInsertRowid as number;
    } catch (error) {
      throw new Error(
        `Diagnose konnte nicht erstellt werden: ${JSON.stringify(diagnose)}.`,
        {
          cause: error,
        },
      );
    }
  }
}

function createRecord(diagnose: Diagnose): Record<string, SQLInputValue> {
  return {
    id: diagnose.id ?? null,
    patient_id: diagnose.patientId,
    datum: diagnose.datum.toString(),
    beschreibung: diagnose.beschreibung,
  };
}

function createDiagnose(record: Record<string, SQLOutputValue>) {
  return Diagnose.create({
    id: mapNumber(record, "id"),
    patientId: mapNumber(record, "patient_id")!,
    datum: mapString(record, "datum")!,
    beschreibung: mapString(record, "beschreibung")!,
  });
}
