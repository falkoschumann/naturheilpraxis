// Copyright (c) 2026 Falko Schumann. MIT license.

import { describe, expect, it } from "vitest";

import {
  initialReadModel,
  kennzahlenErmitteln,
  nichtAbgerechneteLeistungenErmitteln,
  patientenMitNichtAbgerechnetenLeistungenErmitteln,
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
          "25252525-2525-4525-8525-252525252525",
          2,
          "2026-09-18",
          "25.1",
          "Injektion",
          1,
          520,
        ),
      ),
      erbracht(
        leistung(
          "26262626-2626-4626-8626-262626262626",
          3,
          "2026-09-27",
          "5",
          "Beratung",
          1,
          2050,
        ),
      ),
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
        betrag: { cents: 2050 },
      },
      {
        rechnungId: "35353535-3535-4535-8535-353535353535",
        praxiskuerzel: "NHP",
        patientennummer: 1,
        patientenname: "Mustermann, Max (Nr. 1), geboren am 20.09.1980",
        diagnosetext: "Chronische Rückenschmerzen",
        rechnungstext,
        status: "entwurf",
        betrag: { cents: 3060 },
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
        betrag: { cents: 2050 },
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
        betrag: { cents: 520 },
      },
    ]);
  });

  it("sollte die Rechnungen eines Patienten ermitteln", () => {
    const readModel = projectAll(initialReadModel, [
      aufgenommen(1, "Max", "Mustermann", "1980-09-20"),
      aufgenommen(2, "Erika", "Mustermann", "1982-03-14"),
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
        betrag: { cents: 2050 },
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

  it("sollte Kennzahlen der Abrechnung ermitteln", () => {
    const readModel = projectAll(initialReadModel, [
      erbracht(leistung(L.a, 1, "2026-09-14", "1", "Untersuchung", 1, 2050)),
      erbracht(leistung(L.b, 1, "2026-09-21", "20.1", "Akupunktur", 2, 1530)),
      erbracht(leistung(L.c, 1, "2026-09-21", "4", "Information", 1, 820)),
      { type: "leistung-geloescht", data: { leistungId: L.c } },
      erbracht(leistung(L.d, 1, "2026-09-22", "25.1", "Injektion", 2, 500)),
      erbracht(leistung(L.e, 1, "2026-09-23", "5", "Beratung", 1, 4500)),
      erbracht(leistung(L.f, 1, "2026-09-24", "5", "Beratung", 1, 3000)),
      erbracht(leistung(L.g, 1, "2026-09-24", "4", "Information", 1, 820)),
      erstellt(R.entwurf, 1, "Rückenschmerzen", L.d),
      erstellt(R.versendet, 1, "Rückenschmerzen", L.e),
      versendet(R.versendet, 1, "1/260925", "2026-09-25"),
      erstellt(R.bezahlt, 1, "Rückenschmerzen", L.f, L.g),
      versendet(R.bezahlt, 1, "1/260926", "2026-09-26"),
      { type: "rechnung-bezahlt", data: { rechnungId: R.bezahlt } },
    ]);

    const result = kennzahlenErmitteln(readModel, {
      type: "kennzahlen-ermitteln",
      parameters: {},
    });

    expect(result).toEqual({
      nichtAbgerechnet: { anzahl: 2, betrag: { cents: 5110 } },
      entwuerfe: { anzahl: 1, betrag: { cents: 1000 } },
      versendet: { anzahl: 1, betrag: { cents: 4500 } },
      bezahlt: { anzahl: 1, betrag: { cents: 3820 } },
    });
  });

  it("sollte Patienten mit nicht abgerechneten Leistungen höchster Betrag zuerst ermitteln", () => {
    const readModel = projectAll(initialReadModel, [
      aufgenommen(1, "Max", "Mustermann", "1980-09-20"),
      aufgenommen(2, "Erika", "Mustermann", "1982-03-14"),
      aufgenommen(3, "Anna", "Beispiel", "1975-01-02", "ABC"),
      aufgenommen(4, "Paul", "Beispiel", "1990-05-06"),
      erbracht(leistung(L.a, 1, "2026-09-21", "20.1", "Akupunktur", 2, 1530)),
      erbracht(leistung(L.b, 1, "2026-09-14", "1", "Untersuchung", 1, 2050)),
      erbracht(leistung(L.c, 2, "2026-09-20", "4", "Information", 1, 820)),
      erbracht(leistung(L.d, 2, "2026-09-15", "5", "Beratung", 1, 2050)),
      erbracht(leistung(L.e, 3, "2026-09-22", "5", "Beratung", 1, 5110)),
      erbracht(leistung(L.f, 4, "2026-09-23", "5", "Beratung", 1, 2050)),
      erstellt(R.entwurf, 2, "Bronchitis", L.d),
      erstellt(R.versendet, 4, "Migräne", L.f),
    ]);

    const result = patientenMitNichtAbgerechnetenLeistungenErmitteln(
      readModel,
      {
        type: "patienten-mit-nicht-abgerechneten-leistungen-ermitteln",
        parameters: {},
      },
    );

    expect(result).toEqual([
      {
        patientennummer: 3,
        praxiskuerzel: "ABC",
        name: { vorname: "Anna", nachname: "Beispiel" },
        anzahl: 1,
        betrag: { cents: 5110 },
        seit: "2026-09-22",
      },
      {
        patientennummer: 1,
        praxiskuerzel: "NHP",
        name: { vorname: "Max", nachname: "Mustermann" },
        anzahl: 2,
        betrag: { cents: 5110 },
        seit: "2026-09-14",
      },
      {
        patientennummer: 2,
        praxiskuerzel: "NHP",
        name: { vorname: "Erika", nachname: "Mustermann" },
        anzahl: 1,
        betrag: { cents: 820 },
        seit: "2026-09-20",
      },
    ]);
  });
});

const L = {
  a: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
  b: "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb",
  c: "cccccccc-cccc-4ccc-8ccc-cccccccccccc",
  d: "dddddddd-dddd-4ddd-8ddd-dddddddddddd",
  e: "eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee",
  f: "ffffffff-ffff-4fff-8fff-ffffffffffff",
  g: "00000000-0000-4000-8000-000000000000",
} as const;

const R = {
  entwurf: "55555555-5555-4555-8555-555555555555",
  versendet: "66666666-6666-4666-8666-666666666666",
  bezahlt: "77777777-7777-4777-8777-777777777777",
} as const;

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
  praxiskuerzel = "NHP",
): DomainEvent {
  return {
    type: "patient-aufgenommen",
    data: {
      patientennummer,
      praxiskuerzel,
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
  ...leistungen: readonly string[]
): DomainEvent {
  return {
    type: "rechnung-erstellt",
    data: {
      rechnungId,
      praxiskuerzel: "NHP",
      patientennummer,
      diagnosetext,
      rechnungstext,
      leistungen,
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
