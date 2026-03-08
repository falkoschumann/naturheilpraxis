// Copyright (c) 2026 Falko Schumann. All rights reserved. MIT license.

import { Temporal } from "@js-temporal/polyfill";

export class UhrProvider {
  static create() {
    return new UhrProvider(() => Temporal.Now.plainDateTimeISO());
  }

  static createTestInstance({
    now = "2026-03-01T13:30:00",
  }: { now?: string | Temporal.PlainDateTime } = {}) {
    return new UhrProvider(() => Temporal.PlainDateTime.from(now));
  }

  #now: () => Temporal.PlainDateTime;

  private constructor(now: () => Temporal.PlainDateTime) {
    this.#now = now;
  }

  getDatum() {
    return this.#now().toPlainDate();
  }

  getZeit() {
    return this.#now().toPlainTime();
  }
}
