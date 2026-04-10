// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

import type { SQLOutputValue } from "node:sqlite";

import { Einstellungen } from "../../shared/domain/einstellungen";
import { DatenbankProvider } from "./datenbank_provider";

export class EinstellungenProvider {
  static create({
    datenbankProvider,
  }: {
    datenbankProvider: DatenbankProvider;
  }) {
    return new EinstellungenProvider(datenbankProvider);
  }

  #datenbankProvider;

  constructor(datenbankProvider: DatenbankProvider) {
    this.#datenbankProvider = datenbankProvider;
  }

  lade(): Einstellungen {
    const db = this.#datenbankProvider.get();
    const record = db
      .prepare(
        `
        SELECT praxen, anreden, familienstaende, schluesselworte, standard_schluesselworte
          FROM einstellungen
         WHERE id = 1;
        `,
      )
      .get()!;
    return mapSqlRecord(record);
  }

  sichere(einstellungen: Einstellungen) {
    const db = this.#datenbankProvider.get();
    db.prepare(
      `
      INSERT INTO einstellungen (id, praxen, anreden, familienstaende, schluesselworte, standard_schluesselworte)
      VALUES (1, ?, ?, ?, ?, ?)
      ON CONFLICT(id) DO UPDATE SET
        praxen = excluded.praxen,
        anreden = excluded.anreden,
        familienstaende = excluded.familienstaende,
        schluesselworte = excluded.schluesselworte,
        standard_schluesselworte = excluded.standard_schluesselworte;
      `,
    ).run(
      JSON.stringify(einstellungen.praxen),
      JSON.stringify(einstellungen.anreden),
      JSON.stringify(einstellungen.familienstände),
      JSON.stringify(einstellungen.schlüsselworte),
      JSON.stringify(einstellungen.standardSchlüsselworte),
    );
  }
}

function mapSqlRecord(record: Record<string, SQLOutputValue>) {
  return Einstellungen.create({
    praxen: JSON.parse(record["praxen"] as string),
    anreden: JSON.parse(record["anreden"] as string),
    familienstände: JSON.parse(record["familienstaende"] as string),
    schlüsselworte: JSON.parse(record["schluesselworte"] as string),
    standardSchlüsselworte: JSON.parse(
      record["standard_schluesselworte"] as string,
    ),
  });
}
