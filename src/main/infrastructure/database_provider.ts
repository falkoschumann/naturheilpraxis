// Copyright (c) 2026 Falko Schumann. All rights reserved. MIT license.

import fs from "node:fs";
import path from "node:path";
import sqlite from "node:sqlite";

export class DatabaseProvider {
  static create({
    databasePath = ":memory:",
    schemaPath = "resources/db/schema.sql",
  }: { databasePath?: string; schemaPath?: string } = {}) {
    return new DatabaseProvider(databasePath, schemaPath);
  }

  #database;

  private constructor(databasePath: string, schemaPath: string) {
    this.#createParentDirectoryIfNeeded(databasePath);
    this.#database = new sqlite.DatabaseSync(databasePath);
    this.#createSchemaIfNeeded(schemaPath);
  }

  getDatabase() {
    return this.#database;
  }

  #createParentDirectoryIfNeeded(databasePath: string) {
    if (databasePath === ":memory:") {
      return;
    }

    const parentDir = path.dirname(databasePath);
    fs.mkdirSync(parentDir, { recursive: true });
  }

  #createSchemaIfNeeded(schemaPath: string) {
    const sql = fs.readFileSync(schemaPath).toString();
    this.#database.exec(sql);
  }
}
