// Copyright (c) 2026 Falko Schumann. All rights reserved. MIT license.

import fs from "node:fs";
import path from "node:path";
import sqlite from "node:sqlite";

export class DatenbankProvider {
  static create({
    datenbankPfad = ":memory:",
    schemaPfad = "resources/db/schema.sql",
  }: { datenbankPfad?: string; schemaPfad?: string } = {}) {
    return new DatenbankProvider(datenbankPfad, schemaPfad);
  }

  #datenbank;

  private constructor(datenbankPfad: string, schemaPfad: string) {
    this.#erzeugeVerzeichnisWennNotwendig(datenbankPfad);
    this.#datenbank = new sqlite.DatabaseSync(datenbankPfad);
    this.#erzeugeSchemaWennNotwendig(schemaPfad);
  }

  get() {
    return this.#datenbank;
  }

  #erzeugeVerzeichnisWennNotwendig(datenbankPfad: string) {
    if (datenbankPfad === ":memory:") {
      return;
    }

    const verzeichnis = path.dirname(datenbankPfad);
    fs.mkdirSync(verzeichnis, { recursive: true });
  }

  #erzeugeSchemaWennNotwendig(schemaPfad: string) {
    const sql = fs.readFileSync(schemaPfad).toString();
    this.#datenbank.exec(sql);
  }
}
