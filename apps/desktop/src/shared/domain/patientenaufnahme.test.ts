// Copyright (c) 2026 Falko Schumann. MIT license.

import { describe, expect, it } from "vitest";

import {
  consults,
  decide,
  evolveAll,
  initialState,
  type PatientenaufnahmeEvent,
} from "./patientenaufnahme.ts";

describe("Patientenaufnahme", () => {
  it("sollte dem ersten Patienten die Nummer 1 geben", () => {
    const state = evolveAll(initialState, [praxisAngelegt()]);

    const result = decide(state, {
      type: "patient-aufnehmen",
      data: {
        praxiskuerzel: "NHP",
        aufnahmejahr: 2026,
        geburtsdatum: "1980-09-20",
        name: { vorname: "Max", nachname: "Mustermann" },
        anschrift: {
          strasse: "Lindenweg 5",
          postleitzahl: "12345",
          ort: "Musterstadt",
        },
      },
    });

    expect(result).toEqual({
      ok: true,
      value: [
        {
          type: "patient-aufgenommen",
          data: {
            patientennummer: 1,
            praxiskuerzel: "NHP",
            aufnahmejahr: 2026,
            geburtsdatum: "1980-09-20",
            name: { vorname: "Max", nachname: "Mustermann" },
            anschrift: {
              strasse: "Lindenweg 5",
              postleitzahl: "12345",
              ort: "Musterstadt",
            },
          },
        },
      ],
    });
  });

  it("sollte einem weiteren Patienten die nächste Nummer geben", () => {
    const state = evolveAll(initialState, [praxisAngelegt(), maxAufgenommen()]);

    const result = decide(state, {
      type: "patient-aufnehmen",
      data: {
        praxiskuerzel: "NHP",
        aufnahmejahr: 2026,
        geburtsdatum: "1982-03-14",
        name: { vorname: "Erika", nachname: "Mustermann" },
        partnerVon: 1,
      },
    });

    expect(result).toEqual({
      ok: true,
      value: [
        {
          type: "patient-aufgenommen",
          data: {
            patientennummer: 2,
            praxiskuerzel: "NHP",
            aufnahmejahr: 2026,
            geburtsdatum: "1982-03-14",
            name: { vorname: "Erika", nachname: "Mustermann" },
            partnerVon: 1,
          },
        },
      ],
    });
  });

  it("sollte Patient nicht in unbekannter Praxis aufnehmen", () => {
    const state = evolveAll(initialState, []);

    const result = decide(state, {
      type: "patient-aufnehmen",
      data: {
        praxiskuerzel: "NHP",
        aufnahmejahr: 2026,
        geburtsdatum: "1980-09-20",
        name: { vorname: "Max", nachname: "Mustermann" },
      },
    });

    expect(result).toEqual({
      ok: false,
      error: {
        invariant: "praxis-existiert",
        message:
          "Die Praxis „NHP“ ist nicht angelegt. Bitte wählen Sie eine angelegte Praxis.",
      },
    });
  });

  it("sollte Patient nicht mit unbekanntem Angehörigen aufnehmen", () => {
    const state = evolveAll(initialState, [praxisAngelegt()]);

    const result = decide(state, {
      type: "patient-aufnehmen",
      data: {
        praxiskuerzel: "NHP",
        aufnahmejahr: 2026,
        geburtsdatum: "2010-05-01",
        name: { vorname: "Paul", nachname: "Mustermann" },
        kindVon: 7,
      },
    });

    expect(result).toEqual({
      ok: false,
      error: {
        invariant: "angehoerige-existieren",
        message:
          "Der unter „Kind von“ angegebene Patient mit der Nummer 7 ist nicht aufgenommen. Bitte wählen Sie einen aufgenommenen Patienten.",
      },
    });
  });

  it("sollte alle aufgenommenen Patienten und die Praxis des Befehls konsultieren", () => {
    const query = consults({
      type: "patient-aufnehmen",
      data: {
        praxiskuerzel: "NHP",
        aufnahmejahr: 2026,
        geburtsdatum: "1980-09-20",
        name: { vorname: "Max", nachname: "Mustermann" },
      },
    });

    expect(query).toEqual([
      { types: ["patient-aufgenommen"] },
      { types: ["praxis-angelegt"], tags: ["praxis:NHP"] },
    ]);
  });
});

function praxisAngelegt(): PatientenaufnahmeEvent {
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

function maxAufgenommen(): PatientenaufnahmeEvent {
  return {
    type: "patient-aufgenommen",
    data: {
      patientennummer: 1,
      praxiskuerzel: "NHP",
      aufnahmejahr: 2026,
      geburtsdatum: "1980-09-20",
      name: { vorname: "Max", nachname: "Mustermann" },
    },
  };
}
