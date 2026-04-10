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
        SELECT json
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
      INSERT INTO einstellungen (id, json)
      VALUES (1, ?)
      ON CONFLICT(id) DO UPDATE SET
        json = excluded.json;
      `,
    ).run(JSON.stringify(einstellungen));
  }
}

function mapSqlRecord(record: Record<string, SQLOutputValue>) {
  const json = JSON.parse(record["json"] as string);
  return Einstellungen.create(json);
}
