// Copyright (c) 2026 Falko Schumann. MIT license.

import type {
  PrintApi,
  PrintStatus,
} from "../../../shared/application/print-api.ts";

// Answers like the main process with the given status and records the
// printed Rechnungen.
export class FakePrintApi implements PrintApi {
  readonly printed: string[] = [];
  readonly #status: PrintStatus;

  constructor({ status = { printed: true } }: { status?: PrintStatus } = {}) {
    this.#status = status;
  }

  printRechnung(rechnungId: string): Promise<PrintStatus> {
    this.printed.push(rechnungId);
    return Promise.resolve(this.#status);
  }
}
