// Copyright (c) 2026 Falko Schumann. MIT license.

import { describe, expect, it } from "vitest";

import {
  consults,
  decide,
  evolveAll,
  initialState,
  type PraxisAngelegtEvent,
  type PraxisAnlegenCommand,
  type PraxisdatenAendernCommand,
} from "./praxisverwaltung.ts";

describe("Praxisverwaltung", () => {
  it("sollte Praxis anlegen", () => {
    const state = evolveAll(initialState, []);
    const command: PraxisAnlegenCommand = {
      type: "praxis-anlegen",
      data: {
        praxiskuerzel: "NHP",
        name: "Naturheilpraxis am Markt",
        anschrift: {
          strasse: "Marktplatz 1",
          postleitzahl: "12345",
          ort: "Musterstadt",
        },
        kontakt: { telefon: "0123 456789", email: "praxis@example.com" },
        rechnungstext:
          "Bitte überweisen Sie den Betrag innerhalb von 14 Tagen.",
      },
    };

    const result = decide(state, command);

    expect(result).toEqual({
      ok: true,
      value: [
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
            kontakt: { telefon: "0123 456789", email: "praxis@example.com" },
            rechnungstext:
              "Bitte überweisen Sie den Betrag innerhalb von 14 Tagen.",
          },
        },
      ],
    });
  });

  it("sollte Praxisdaten ändern", () => {
    const state = evolveAll(initialState, [createPraxisAngelegt()]);
    const command: PraxisdatenAendernCommand = {
      type: "praxisdaten-aendern",
      data: {
        praxiskuerzel: "NHP",
        name: "Naturheilpraxis am Markt",
        anschrift: {
          strasse: "Bahnhofstraße 7",
          postleitzahl: "12345",
          ort: "Musterstadt",
        },
        kontakt: { telefon: "0123 987654" },
      },
    };

    const result = decide(state, command);

    expect(result).toEqual({
      ok: true,
      value: [
        {
          type: "praxisdaten-geaendert",
          data: {
            praxiskuerzel: "NHP",
            name: "Naturheilpraxis am Markt",
            anschrift: {
              strasse: "Bahnhofstraße 7",
              postleitzahl: "12345",
              ort: "Musterstadt",
            },
            kontakt: { telefon: "0123 987654" },
          },
        },
      ],
    });
  });

  // The model leaves out rules that follow from identity, but the code must
  // keep the Praxiskürzel unique.
  it("sollte Praxis nicht anlegen, wenn das Kürzel bereits vergeben ist", () => {
    const state = evolveAll(initialState, [createPraxisAngelegt()]);
    const command: PraxisAnlegenCommand = {
      type: "praxis-anlegen",
      data: createPraxisAngelegt().data,
    };

    const result = decide(state, command);

    expect(result).toEqual({
      ok: false,
      error: {
        message:
          "Eine Praxis mit dem Kürzel „NHP“ ist bereits angelegt. Bitte wählen Sie ein anderes Kürzel.",
      },
    });
  });

  it("sollte Praxisdaten nicht ändern, wenn die Praxis nicht angelegt ist", () => {
    const state = evolveAll(initialState, []);
    const command: PraxisdatenAendernCommand = {
      type: "praxisdaten-aendern",
      data: createPraxisAngelegt().data,
    };

    const result = decide(state, command);

    expect(result).toEqual({
      ok: false,
      error: {
        message:
          "Eine Praxis mit dem Kürzel „NHP“ ist nicht angelegt. Bitte legen Sie die Praxis zuerst an.",
      },
    });
  });

  it("sollte die Ereignisse mit dem Kürzel des Befehls konsultieren", () => {
    const command: PraxisAnlegenCommand = {
      type: "praxis-anlegen",
      data: createPraxisAngelegt().data,
    };

    const query = consults(command);

    expect(query).toEqual({
      types: ["praxis-angelegt", "praxisdaten-geaendert"],
      tags: ["praxis:NHP"],
    });
  });
});

function createPraxisAngelegt(): PraxisAngelegtEvent {
  return {
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
  };
}
