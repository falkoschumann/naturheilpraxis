// Copyright (c) 2026 Falko Schumann. MIT license.

import { describe, expect, it } from "vitest";

import {
  gebuehrenErmitteln,
  initialReadModel,
  projectAll,
} from "./gebuehrenansicht.ts";

describe("Gebührenansicht", () => {
  it("sollte Gebühren nach Ziffer natürlich sortiert ermitteln", () => {
    const readModel = projectAll(initialReadModel, [
      {
        type: "gebuehr-angelegt",
        data: {
          ziffer: "4",
          bezeichnung: "Kurze Information",
          betrag: { cents: 820 },
        },
      },
      {
        type: "gebuehr-angelegt",
        data: {
          ziffer: "20.1",
          bezeichnung: "Akupunktur",
          betrag: { cents: 1530 },
        },
      },
      {
        type: "gebuehr-angelegt",
        data: {
          ziffer: "1",
          bezeichnung: "Eingehende Untersuchung",
          betrag: { cents: 2050 },
        },
      },
      {
        type: "gebuehr-angelegt",
        data: { ziffer: "3", bezeichnung: "Beratung", betrag: { cents: 1230 } },
      },
      {
        type: "gebuehr-geaendert",
        data: {
          ziffer: "1",
          bezeichnung: "Eingehende Untersuchung",
          betrag: { cents: 2300 },
        },
      },
      { type: "gebuehr-entfernt", data: { ziffer: "3" } },
    ]);

    const result = gebuehrenErmitteln(readModel, {
      type: "gebuehren-ermitteln",
      parameters: {},
    });

    expect(result).toEqual([
      {
        ziffer: "1",
        bezeichnung: "Eingehende Untersuchung",
        betrag: { cents: 2300 },
      },
      { ziffer: "4", bezeichnung: "Kurze Information", betrag: { cents: 820 } },
      { ziffer: "20.1", bezeichnung: "Akupunktur", betrag: { cents: 1530 } },
    ]);
  });
});
