// Copyright (c) 2026 Falko Schumann. MIT license.

import { DatabaseSync, type SQLOutputValue } from "node:sqlite";

import {
  tagsOf,
  type DomainEvent,
  type EventQuery,
} from "../../shared/domain/events.ts";

export interface EventStore {
  // Returns the events in the order they were appended, all of them without a
  // query.
  query(query?: EventQuery): DomainEvent[];

  // Appends the events atomically.
  append(events: readonly DomainEvent[]): void;
}

// The database is accessed synchronously. Since the main process handles one
// message after another, no other command can append events between the query
// of a consistency boundary and the append of its decision.
export class SqliteEventStore implements EventStore {
  static create(filename: string): SqliteEventStore {
    return new SqliteEventStore(new DatabaseSync(filename));
  }

  static createInMemory(): SqliteEventStore {
    return new SqliteEventStore(new DatabaseSync(":memory:"));
  }

  readonly #database: DatabaseSync;

  private constructor(database: DatabaseSync) {
    this.#database = database;
    this.#database.exec(`
      CREATE TABLE IF NOT EXISTS events (
        position INTEGER PRIMARY KEY AUTOINCREMENT,
        type TEXT NOT NULL,
        data TEXT NOT NULL,
        tags TEXT NOT NULL,
        recorded_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
      )
    `);
  }

  query(query?: EventQuery): DomainEvent[] {
    let rows: Record<string, SQLOutputValue>[];
    if (query === undefined) {
      rows = this.#database
        .prepare("SELECT type, data FROM events ORDER BY position")
        .all();
    } else if (query.length === 0) {
      rows = [];
    } else {
      // An event matches an item if it has one of the types and no tag of the
      // item is missing in the tags of the event.
      const condition = query
        .map(
          () => `(
            type IN (SELECT value FROM json_each(?))
            AND NOT EXISTS (
              SELECT 1 FROM json_each(?) AS wanted
              WHERE wanted.value NOT IN (SELECT value FROM json_each(events.tags))
            )
          )`,
        )
        .join(" OR ");
      const parameters = query.flatMap((item) => [
        JSON.stringify(item.types),
        JSON.stringify(item.tags ?? []),
      ]);
      rows = this.#database
        .prepare(
          `SELECT type, data FROM events WHERE ${condition} ORDER BY position`,
        )
        .all(...parameters);
    }
    return rows.map(
      (row) =>
        ({
          type: row["type"],
          data: JSON.parse(String(row["data"])) as unknown,
        }) as DomainEvent,
    );
  }

  append(events: readonly DomainEvent[]): void {
    const insert = this.#database.prepare(
      "INSERT INTO events (type, data, tags) VALUES (?, ?, ?)",
    );
    this.#database.exec("BEGIN");
    try {
      for (const event of events) {
        insert.run(
          event.type,
          JSON.stringify(event.data),
          JSON.stringify(tagsOf(event)),
        );
      }
      this.#database.exec("COMMIT");
    } catch (error) {
      this.#database.exec("ROLLBACK");
      throw error;
    }
  }

  close(): void {
    this.#database.close();
  }
}
