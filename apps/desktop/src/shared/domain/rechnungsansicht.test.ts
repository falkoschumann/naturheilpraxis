// Copyright (c) 2026 Falko Schumann. MIT license.

import { describe, expect, it } from "vitest";

import type { DomainEvent } from "./events.ts";
import {
  initialReadModel,
  projectAll,
  rechnungErmitteln,
} from "./rechnungsansicht.ts";

const rechnungId = "33333333-3333-4333-8333-333333333333";
const rechnungstext = "Bitte überweisen Sie den Betrag innerhalb von 14 Tagen.";

describe("Rechnungsansicht", () => {
  it("sollte einen Entwurf mit aktuellem Stand ermitteln", () => {
    const readModel = projectAll(initialReadModel, [
      praxis("praxis-angelegt", "Marktplatz 1"),
      patient("patient-aufgenommen", "Lindenweg 5"),
      leistungErbracht(
        "23232323-2323-4323-8323-232323232323",
        "2026-09-21",
        "20.1",
        "Akupunktur",
        2,
        1530,
      ),
      leistungErbracht(
        "22222222-2222-4222-8222-222222222222",
        "2026-09-14",
        "1",
        "Eingehende Untersuchung",
        1,
        2050,
      ),
      rechnungErstellt([
        "23232323-2323-4323-8323-232323232323",
        "22222222-2222-4222-8222-222222222222",
      ]),
      praxis("praxisdaten-geaendert", "Marktplatz 2"),
    ]);

    const result = rechnungErmitteln(readModel, {
      type: "rechnung-ermitteln",
      parameters: { rechnungId },
    });

    expect(result).toEqual({
      rechnungId,
      status: "entwurf",
      praxis: {
        praxiskuerzel: "NHP",
        name: "Naturheilpraxis am Markt",
        anschrift: {
          strasse: "Marktplatz 2",
          postleitzahl: "12345",
          ort: "Musterstadt",
        },
      },
      patient: {
        patientennummer: 1,
        name: { vorname: "Max", nachname: "Mustermann" },
        geburtsdatum: "1980-09-20",
        anschrift: {
          strasse: "Lindenweg 5",
          postleitzahl: "12345",
          ort: "Musterstadt",
        },
      },
      diagnosetext: "Chronische Rückenschmerzen",
      rechnungstext,
      positionen: [
        {
          leistungId: "22222222-2222-4222-8222-222222222222",
          datum: "2026-09-14",
          ziffer: "1",
          bezeichnung: "Eingehende Untersuchung",
          anzahl: 1,
          einzelbetrag: { cents: 2050 },
          betrag: { cents: 2050 },
        },
        {
          leistungId: "23232323-2323-4323-8323-232323232323",
          datum: "2026-09-21",
          ziffer: "20.1",
          bezeichnung: "Akupunktur",
          anzahl: 2,
          einzelbetrag: { cents: 1530 },
          betrag: { cents: 3060 },
        },
      ],
      gesamtbetrag: { cents: 5110 },
    });
  });

  it("sollte eine versendete Rechnung mit dem Stand beim Versand ermitteln", () => {
    const readModel = projectAll(initialReadModel, [
      praxis("praxis-angelegt", "Marktplatz 1"),
      patient("patient-aufgenommen", "Lindenweg 5"),
      leistungErbracht(
        "22222222-2222-4222-8222-222222222222",
        "2026-09-14",
        "1",
        "Eingehende Untersuchung",
        1,
        2050,
      ),
      rechnungErstellt(["22222222-2222-4222-8222-222222222222"]),
      versendet(),
      praxis("praxisdaten-geaendert", "Marktplatz 2"),
      patient("patientendaten-geaendert", "Ahornallee 3"),
    ]);

    const result = rechnungErmitteln(readModel, {
      type: "rechnung-ermitteln",
      parameters: { rechnungId },
    });

    expect(result).toEqual({
      rechnungId,
      rechnungsnummer: "1/260920",
      datum: "2026-09-20",
      status: "versendet",
      praxis: {
        praxiskuerzel: "NHP",
        name: "Naturheilpraxis am Markt",
        anschrift: {
          strasse: "Marktplatz 1",
          postleitzahl: "12345",
          ort: "Musterstadt",
        },
      },
      patient: {
        patientennummer: 1,
        name: { vorname: "Max", nachname: "Mustermann" },
        geburtsdatum: "1980-09-20",
        anschrift: {
          strasse: "Lindenweg 5",
          postleitzahl: "12345",
          ort: "Musterstadt",
        },
      },
      diagnosetext: "Chronische Rückenschmerzen",
      rechnungstext,
      positionen: [
        {
          leistungId: "22222222-2222-4222-8222-222222222222",
          datum: "2026-09-14",
          ziffer: "1",
          bezeichnung: "Eingehende Untersuchung",
          anzahl: 1,
          einzelbetrag: { cents: 2050 },
          betrag: { cents: 2050 },
        },
      ],
      gesamtbetrag: { cents: 2050 },
    });
  });

  it("sollte eine zurückgenommene Rechnung mit aktuellem Stand ermitteln", () => {
    const readModel = projectAll(initialReadModel, [
      praxis("praxis-angelegt", "Marktplatz 1"),
      patient("patient-aufgenommen", "Lindenweg 5"),
      leistungErbracht(
        "22222222-2222-4222-8222-222222222222",
        "2026-09-14",
        "1",
        "Eingehende Untersuchung",
        1,
        2050,
      ),
      rechnungErstellt(["22222222-2222-4222-8222-222222222222"]),
      versendet(),
      patient("patientendaten-geaendert", "Ahornallee 3"),
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

    const result = rechnungErmitteln(readModel, {
      type: "rechnung-ermitteln",
      parameters: { rechnungId },
    });

    expect(result).toMatchObject({
      status: "entwurf",
      patient: {
        anschrift: {
          strasse: "Ahornallee 3",
          postleitzahl: "12345",
          ort: "Musterstadt",
        },
      },
    });
    expect(result).not.toHaveProperty("rechnungsnummer");
    expect(result).not.toHaveProperty("datum");
  });

  it("sollte den Status bezahlter und zurückgenommener Zahlungen ermitteln", () => {
    const bisVersand = [
      praxis("praxis-angelegt", "Marktplatz 1"),
      patient("patient-aufgenommen", "Lindenweg 5"),
      leistungErbracht(
        "22222222-2222-4222-8222-222222222222",
        "2026-09-14",
        "1",
        "Eingehende Untersuchung",
        1,
        2050,
      ),
      rechnungErstellt(["22222222-2222-4222-8222-222222222222"]),
      versendet(),
    ];
    const bezahlt = projectAll(initialReadModel, [
      ...bisVersand,
      { type: "rechnung-bezahlt", data: { rechnungId } },
    ]);
    const zurueckgenommen = projectAll(bezahlt, [
      { type: "rechnungszahlung-zurueckgenommen", data: { rechnungId } },
    ]);

    const query = {
      type: "rechnung-ermitteln",
      parameters: { rechnungId },
    } as const;

    expect(rechnungErmitteln(bezahlt, query)?.status).toBe("bezahlt");
    expect(rechnungErmitteln(zurueckgenommen, query)?.status).toBe("versendet");
  });

  it("sollte einen geänderten Entwurf mit den nun enthaltenen Leistungen ermitteln", () => {
    const readModel = projectAll(initialReadModel, [
      praxis("praxis-angelegt", "Marktplatz 1"),
      patient("patient-aufgenommen", "Lindenweg 5"),
      leistungErbracht(
        "22222222-2222-4222-8222-222222222222",
        "2026-09-14",
        "1",
        "Eingehende Untersuchung",
        1,
        2050,
      ),
      leistungErbracht(
        "23232323-2323-4323-8323-232323232323",
        "2026-09-21",
        "20.1",
        "Akupunktur",
        2,
        1530,
      ),
      rechnungErstellt([
        "22222222-2222-4222-8222-222222222222",
        "23232323-2323-4323-8323-232323232323",
      ]),
      {
        type: "rechnung-geaendert",
        data: {
          rechnungId,
          praxiskuerzel: "NHP",
          diagnosetext: "Lumbago",
          rechnungstext,
          leistungen: ["23232323-2323-4323-8323-232323232323"],
        },
      },
      {
        type: "leistung-geloescht",
        data: { leistungId: "22222222-2222-4222-8222-222222222222" },
      },
    ]);

    const result = rechnungErmitteln(readModel, {
      type: "rechnung-ermitteln",
      parameters: { rechnungId },
    });

    expect(result).toMatchObject({
      diagnosetext: "Lumbago",
      gesamtbetrag: { cents: 3060 },
    });
    expect(result?.positionen.map((position) => position.ziffer)).toEqual([
      "20.1",
    ]);
  });

  it("sollte einen gelöschten Entwurf nicht mehr ermitteln", () => {
    const readModel = projectAll(initialReadModel, [
      praxis("praxis-angelegt", "Marktplatz 1"),
      patient("patient-aufgenommen", "Lindenweg 5"),
      rechnungErstellt([]),
      { type: "entwurf-geloescht", data: { rechnungId } },
    ]);

    const result = rechnungErmitteln(readModel, {
      type: "rechnung-ermitteln",
      parameters: { rechnungId },
    });

    expect(result).toBeUndefined();
  });

  it("sollte keine Rechnung ermitteln, wenn sie nicht vorhanden ist", () => {
    const readModel = projectAll(initialReadModel, []);

    const result = rechnungErmitteln(readModel, {
      type: "rechnung-ermitteln",
      parameters: { rechnungId },
    });

    expect(result).toBeUndefined();
  });
});

function praxis(
  type: "praxis-angelegt" | "praxisdaten-geaendert",
  strasse: string,
): DomainEvent {
  return {
    type,
    data: {
      praxiskuerzel: "NHP",
      name: "Naturheilpraxis am Markt",
      anschrift: { strasse, postleitzahl: "12345", ort: "Musterstadt" },
      rechnungstext,
    },
  };
}

function patient(
  type: "patient-aufgenommen" | "patientendaten-geaendert",
  strasse: string,
): DomainEvent {
  return {
    type,
    data: {
      patientennummer: 1,
      praxiskuerzel: "NHP",
      aufnahmejahr: 2026,
      geburtsdatum: "1980-09-20",
      name: { vorname: "Max", nachname: "Mustermann" },
      anschrift: { strasse, postleitzahl: "12345", ort: "Musterstadt" },
    },
  };
}

function leistungErbracht(
  leistungId: string,
  datum: string,
  ziffer: string,
  bezeichnung: string,
  anzahl: number,
  cents: number,
): DomainEvent {
  return {
    type: "leistung-erbracht",
    data: {
      leistungId,
      praxiskuerzel: "NHP",
      patientennummer: 1,
      datum,
      ziffer,
      bezeichnung,
      anzahl,
      einzelbetrag: { cents },
    },
  };
}

function rechnungErstellt(leistungen: string[]): DomainEvent {
  return {
    type: "rechnung-erstellt",
    data: {
      rechnungId,
      praxiskuerzel: "NHP",
      patientennummer: 1,
      diagnosetext: "Chronische Rückenschmerzen",
      rechnungstext,
      leistungen,
    },
  };
}

function versendet(): DomainEvent {
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
