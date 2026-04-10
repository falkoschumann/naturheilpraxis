// Copyright (c) 2026 Falko Schumann. All rights reserved. MIT license.

export class KalenderProvider {
  static create() {
    return new KalenderProvider(() => Temporal.Now.plainDateISO());
  }

  static createTestInstance({
    now = "2026-03-01",
  }: { now?: string | Temporal.PlainDate } = {}) {
    return new KalenderProvider(() => Temporal.PlainDate.from(now));
  }

  readonly #heute: () => Temporal.PlainDate;

  private constructor(heute: () => Temporal.PlainDate) {
    this.#heute = heute;
  }

  getDatum() {
    return this.#heute();
  }
}
