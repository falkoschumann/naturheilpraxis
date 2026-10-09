// Copyright (c) 2026 Falko Schumann. MIT license.

import { describe, expect, it } from "vitest";

import {
  initialReadModel,
  praxenErmitteln,
  praxisErmitteln,
  projectAll,
} from "./praxenansicht.ts";

describe("Praxenansicht", () => {
  it("sollte Praxen nach Kürzel sortiert ermitteln", () => {
    const readModel = projectAll(initialReadModel, [
      {
        type: "praxis-angelegt",
        data: {
          praxiskuerzel: "NHP",
          name: "Naturheilpraxis am Markt",
          anschrift: {
            strasse: "Marktplatz 1",
            postleitzahl: "12345",
            ort: "Musterstadt",
          },
          rechnungstext:
            "Bitte überweisen Sie den Betrag innerhalb von 14 Tagen.",
        },
      },
      {
        type: "praxis-angelegt",
        data: {
          praxiskuerzel: "ABC",
          name: "Heilpraxis am Bahnhof",
          anschrift: {
            strasse: "Bahnhofstraße 7",
            postleitzahl: "54321",
            ort: "Beispielstadt",
          },
          kontakt: { telefon: "0543 21", email: "bahnhof@example.com" },
        },
      },
      {
        type: "praxisdaten-geaendert",
        data: {
          praxiskuerzel: "NHP",
          name: "Naturheilpraxis am Markt",
          anschrift: {
            strasse: "Marktplatz 2",
            postleitzahl: "12345",
            ort: "Musterstadt",
          },
          rechnungstext:
            "Bitte überweisen Sie den Betrag innerhalb von 14 Tagen.",
        },
      },
    ]);

    const result = praxenErmitteln(readModel, {
      type: "praxen-ermitteln",
      parameters: {},
    });

    expect(result).toEqual([
      {
        praxiskuerzel: "ABC",
        name: "Heilpraxis am Bahnhof",
        strasse: "Bahnhofstraße 7",
        postleitzahl: "54321",
        ort: "Beispielstadt",
        telefon: "0543 21",
        email: "bahnhof@example.com",
      },
      {
        praxiskuerzel: "NHP",
        name: "Naturheilpraxis am Markt",
        strasse: "Marktplatz 2",
        postleitzahl: "12345",
        ort: "Musterstadt",
        rechnungstext:
          "Bitte überweisen Sie den Betrag innerhalb von 14 Tagen.",
      },
    ]);
  });

  it("sollte Praxis ermitteln", () => {
    const readModel = projectAll(initialReadModel, [
      {
        type: "praxis-angelegt",
        data: {
          praxiskuerzel: "NHP",
          name: "Naturheilpraxis am Markt",
          anschrift: {
            strasse: "Marktplatz 1",
            postleitzahl: "12345",
            ort: "Musterstadt",
          },
        },
      },
      {
        type: "praxis-angelegt",
        data: {
          praxiskuerzel: "ABC",
          name: "Heilpraxis am Bahnhof",
          anschrift: {
            strasse: "Bahnhofstraße 7",
            postleitzahl: "54321",
            ort: "Beispielstadt",
          },
        },
      },
    ]);

    const result = praxisErmitteln(readModel, {
      type: "praxis-ermitteln",
      parameters: { praxiskuerzel: "NHP" },
    });

    expect(result).toEqual({
      praxiskuerzel: "NHP",
      name: "Naturheilpraxis am Markt",
      anschrift: {
        strasse: "Marktplatz 1",
        postleitzahl: "12345",
        ort: "Musterstadt",
      },
    });
  });

  it("sollte keine Praxis ermitteln, wenn das Kürzel unbekannt ist", () => {
    const readModel = projectAll(initialReadModel, []);

    const result = praxisErmitteln(readModel, {
      type: "praxis-ermitteln",
      parameters: { praxiskuerzel: "XYZ" },
    });

    expect(result).toBeUndefined();
  });
});
