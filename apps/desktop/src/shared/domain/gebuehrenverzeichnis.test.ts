// Copyright (c) 2026 Falko Schumann. MIT license.

import { describe, expect, it } from "vitest";

import {
  consults,
  decide,
  evolveAll,
  initialState,
  type GebuehrAngelegtEvent,
} from "./gebuehrenverzeichnis.ts";

describe("Gebührenverzeichnis", () => {
  it("sollte Gebühr anlegen", () => {
    const state = evolveAll(initialState, []);

    const result = decide(state, {
      type: "gebuehr-anlegen",
      data: {
        ziffer: "1",
        bezeichnung: "Eingehende Untersuchung",
        betrag: { cents: 2050 },
      },
    });

    expect(result).toEqual({
      ok: true,
      value: [
        {
          type: "gebuehr-angelegt",
          data: {
            ziffer: "1",
            bezeichnung: "Eingehende Untersuchung",
            betrag: { cents: 2050 },
          },
        },
      ],
    });
  });

  it("sollte Gebühr ändern", () => {
    const state = evolveAll(initialState, [createGebuehrAngelegt()]);

    const result = decide(state, {
      type: "gebuehr-aendern",
      data: {
        ziffer: "1",
        bezeichnung: "Eingehende Untersuchung",
        betrag: { cents: 2300 },
      },
    });

    expect(result).toEqual({
      ok: true,
      value: [
        {
          type: "gebuehr-geaendert",
          data: {
            ziffer: "1",
            bezeichnung: "Eingehende Untersuchung",
            betrag: { cents: 2300 },
          },
        },
      ],
    });
  });

  it("sollte Gebühr entfernen", () => {
    const state = evolveAll(initialState, [createGebuehrAngelegt()]);

    const result = decide(state, {
      type: "gebuehr-entfernen",
      data: { ziffer: "1" },
    });

    expect(result).toEqual({
      ok: true,
      value: [{ type: "gebuehr-entfernt", data: { ziffer: "1" } }],
    });
  });

  it("sollte nichts ändern, wenn eine nicht vorhandene Gebühr entfernt wird", () => {
    const state = evolveAll(initialState, []);

    const result = decide(state, {
      type: "gebuehr-entfernen",
      data: { ziffer: "1" },
    });

    expect(result).toEqual({ ok: true, value: [] });
  });

  // The model leaves out rules that follow from identity, but the code must
  // keep the Ziffer unique.
  it("sollte Gebühr nicht anlegen, wenn die Ziffer bereits vergeben ist", () => {
    const state = evolveAll(initialState, [createGebuehrAngelegt()]);

    const result = decide(state, {
      type: "gebuehr-anlegen",
      data: createGebuehrAngelegt().data,
    });

    expect(result).toEqual({
      ok: false,
      error: {
        message:
          "Die Ziffer „1“ ist bereits im Gebührenverzeichnis enthalten. Bitte wählen Sie eine andere Ziffer.",
      },
    });
  });

  it("sollte Gebühr wieder anlegen, nachdem sie entfernt wurde", () => {
    const state = evolveAll(initialState, [
      createGebuehrAngelegt(),
      { type: "gebuehr-entfernt", data: { ziffer: "1" } },
    ]);

    const result = decide(state, {
      type: "gebuehr-anlegen",
      data: createGebuehrAngelegt().data,
    });

    expect(result).toEqual({ ok: true, value: [createGebuehrAngelegt()] });
  });

  it("sollte Gebühr nicht ändern, wenn sie nicht im Gebührenverzeichnis enthalten ist", () => {
    const state = evolveAll(initialState, []);

    const result = decide(state, {
      type: "gebuehr-aendern",
      data: createGebuehrAngelegt().data,
    });

    expect(result).toEqual({
      ok: false,
      error: {
        message:
          "Die Ziffer „1“ ist nicht im Gebührenverzeichnis enthalten. Bitte legen Sie die Gebühr zuerst an.",
      },
    });
  });

  it("sollte Gebühr mit negativem Betrag nicht anlegen", () => {
    const state = evolveAll(initialState, []);

    const result = decide(state, {
      type: "gebuehr-anlegen",
      data: {
        ziffer: "1",
        bezeichnung: "Eingehende Untersuchung",
        betrag: { cents: -1 },
      },
    });

    expect(result).toEqual({
      ok: false,
      error: {
        invariant: "betrag-ist-nicht-negativ",
        message:
          "Der Betrag darf nicht negativ sein. Bitte geben Sie einen Betrag ab 0,00 € an.",
      },
    });
  });

  it("sollte die Ereignisse mit der Ziffer des Befehls konsultieren", () => {
    const query = consults({
      type: "gebuehr-entfernen",
      data: { ziffer: "1" },
    });

    expect(query).toEqual([
      {
        types: ["gebuehr-angelegt", "gebuehr-geaendert", "gebuehr-entfernt"],
        tags: ["gebuehr:1"],
      },
    ]);
  });
});

function createGebuehrAngelegt(): GebuehrAngelegtEvent {
  return {
    type: "gebuehr-angelegt",
    data: {
      ziffer: "1",
      bezeichnung: "Eingehende Untersuchung",
      betrag: { cents: 2050 },
    },
  };
}
