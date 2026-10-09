// Copyright (c) 2026 Falko Schumann. MIT license.

import { describe, expect, it } from "vitest";

import type { Diagnose } from "./entities.ts";
import {
  consults,
  decide,
  evolveAll,
  initialState,
  type DiagnosestellungEvent,
} from "./diagnosestellung.ts";

const diagnoseId = "11111111-1111-4111-8111-111111111111";

describe("Diagnosestellung", () => {
  it("sollte Diagnose stellen", () => {
    const state = evolveAll(initialState, [praxisAngelegt(), maxAufgenommen()]);

    const result = decide(state, {
      type: "diagnose-stellen",
      data: rueckenschmerzen(),
    });

    expect(result).toEqual({
      ok: true,
      value: [{ type: "diagnose-gestellt", data: rueckenschmerzen() }],
    });
  });

  it("sollte Diagnose mit bisheriger Patientennummer ändern", () => {
    const state = evolveAll(initialState, [
      praxisAngelegt(),
      { type: "diagnose-gestellt", data: rueckenschmerzen() },
    ]);

    const result = decide(state, {
      type: "diagnose-aendern",
      data: {
        diagnoseId,
        praxiskuerzel: "NHP",
        datum: "2026-09-14",
        text: "Chronische Rückenschmerzen im Lendenwirbelbereich",
      },
    });

    expect(result).toEqual({
      ok: true,
      value: [
        {
          type: "diagnose-geaendert",
          data: {
            ...rueckenschmerzen(),
            text: "Chronische Rückenschmerzen im Lendenwirbelbereich",
          },
        },
      ],
    });
  });

  it("sollte Diagnose löschen", () => {
    const state = evolveAll(initialState, [
      { type: "diagnose-gestellt", data: rueckenschmerzen() },
    ]);

    const result = decide(state, {
      type: "diagnose-loeschen",
      data: { diagnoseId },
    });

    expect(result).toEqual({
      ok: true,
      value: [{ type: "diagnose-geloescht", data: { diagnoseId } }],
    });
  });

  it("sollte nichts ändern, wenn eine nicht vorhandene Diagnose gelöscht wird", () => {
    const state = evolveAll(initialState, []);

    const result = decide(state, {
      type: "diagnose-loeschen",
      data: { diagnoseId },
    });

    expect(result).toEqual({ ok: true, value: [] });
  });

  it("sollte Diagnose nicht in unbekannter Praxis stellen", () => {
    const state = evolveAll(initialState, [maxAufgenommen()]);

    const result = decide(state, {
      type: "diagnose-stellen",
      data: { ...rueckenschmerzen(), praxiskuerzel: "XYZ" },
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

  it("sollte Diagnose nicht für unbekannten Patienten stellen", () => {
    const state = evolveAll(initialState, [praxisAngelegt()]);

    const result = decide(state, {
      type: "diagnose-stellen",
      data: { ...rueckenschmerzen(), patientennummer: 7 },
    });

    expect(result).toEqual({
      ok: false,
      error: {
        invariant: "patient-existiert",
        message:
          "Der Patient mit der Nummer 7 ist nicht aufgenommen. Bitte wählen Sie einen aufgenommenen Patienten.",
      },
    });
  });

  // The model leaves out rules that follow from identity.
  it("sollte Diagnose nicht ändern, wenn sie nicht gestellt ist", () => {
    const state = evolveAll(initialState, [praxisAngelegt()]);

    const result = decide(state, {
      type: "diagnose-aendern",
      data: {
        diagnoseId,
        praxiskuerzel: "NHP",
        datum: "2026-09-14",
        text: "Rückenschmerzen",
      },
    });

    expect(result).toEqual({
      ok: false,
      error: {
        message:
          "Die Diagnose ist nicht vorhanden. Möglicherweise wurde sie inzwischen gelöscht.",
      },
    });
  });

  it("sollte Diagnose nicht zweimal stellen", () => {
    const state = evolveAll(initialState, [
      praxisAngelegt(),
      maxAufgenommen(),
      { type: "diagnose-gestellt", data: rueckenschmerzen() },
    ]);

    const result = decide(state, {
      type: "diagnose-stellen",
      data: rueckenschmerzen(),
    });

    expect(result).toEqual({
      ok: false,
      error: { message: "Die Diagnose ist bereits gestellt." },
    });
  });

  it("sollte Diagnose wieder stellen, nachdem sie gelöscht wurde", () => {
    const state = evolveAll(initialState, [
      praxisAngelegt(),
      maxAufgenommen(),
      { type: "diagnose-gestellt", data: rueckenschmerzen() },
      { type: "diagnose-geloescht", data: { diagnoseId } },
    ]);

    const result = decide(state, {
      type: "diagnose-stellen",
      data: rueckenschmerzen(),
    });

    expect(result).toEqual({
      ok: true,
      value: [{ type: "diagnose-gestellt", data: rueckenschmerzen() }],
    });
  });

  it("sollte beim Stellen die Diagnose, die Praxis und den Patienten konsultieren", () => {
    const query = consults({
      type: "diagnose-stellen",
      data: rueckenschmerzen(),
    });

    expect(query).toEqual([
      {
        types: [
          "diagnose-gestellt",
          "diagnose-geaendert",
          "diagnose-geloescht",
        ],
        tags: [`diagnose:${diagnoseId}`],
      },
      { types: ["praxis-angelegt"], tags: ["praxis:NHP"] },
      { types: ["patient-aufgenommen"], tags: ["patient:1"] },
    ]);
  });

  it("sollte beim Löschen nur die Diagnose konsultieren", () => {
    const query = consults({ type: "diagnose-loeschen", data: { diagnoseId } });

    expect(query).toEqual([
      {
        types: [
          "diagnose-gestellt",
          "diagnose-geaendert",
          "diagnose-geloescht",
        ],
        tags: [`diagnose:${diagnoseId}`],
      },
    ]);
  });
});

function rueckenschmerzen(): Diagnose {
  return {
    diagnoseId,
    praxiskuerzel: "NHP",
    patientennummer: 1,
    datum: "2026-09-14",
    text: "Chronische Rückenschmerzen",
  };
}

function praxisAngelegt(): DiagnosestellungEvent {
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

function maxAufgenommen(): DiagnosestellungEvent {
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
