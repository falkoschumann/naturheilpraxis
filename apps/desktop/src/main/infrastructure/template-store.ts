// Copyright (c) 2026 Falko Schumann. MIT license.

import { DatabaseSync } from "node:sqlite";

// Further types like address labels may follow.
export type TemplateType = "rechnung";

export interface TemplateStore {
  // Returns the current template of the type, undefined if none is saved.
  find(type: TemplateType): string | undefined;

  // Replaces the template of the type. Only the current template is kept.
  save(type: TemplateType, content: string): void;
}

// The templates are kept in the same database file as the events, but in a
// table of their own, since they are not part of the history of the Praxis.
export class SqliteTemplateStore implements TemplateStore {
  // Opens the database file, which must be an event store already.
  static open(filename: string): SqliteTemplateStore {
    return new SqliteTemplateStore(new DatabaseSync(filename));
  }

  static createInMemory(): SqliteTemplateStore {
    return new SqliteTemplateStore(new DatabaseSync(":memory:"));
  }

  readonly #database: DatabaseSync;

  private constructor(database: DatabaseSync) {
    this.#database = database;
    this.#database.exec(`
      CREATE TABLE IF NOT EXISTS templates (
        type TEXT PRIMARY KEY,
        content TEXT NOT NULL,
        saved_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
      )
    `);
  }

  find(type: TemplateType): string | undefined {
    const row = this.#database
      .prepare("SELECT content FROM templates WHERE type = ?")
      .get(type);
    return row === undefined ? undefined : String(row["content"]);
  }

  save(type: TemplateType, content: string): void {
    this.#database
      .prepare(
        `INSERT INTO templates (type, content) VALUES (?, ?)
         ON CONFLICT (type) DO UPDATE SET
           content = excluded.content,
           saved_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now')`,
      )
      .run(type, content);
  }

  close(): void {
    this.#database.close();
  }
}
