// Copyright (c) 2026 Falko Schumann. MIT license.

import { describe, expect, it } from "vitest";

import {
  initialReadModel,
  nichtAbgerechneteLeistungenErmitteln,
  projectAll,
  rechnungenErmitteln,
} from "./abrechnungsansicht.ts";
import type { Leistung } from "./entities.ts";
import type { DomainEvent } from "./events.ts";

const rechnungstext = "Bitte überweisen Sie den Betrag innerhalb von 14 Tagen.";

describe("Abrechnungsansicht", () => {
  it("sollte nicht abgerechnete Leistungen älteste zuerst ermitteln", () => {
    const readModel = projectAll(initialReadModel, [
      erbracht(
        leistung(
          "22222222-2222-4222-8222-222222222222",
          1,
          "2026-09-14",
          "1",
          "Eingehende Untersuchung",
          1,
          2050,
        ),
      ),
      erbracht(
        leistung(
          "23232323-2323-4323-8323-232323232323",
          1,
          "2026-09-21",
          "20.1",
          "Akupunktur",
          2,
          1530,
        ),
      ),
      erbracht(
        leistung(
          "24242424-2424-4424-8424-242424242424",
          1,
          "2026-09-07",
          "4",
          "Kurze Information",
          1,
          820,
        ),
      ),
      erbracht(
        leistung(
          "25252525-2525-4525-8525-252525252525",
          2,
          "2026-09-14",
          "1",
          "Eingehende Untersuchung",
          1,
          2050,
        ),
      ),
      erstellt(
        "33333333-3333-4333-8333-333333333333",
        1,
        "Chronische Rückenschmerzen",
        "22222222-2222-4222-8222-222222222222",
      ),
      erstellt(
        "34343434-3434-4434-8434-343434343434",
        1,
        "Chronische Rückenschmerzen",
        "24242424-2424-4424-8424-242424242424",
      ),
      {
        type: "entwurf-geloescht",
        data: { rechnungId: "34343434-3434-4434-8434-343434343434" },
      },
    ]);

    const result = nichtAbgerechneteLeistungenErmitteln(readModel, {
      type: "nicht-abgerechnete-leistungen-ermitteln",
      parameters: { patientennummer: 1 },
    });

    expect(result).toEqual([
      leistung(
        "24242424-2424-4424-8424-242424242424",
        1,
        "2026-09-07",
        "4",
        "Kurze Information",
        1,
        820,
      ),
      leistung(
        "23232323-2323-4323-8323-232323232323",
        1,
        "2026-09-21",
        "20.1",
        "Akupunktur",
        2,
        1530,
      ),
    ]);
  });

  it("sollte Entwürfe zuerst und dann die neuesten Rechnungen ermitteln", () => {
    const readModel = projectAll(initialReadModel, [
      aufgenommen(1, "Max", "Mustermann", "1980-09-20"),
      aufgenommen(2, "Erika", "Mustermann", "1982-03-14"),
      aufgenommen(3, "Anna", "Beispiel", "1975-01-02"),
      erstellt(
        "33333333-3333-4333-8333-333333333333",
        2,
        "Akute Bronchitis",
        "25252525-2525-4525-8525-252525252525",
      ),
      versendet(
        "33333333-3333-4333-8333-333333333333",
        2,
        "2/260920",
        "2026-09-20",
      ),
      {
        type: "rechnung-bezahlt",
        data: { rechnungId: "33333333-3333-4333-8333-333333333333" },
      },
      erstellt(
        "34343434-3434-4434-8434-343434343434",
        1,
        "Chronische Rückenschmerzen",
        "22222222-2222-4222-8222-222222222222",
      ),
      versendet(
        "34343434-3434-4434-8434-343434343434",
        1,
        "1/260925",
        "2026-09-25",
      ),
      erstellt(
        "35353535-3535-4535-8535-353535353535",
        1,
        "Chronische Rückenschmerzen",
        "23232323-2323-4323-8323-232323232323",
      ),
      versendet(
        "35353535-3535-4535-8535-353535353535",
        1,
        "1/260926",
        "2026-09-26",
      ),
      {
        type: "rechnungsversand-zurueckgenommen",
        data: {
          rechnungId: "35353535-3535-4535-8535-353535353535",
          patientennummer: 1,
          rechnungsnummer: "1/260926",
          datum: "2026-09-26",
        },
      },
      erstellt(
        "36363636-3636-4636-8636-363636363636",
        3,
        "Schlafstörungen",
        "26262626-2626-4626-8626-262626262626",
      ),
    ]);

    const result = rechnungenErmitteln(readModel, {
      type: "rechnungen-ermitteln",
      parameters: {},
    });

    expect(result).toEqual([
      {
        rechnungId: "36363636-3636-4636-8636-363636363636",
        praxiskuerzel: "NHP",
        patientennummer: 3,
        patientenname: "Beispiel, Anna (Nr. 3), geboren am 02.01.1975",
        diagnosetext: "Schlafstörungen",
        rechnungstext,
        status: "entwurf",
      },
      {
        rechnungId: "35353535-3535-4535-8535-353535353535",
        praxiskuerzel: "NHP",
        patientennummer: 1,
        patientenname: "Mustermann, Max (Nr. 1), geboren am 20.09.1980",
        diagnosetext: "Chronische Rückenschmerzen",
        rechnungstext,
        status: "entwurf",
      },
      {
        rechnungId: "34343434-3434-4434-8434-343434343434",
        praxiskuerzel: "NHP",
        patientennummer: 1,
        patientenname: "Mustermann, Max (Nr. 1), geboren am 20.09.1980",
        diagnosetext: "Chronische Rückenschmerzen",
        rechnungsnummer: "1/260925",
        datum: "2026-09-25",
        rechnungstext,
        status: "versendet",
      },
      {
        rechnungId: "33333333-3333-4333-8333-333333333333",
        praxiskuerzel: "NHP",
        patientennummer: 2,
        patientenname: "Mustermann, Erika (Nr. 2), geboren am 14.03.1982",
        diagnosetext: "Akute Bronchitis",
        rechnungsnummer: "2/260920",
        datum: "2026-09-20",
        rechnungstext,
        status: "bezahlt",
      },
    ]);
  });

  it("sollte die Rechnungen eines Patienten ermitteln", () => {
    const readModel = projectAll(initialReadModel, [
      aufgenommen(1, "Max", "Mustermann", "1980-09-20"),
      aufgenommen(2, "Erika", "Mustermann", "1982-03-14"),
      erstellt(
        "33333333-3333-4333-8333-333333333333",
        2,
        "Akute Bronchitis",
        "25252525-2525-4525-8525-252525252525",
      ),
      erstellt(
        "34343434-3434-4434-8434-343434343434",
        1,
        "Chronische Rückenschmerzen",
        "22222222-2222-4222-8222-222222222222",
      ),
    ]);

    const result = rechnungenErmitteln(readModel, {
      type: "rechnungen-ermitteln",
      parameters: { patientennummer: 1 },
    });

    expect(result).toEqual([
      {
        rechnungId: "34343434-3434-4434-8434-343434343434",
        praxiskuerzel: "NHP",
        patientennummer: 1,
        patientenname: "Mustermann, Max (Nr. 1), geboren am 20.09.1980",
        diagnosetext: "Chronische Rückenschmerzen",
        rechnungstext,
        status: "entwurf",
      },
    ]);
  });

  it("sollte geänderte Entwürfe und zurückgenommene Zahlungen ermitteln", () => {
    const readModel = projectAll(initialReadModel, [
      aufgenommen(1, "Max", "Mustermann", "1980-09-20"),
      erstellt(
        "33333333-3333-4333-8333-333333333333",
        1,
        "Rückenschmerzen",
        "22222222-2222-4222-8222-222222222222",
      ),
      {
        type: "rechnung-geaendert",
        data: {
          rechnungId: "33333333-3333-4333-8333-333333333333",
          praxiskuerzel: "NHP",
          diagnosetext: "Lumbago",
          rechnungstext,
          leistungen: ["22222222-2222-4222-8222-222222222222"],
        },
      },
      versendet(
        "33333333-3333-4333-8333-333333333333",
        1,
        "1/260920",
        "2026-09-20",
      ),
      {
        type: "rechnung-bezahlt",
        data: { rechnungId: "33333333-3333-4333-8333-333333333333" },
      },
      {
        type: "rechnungszahlung-zurueckgenommen",
        data: { rechnungId: "33333333-3333-4333-8333-333333333333" },
      },
    ]);

    const result = rechnungenErmitteln(readModel, {
      type: "rechnungen-ermitteln",
      parameters: {},
    });

    expect(result).toMatchObject([
      {
        diagnosetext: "Lumbago",
        status: "versendet",
        rechnungsnummer: "1/260920",
      },
    ]);
  });
});

function leistung(
  leistungId: string,
  patientennummer: number,
  datum: string,
  ziffer: string,
  bezeichnung: string,
  anzahl: number,
  cents: number,
): Leistung {
  return {
    leistungId,
    praxiskuerzel: "NHP",
    patientennummer,
    datum,
    ziffer,
    bezeichnung,
    anzahl,
    einzelbetrag: { cents },
  };
}

function erbracht(data: Leistung): DomainEvent {
  return { type: "leistung-erbracht", data };
}

function aufgenommen(
  patientennummer: number,
  vorname: string,
  nachname: string,
  geburtsdatum: string,
): DomainEvent {
  return {
    type: "patient-aufgenommen",
    data: {
      patientennummer,
      praxiskuerzel: "NHP",
      aufnahmejahr: 2026,
      geburtsdatum,
      name: { vorname, nachname },
    },
  };
}

function erstellt(
  rechnungId: string,
  patientennummer: number,
  diagnosetext: string,
  leistungId: string,
): DomainEvent {
  return {
    type: "rechnung-erstellt",
    data: {
      rechnungId,
      praxiskuerzel: "NHP",
      patientennummer,
      diagnosetext,
      rechnungstext,
      leistungen: [leistungId],
    },
  };
}

function versendet(
  rechnungId: string,
  patientennummer: number,
  rechnungsnummer: string,
  datum: string,
): DomainEvent {
  return {
    type: "rechnung-versendet",
    data: { rechnungId, patientennummer, rechnungsnummer, datum },
  };
}
