// Copyright (c) 2026 Falko Schumann. All rights reserved. MIT license.

import fs from "node:fs";
import path from "node:path";
import sqlite from "node:sqlite";

export class DatabaseProvider {
  static create({
    dbPath = ":memory:",
    schemaPath = "resources/db/schema.sql",
  }: { dbPath?: string; schemaPath?: string } = {}) {
    return new DatabaseProvider(dbPath, schemaPath);
  }

  #database: sqlite.DatabaseSync;

  private constructor(dbPath: string, schemaPath: string) {
    this.#createParentDirectoryIfNeeded(dbPath);
    this.#database = new sqlite.DatabaseSync(dbPath);
    this.#createSchemaIfNeeded(schemaPath);
  }

  getDatabase() {
    return this.#database;
  }

  #createParentDirectoryIfNeeded(dbPath: string) {
    if (dbPath === ":memory:") {
      return;
    }

    const parentDir = path.dirname(dbPath);
    fs.mkdirSync(parentDir, { recursive: true });
  }

  #createSchemaIfNeeded(schemaPath: string) {
    const sql = fs.readFileSync(schemaPath).toString();
    this.#database.exec(sql);
  }
}
