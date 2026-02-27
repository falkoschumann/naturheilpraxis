// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

import { Einstellungen } from "../../shared/domain/einstellungen";
import type { DatabaseProvider } from "./database_provider";

export class EinstellungenGateway {
  static create({ databaseProvider }: { databaseProvider: DatabaseProvider }) {
    return new EinstellungenGateway(databaseProvider);
  }

  #databaseProvider;

  constructor(databaseProvider: DatabaseProvider) {
    this.#databaseProvider = databaseProvider;
  }

  lade(): Einstellungen {
    const db = this.#databaseProvider.getDatabase();
    const record = db
      .prepare(
        `
        SELECT praxen, anreden, familienstaende, schluesselworte, standard_schluesselworte
          FROM einstellungen
         WHERE id = 1;
        `,
      )
      .get()!;
    return Einstellungen.create({
      praxen: JSON.parse(record.praxen as string),
      anreden: JSON.parse(record.anreden as string),
      familienstaende: JSON.parse(record.familienstaende as string),
      schluesselworte: JSON.parse(record.schluesselworte as string),
      standardSchluesselworte: JSON.parse(
        record.standard_schluesselworte as string,
      ),
    });
  }

  sichere(einstellungen: Einstellungen) {
    const db = this.#databaseProvider.getDatabase();
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
      JSON.stringify(einstellungen.familienstaende),
      JSON.stringify(einstellungen.schluesselworte),
      JSON.stringify(einstellungen.standardSchluesselworte),
    );
  }
}
