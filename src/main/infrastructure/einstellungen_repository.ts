// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

import type { SQLOutputValue } from "node:sqlite";
import { DatenbankProvider } from "./datenbank_provider";

export class EinstellungenRepository {
  static create({
    datenbankProvider,
  }: {
    datenbankProvider: DatenbankProvider;
  }) {
    return new EinstellungenRepository(datenbankProvider);
  }

  #datenbankProvider;

  constructor(datenbankProvider: DatenbankProvider) {
    this.#datenbankProvider = datenbankProvider;
  }

  findAllPraxen(): string[] {
    const db = this.#datenbankProvider.get();
    const records = db.prepare("SELECT name FROM praxen ORDER BY name;").all()!;
    return mapSqlRecords(records);
  }

  updatePraxen(praxen: string[]) {
    const db = this.#datenbankProvider.get();
    db.exec("BEGIN TRANSACTION;");
    db.exec("TRUNCATE praxen");
    const stmt = db.prepare("INSERT INTO praxen (name) VALUES (?);");
    praxen.forEach((praxis) => stmt.run(praxis));
    db.exec("COMMIT TRANSACTION;");
  }

  findAllAnreden(): string[] {
    const db = this.#datenbankProvider.get();
    const records = db
      .prepare("SELECT name FROM anreden ORDER BY name;")
      .all()!;
    return mapSqlRecords(records);
  }

  updateAnreden(anreden: string[]) {
    const db = this.#datenbankProvider.get();
    db.exec("BEGIN TRANSACTION;");
    db.exec("TRUNCATE anreden");
    const stmt = db.prepare("INSERT INTO anreden (name) VALUES (?);");
    anreden.forEach((anrede) => stmt.run(anrede));
    db.exec("COMMIT TRANSACTION;");
  }

  findAllFamilienstände(): string[] {
    const db = this.#datenbankProvider.get();
    const records = db
      .prepare("SELECT name FROM familienstände ORDER BY name;")
      .all()!;
    return mapSqlRecords(records);
  }

  updateFamilienstände(familienstände: string[]) {
    const db = this.#datenbankProvider.get();
    db.exec("BEGIN TRANSACTION;");
    db.exec("TRUNCATE familienstände");
    const stmt = db.prepare("INSERT INTO familienstände (name) VALUES (?);");
    familienstände.forEach((familienstand) => stmt.run(familienstand));
    db.exec("COMMIT TRANSACTION;");
  }

  findAllSchlüsselworte(): string[] {
    const db = this.#datenbankProvider.get();
    const records = db
      .prepare("SELECT name FROM schlüsselworte ORDER BY name;")
      .all()!;
    return mapSqlRecords(records);
  }

  findAllStandardschlüsselworte(): string[] {
    const db = this.#datenbankProvider.get();
    const records = db
      .prepare(
        "SELECT name FROM schlüsselworte WHERE standard=1 ORDER BY name;",
      )
      .all()!;
    return mapSqlRecords(records);
  }

  updateSchlüsselworte(schlüsselworte: Record<string, boolean>) {
    const db = this.#datenbankProvider.get();
    db.exec("BEGIN TRANSACTION;");
    db.exec("TRUNCATE schlüsselworte");
    const stmt = db.prepare(
      "INSERT INTO schlüsselworte (name, standard) VALUES (?, ?);",
    );
    Object.entries(schlüsselworte).forEach(([name, standard]) =>
      stmt.run(name, standard ? 1 : 0),
    );
    db.exec("COMMIT TRANSACTION;");
  }
}

function mapSqlRecords(records: Record<string, SQLOutputValue>[]) {
  return records.map((record) => record["name"] as string);
}
