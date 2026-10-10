// Copyright (c) 2026 Falko Schumann. MIT license.

import type {
  DatabaseApi,
  DatabaseStatus,
} from "../../../shared/application/database-api.ts";

// Answers like the main process. Each action returns the next given status,
// the status stays unchanged without one.
export class FakeDatabaseApi implements DatabaseApi {
  #status: DatabaseStatus;
  readonly #answers: DatabaseStatus[];

  constructor({
    status = { filename: "/daten/naturheilpraxis.db" },
    answers = [],
  }: { status?: DatabaseStatus; answers?: readonly DatabaseStatus[] } = {}) {
    this.#status = status;
    this.#answers = [...answers];
  }

  getStatus(): Promise<DatabaseStatus> {
    return Promise.resolve(this.#status);
  }

  createDatabase(): Promise<DatabaseStatus> {
    return this.#answer();
  }

  openDatabase(): Promise<DatabaseStatus> {
    return this.#answer();
  }

  reopenDatabase(): Promise<DatabaseStatus> {
    return this.#answer();
  }

  #answer(): Promise<DatabaseStatus> {
    this.#status = this.#answers.shift() ?? this.#status;
    return Promise.resolve(this.#status);
  }
}
