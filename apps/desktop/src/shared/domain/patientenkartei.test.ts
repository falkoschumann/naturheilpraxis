// Copyright (c) 2026 Falko Schumann. MIT license.

import { describe, expect, it } from "vitest";

import type { Patient } from "./entities.ts";
import {
  consults,
  decide,
  evolveAll,
  initialState,
  type PatientenkarteiEvent,
} from "./patientenkartei.ts";

describe("Patientenkartei", () => {
  it("sollte Patientendaten ändern", () => {
    const state = evolveAll(initialState, [
      praxisAngelegt(),
      aufgenommen(max()),
      aufgenommen(erika()),
    ]);

    const result = decide(state, {
      type: "patientendaten-aendern",
      data: {
        ...max(),
        anschrift: {
          strasse: "Lindenweg 5",
          postleitzahl: "12345",
          ort: "Musterstadt",
        },
        partnerVon: 2,
      },
    });

    expect(result).toEqual({
      ok: true,
      value: [
        {
          type: "patientendaten-geaendert",
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
            partnerVon: 2,
          },
        },
      ],
    });
  });

  it("sollte Patient nicht in unbekannte Praxis verschieben", () => {
    const state = evolveAll(initialState, [aufgenommen(max())]);

    const result = decide(state, {
      type: "patientendaten-aendern",
      data: { ...max(), praxiskuerzel: "XYZ" },
    });

    expect(result).toEqual({
      ok: false,
      error: {
        invariant: "praxis-existiert",
        message:
          "Die Praxis „XYZ“ ist nicht angelegt. Bitte wählen Sie eine angelegte Praxis.",
      },
    });
  });

  it("sollte keinen unbekannten Angehörigen angeben", () => {
    const state = evolveAll(initialState, [
      praxisAngelegt(),
      aufgenommen(max()),
    ]);

    const result = decide(state, {
      type: "patientendaten-aendern",
      data: { ...max(), kindVon: 7 },
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

  it("sollte Patient nicht als seinen eigenen Partner angeben", () => {
    const state = evolveAll(initialState, [
      praxisAngelegt(),
      aufgenommen(max()),
    ]);

    const result = decide(state, {
      type: "patientendaten-aendern",
      data: { ...max(), partnerVon: 1 },
    });

    expect(result).toEqual({
      ok: false,
      error: {
        invariant: "patient-ist-nicht-sein-eigener-partner-oder-kind",
        message:
          "Ein Patient kann weder Partner noch Kind von sich selbst sein. Bitte wählen Sie einen anderen Patienten.",
      },
    });
  });

  // The model leaves out rules that follow from identity.
  it("sollte Patientendaten nicht ändern, wenn der Patient nicht aufgenommen ist", () => {
    const state = evolveAll(initialState, [praxisAngelegt()]);

    const result = decide(state, {
      type: "patientendaten-aendern",
      data: max(),
    });

    expect(result).toEqual({
      ok: false,
      error: {
        message:
          "Der Patient mit der Nummer 1 ist nicht aufgenommen. Bitte nehmen Sie den Patienten zuerst auf.",
      },
    });
  });

  it("sollte den Patienten, seine Angehörigen und die Praxis des Befehls konsultieren", () => {
    const query = consults({
      type: "patientendaten-aendern",
      data: { ...max(), partnerVon: 2, kindVon: 3 },
    });

    expect(query).toEqual([
      {
        types: ["patient-aufgenommen", "patientendaten-geaendert"],
        tags: ["patient:1"],
      },
      { types: ["patient-aufgenommen"], tags: ["patient:2"] },
      { types: ["patient-aufgenommen"], tags: ["patient:3"] },
      { types: ["praxis-angelegt"], tags: ["praxis:NHP"] },
    ]);
  });
});

function praxisAngelegt(): PatientenkarteiEvent {
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

function aufgenommen(patient: Patient): PatientenkarteiEvent {
  return { type: "patient-aufgenommen", data: patient };
}

function max(): Patient {
  return {
    patientennummer: 1,
    praxiskuerzel: "NHP",
    aufnahmejahr: 2026,
    geburtsdatum: "1980-09-20",
    name: { vorname: "Max", nachname: "Mustermann" },
  };
}

function erika(): Patient {
  return {
    patientennummer: 2,
    praxiskuerzel: "NHP",
    aufnahmejahr: 2026,
    geburtsdatum: "1982-03-14",
    name: { vorname: "Erika", nachname: "Mustermann" },
  };
}
