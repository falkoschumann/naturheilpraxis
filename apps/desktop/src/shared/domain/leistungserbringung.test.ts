// Copyright (c) 2026 Falko Schumann. MIT license.

import { describe, expect, it } from "vitest";

import type { Leistung } from "./entities.ts";
import {
  consults,
  decide,
  evolveAll,
  initialState,
  type LeistungserbringungEvent,
} from "./leistungserbringung.ts";

const leistungId = "22222222-2222-4222-8222-222222222222";
const rechnungId = "33333333-3333-4333-8333-333333333333";

describe("Leistungserbringung", () => {
  it("sollte Leistung erbringen", () => {
    const state = evolveAll(initialState, [praxisAngelegt(), maxAufgenommen()]);

    const result = decide(state, {
      type: "leistung-erbringen",
      data: untersuchung(),
    });

    expect(result).toEqual({
      ok: true,
      value: [{ type: "leistung-erbracht", data: untersuchung() }],
    });
  });

  it("sollte Leistung im Entwurf mit bisheriger Patientennummer ändern", () => {
    const state = evolveAll(initialState, [
      praxisAngelegt(),
      erbracht(),
      rechnungErstellt(),
    ]);

    const result = decide(state, {
      type: "leistung-aendern",
      data: aenderung({ anzahl: 2 }),
    });

    expect(result).toEqual({
      ok: true,
      value: [
        { type: "leistung-geaendert", data: { ...untersuchung(), anzahl: 2 } },
      ],
    });
  });

  it("sollte Leistung einer versendeten Rechnung nicht ändern", () => {
    const state = evolveAll(initialState, [
      praxisAngelegt(),
      erbracht(),
      rechnungErstellt(),
      rechnungVersendet(),
    ]);

    const result = decide(state, {
      type: "leistung-aendern",
      data: aenderung({ anzahl: 2 }),
    });

    expect(result).toEqual({
      ok: false,
      error: {
        invariant: "nur-im-entwurf-aendern",
        message:
          "Die Leistung ist in einer versendeten oder bezahlten Rechnung enthalten und kann nicht mehr geändert werden.",
      },
    });
  });

  it("sollte Leistung wieder ändern, nachdem der Versand zurückgenommen wurde", () => {
    const state = evolveAll(initialState, [
      praxisAngelegt(),
      erbracht(),
      rechnungErstellt(),
      rechnungVersendet(),
      {
        type: "rechnungsversand-zurueckgenommen",
        data: {
          rechnungId,
          patientennummer: 1,
          rechnungsnummer: "1/260920",
          datum: "2026-09-20",
        },
      },
    ]);

    const result = decide(state, {
      type: "leistung-aendern",
      data: aenderung({ anzahl: 2 }),
    });

    expect(result.ok).toBe(true);
  });

  it("sollte Leistung nicht in unbekannte Praxis verschieben", () => {
    const state = evolveAll(initialState, [erbracht()]);

    const result = decide(state, {
      type: "leistung-aendern",
      data: aenderung({ praxiskuerzel: "XYZ" }),
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

  it("sollte Leistung nicht für unbekannten Patienten erbringen", () => {
    const state = evolveAll(initialState, [praxisAngelegt()]);

    const result = decide(state, {
      type: "leistung-erbringen",
      data: { ...untersuchung(), patientennummer: 7 },
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

  it("sollte Leistung löschen", () => {
    const state = evolveAll(initialState, [erbracht()]);

    const result = decide(state, {
      type: "leistung-loeschen",
      data: { leistungId },
    });

    expect(result).toEqual({
      ok: true,
      value: [{ type: "leistung-geloescht", data: { leistungId } }],
    });
  });

  it("sollte Leistung löschen, nachdem der Entwurf gelöscht wurde", () => {
    const state = evolveAll(initialState, [
      erbracht(),
      rechnungErstellt(),
      { type: "entwurf-geloescht", data: { rechnungId } },
    ]);

    const result = decide(state, {
      type: "leistung-loeschen",
      data: { leistungId },
    });

    expect(result).toEqual({
      ok: true,
      value: [{ type: "leistung-geloescht", data: { leistungId } }],
    });
  });

  it("sollte Leistung eines Entwurfs nicht löschen", () => {
    const state = evolveAll(initialState, [erbracht(), rechnungErstellt()]);

    const result = decide(state, {
      type: "leistung-loeschen",
      data: { leistungId },
    });

    expect(result).toEqual({
      ok: false,
      error: {
        invariant: "nur-ohne-rechnung-loeschen",
        message:
          "Die Leistung ist in einer Rechnung enthalten und kann nicht gelöscht werden. Entfernen Sie die Leistung zuerst aus dem Rechnungsentwurf.",
      },
    });
  });

  it("sollte Leistung löschen, nachdem sie aus dem Entwurf entfernt wurde", () => {
    const state = evolveAll(initialState, [
      erbracht(),
      rechnungErstellt(),
      {
        type: "rechnung-geaendert",
        data: {
          rechnungId,
          praxiskuerzel: "NHP",
          diagnosetext: "Chronische Rückenschmerzen",
          rechnungstext:
            "Bitte überweisen Sie den Betrag innerhalb von 14 Tagen.",
          leistungen: ["99999999-9999-4999-8999-999999999999"],
        },
      },
    ]);

    const result = decide(state, {
      type: "leistung-loeschen",
      data: { leistungId },
    });

    expect(result.ok).toBe(true);
  });

  it("sollte nichts ändern, wenn eine nicht vorhandene Leistung gelöscht wird", () => {
    const state = evolveAll(initialState, []);

    const result = decide(state, {
      type: "leistung-loeschen",
      data: { leistungId },
    });

    expect(result).toEqual({ ok: true, value: [] });
  });

  it("sollte Leistung mit negativem Einzelbetrag nicht erbringen", () => {
    const state = evolveAll(initialState, [praxisAngelegt(), maxAufgenommen()]);

    const result = decide(state, {
      type: "leistung-erbringen",
      data: { ...untersuchung(), einzelbetrag: { cents: -1 } },
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

  // The model leaves out rules that follow from identity.
  it("sollte Leistung nicht ändern, wenn sie nicht erbracht ist", () => {
    const state = evolveAll(initialState, [praxisAngelegt()]);

    const result = decide(state, {
      type: "leistung-aendern",
      data: aenderung({}),
    });

    expect(result).toEqual({
      ok: false,
      error: {
        message:
          "Die Leistung ist nicht vorhanden. Möglicherweise wurde sie inzwischen gelöscht.",
      },
    });
  });

  it("sollte Leistung nicht zweimal erbringen", () => {
    const state = evolveAll(initialState, [
      praxisAngelegt(),
      maxAufgenommen(),
      erbracht(),
    ]);

    const result = decide(state, {
      type: "leistung-erbringen",
      data: untersuchung(),
    });

    expect(result).toEqual({
      ok: false,
      error: { message: "Die Leistung ist bereits erbracht." },
    });
  });

  it("sollte beim Erbringen die Leistung, ihre Rechnungen, die Praxis und den Patienten konsultieren", () => {
    const query = consults({
      type: "leistung-erbringen",
      data: untersuchung(),
    });

    expect(query).toEqual([
      {
        types: [
          "leistung-erbracht",
          "leistung-geaendert",
          "leistung-geloescht",
          "rechnung-erstellt",
          "rechnung-geaendert",
          "entwurf-geloescht",
          "rechnung-versendet",
          "rechnungsversand-zurueckgenommen",
        ],
        tags: [`leistung:${leistungId}`],
      },
      { types: ["praxis-angelegt"], tags: ["praxis:NHP"] },
      { types: ["patient-aufgenommen"], tags: ["patient:1"] },
    ]);
  });
});

function untersuchung(): Leistung {
  return {
    leistungId,
    praxiskuerzel: "NHP",
    patientennummer: 1,
    datum: "2026-09-14",
    ziffer: "1",
    bezeichnung: "Eingehende Untersuchung",
    anzahl: 1,
    einzelbetrag: { cents: 2050 },
  };
}

function aenderung(werte: Partial<Leistung>) {
  const {
    leistungId,
    praxiskuerzel,
    datum,
    ziffer,
    bezeichnung,
    anzahl,
    einzelbetrag,
  } = {
    ...untersuchung(),
    ...werte,
  };
  return {
    leistungId,
    praxiskuerzel,
    datum,
    ziffer,
    bezeichnung,
    anzahl,
    einzelbetrag,
  };
}

function erbracht(): LeistungserbringungEvent {
  return { type: "leistung-erbracht", data: untersuchung() };
}

function rechnungErstellt(): LeistungserbringungEvent {
  return {
    type: "rechnung-erstellt",
    data: {
      rechnungId,
      praxiskuerzel: "NHP",
      patientennummer: 1,
      diagnosetext: "Chronische Rückenschmerzen",
      rechnungstext: "Bitte überweisen Sie den Betrag innerhalb von 14 Tagen.",
      leistungen: [leistungId],
    },
  };
}

function rechnungVersendet(): LeistungserbringungEvent {
  return {
    type: "rechnung-versendet",
    data: {
      rechnungId,
      patientennummer: 1,
      rechnungsnummer: "1/260920",
      datum: "2026-09-20",
    },
  };
}

function praxisAngelegt(): LeistungserbringungEvent {
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

function maxAufgenommen(): LeistungserbringungEvent {
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
