// Copyright (c) 2026 Falko Schumann. MIT license.

import { DatabaseSync } from "node:sqlite";

// Further types like address labels may follow.
export type TemplateType = "rechnung";

// A template applies to all Praxen or to the Praxis with the Praxiskürzel.
export type TemplateScope = Readonly<{ praxiskuerzel?: string }>;

export interface TemplateStore {
  // Returns the current template of the type and scope, undefined if none is
  // saved.
  find(type: TemplateType, scope?: TemplateScope): string | undefined;

  // Lists the scopes with a saved template of the type.
  scopes(type: TemplateType): TemplateScope[];

  // Replaces the template of the type and scope. Only the current template is
  // kept.
  save(type: TemplateType, content: string, scope?: TemplateScope): void;

  // Removes the template of the type and scope, if any.
  remove(type: TemplateType, scope?: TemplateScope): void;
}

// The template for all Praxen has an empty Praxiskürzel, since SQLite does not
// treat NULL as equal in a primary key.
const allPraxen = "";

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
    this.#migrate();
    this.#database.exec(`
      CREATE TABLE IF NOT EXISTS templates (
        type TEXT NOT NULL,
        praxiskuerzel TEXT NOT NULL DEFAULT '',
        content TEXT NOT NULL,
        saved_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
        PRIMARY KEY (type, praxiskuerzel)
      )
    `);
  }

  find(type: TemplateType, scope: TemplateScope = {}): string | undefined {
    const row = this.#database
      .prepare(
        "SELECT content FROM templates WHERE type = ? AND praxiskuerzel = ?",
      )
      .get(type, scope.praxiskuerzel ?? allPraxen);
    return row === undefined ? undefined : String(row["content"]);
  }

  scopes(type: TemplateType): TemplateScope[] {
    return this.#database
      .prepare(
        "SELECT praxiskuerzel FROM templates WHERE type = ? ORDER BY praxiskuerzel",
      )
      .all(type)
      .map((row) => {
        const praxiskuerzel = String(row["praxiskuerzel"]);
        return praxiskuerzel === allPraxen ? {} : { praxiskuerzel };
      });
  }

  save(type: TemplateType, content: string, scope: TemplateScope = {}): void {
    this.#database
      .prepare(
        `INSERT INTO templates (type, praxiskuerzel, content) VALUES (?, ?, ?)
         ON CONFLICT (type, praxiskuerzel) DO UPDATE SET
           content = excluded.content,
           saved_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now')`,
      )
      .run(type, scope.praxiskuerzel ?? allPraxen, content);
  }

  remove(type: TemplateType, scope: TemplateScope = {}): void {
    this.#database
      .prepare("DELETE FROM templates WHERE type = ? AND praxiskuerzel = ?")
      .run(type, scope.praxiskuerzel ?? allPraxen);
  }

  close(): void {
    this.#database.close();
  }

  // The first version had one template per type, for all Praxen.
  #migrate(): void {
    const columns = this.#database
      .prepare("SELECT name FROM pragma_table_info('templates')")
      .all()
      .map((row) => String(row["name"]));
    if (columns.length === 0 || columns.includes("praxiskuerzel")) {
      return;
    }

    this.#database.exec("BEGIN");
    try {
      this.#database.exec(`
        ALTER TABLE templates RENAME TO templates_v1;
        CREATE TABLE templates (
          type TEXT NOT NULL,
          praxiskuerzel TEXT NOT NULL DEFAULT '',
          content TEXT NOT NULL,
          saved_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
          PRIMARY KEY (type, praxiskuerzel)
        );
        INSERT INTO templates (type, content, saved_at)
          SELECT type, content, saved_at FROM templates_v1;
        DROP TABLE templates_v1;
      `);
      this.#database.exec("COMMIT");
    } catch (error) {
      this.#database.exec("ROLLBACK");
      throw error;
    }
  }
}
