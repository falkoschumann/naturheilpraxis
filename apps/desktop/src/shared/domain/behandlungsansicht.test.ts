// Copyright (c) 2026 Falko Schumann. MIT license.

import { describe, expect, it } from "vitest";

import type { Leistung } from "./entities.ts";
import type { DomainEvent } from "./events.ts";
import {
  behandlungenErmitteln,
  diagnosenErmitteln,
  initialReadModel,
  projectAll,
} from "./behandlungsansicht.ts";

describe("Behandlungsansicht", () => {
  it("sollte Diagnosen neueste zuerst ermitteln", () => {
    const readModel = projectAll(initialReadModel, [
      {
        type: "diagnose-gestellt",
        data: {
          diagnoseId: "11111111-1111-4111-8111-111111111111",
          praxiskuerzel: "NHP",
          patientennummer: 1,
          datum: "2026-09-14",
          text: "Chronische Rückenschmerzen",
        },
      },
      {
        type: "diagnose-gestellt",
        data: {
          diagnoseId: "13131313-1313-4313-8313-131313131313",
          praxiskuerzel: "NHP",
          patientennummer: 1,
          datum: "2026-09-21",
          text: "Spannungskopfschmerz",
        },
      },
      {
        type: "diagnose-gestellt",
        data: {
          diagnoseId: "14141414-1414-4414-8414-141414141414",
          praxiskuerzel: "NHP",
          patientennummer: 1,
          datum: "2026-09-28",
          text: "Verdacht auf Migräne",
        },
      },
      {
        type: "diagnose-geaendert",
        data: {
          diagnoseId: "11111111-1111-4111-8111-111111111111",
          praxiskuerzel: "NHP",
          patientennummer: 1,
          datum: "2026-09-14",
          text: "Chronische Rückenschmerzen im Lendenwirbelbereich",
        },
      },
      {
        type: "diagnose-geloescht",
        data: { diagnoseId: "14141414-1414-4414-8414-141414141414" },
      },
    ]);

    const result = diagnosenErmitteln(readModel, {
      type: "diagnosen-ermitteln",
      parameters: { patientennummer: 1 },
    });

    expect(result).toEqual([
      {
        diagnoseId: "13131313-1313-4313-8313-131313131313",
        praxiskuerzel: "NHP",
        patientennummer: 1,
        datum: "2026-09-21",
        text: "Spannungskopfschmerz",
      },
      {
        diagnoseId: "11111111-1111-4111-8111-111111111111",
        praxiskuerzel: "NHP",
        patientennummer: 1,
        datum: "2026-09-14",
        text: "Chronische Rückenschmerzen im Lendenwirbelbereich",
      },
    ]);
  });

  it("sollte die Behandlungen eines Patienten neueste zuerst ermitteln", () => {
    const readModel = projectAll(initialReadModel, [
      {
        type: "diagnose-gestellt",
        data: {
          diagnoseId: "11111111-1111-4111-8111-111111111111",
          praxiskuerzel: "NHP",
          patientennummer: 1,
          datum: "2026-09-14",
          text: "Chronische Rückenschmerzen",
        },
      },
      {
        type: "diagnose-gestellt",
        data: {
          diagnoseId: "13131313-1313-4313-8313-131313131313",
          praxiskuerzel: "NHP",
          patientennummer: 1,
          datum: "2026-09-21",
          text: "Spannungskopfschmerz",
        },
      },
      {
        type: "diagnose-gestellt",
        data: {
          diagnoseId: "12121212-1212-4212-8212-121212121212",
          praxiskuerzel: "NHP",
          patientennummer: 2,
          datum: "2026-09-21",
          text: "Akute Bronchitis",
        },
      },
    ]);

    const result = behandlungenErmitteln(readModel, {
      type: "behandlungen-ermitteln",
      parameters: { patientennummer: 1 },
    });

    expect(result).toEqual([
      {
        art: "diagnose",
        eintrag: {
          diagnoseId: "13131313-1313-4313-8313-131313131313",
          praxiskuerzel: "NHP",
          patientennummer: 1,
          datum: "2026-09-21",
          text: "Spannungskopfschmerz",
        },
      },
      {
        art: "diagnose",
        eintrag: {
          diagnoseId: "11111111-1111-4111-8111-111111111111",
          praxiskuerzel: "NHP",
          patientennummer: 1,
          datum: "2026-09-14",
          text: "Chronische Rückenschmerzen",
        },
      },
    ]);
  });

  it("sollte Diagnosen vor Leistungen am gleichen Tag ermitteln", () => {
    const readModel = projectAll(initialReadModel, [
      {
        type: "diagnose-gestellt",
        data: {
          diagnoseId: "11111111-1111-4111-8111-111111111111",
          praxiskuerzel: "NHP",
          patientennummer: 1,
          datum: "2026-09-14",
          text: "Chronische Rückenschmerzen",
        },
      },
      {
        type: "leistung-erbracht",
        data: {
          leistungId: "22222222-2222-4222-8222-222222222222",
          praxiskuerzel: "NHP",
          patientennummer: 1,
          datum: "2026-09-14",
          ziffer: "1",
          bezeichnung: "Eingehende Untersuchung",
          anzahl: 1,
          einzelbetrag: { cents: 2050 },
        },
      },
      {
        type: "leistung-erbracht",
        data: {
          leistungId: "23232323-2323-4323-8323-232323232323",
          praxiskuerzel: "NHP",
          patientennummer: 1,
          datum: "2026-09-21",
          ziffer: "20.1",
          bezeichnung: "Akupunktur",
          anzahl: 2,
          einzelbetrag: { cents: 1530 },
        },
      },
      {
        type: "leistung-erbracht",
        data: {
          leistungId: "24242424-2424-4424-8424-242424242424",
          praxiskuerzel: "NHP",
          patientennummer: 1,
          datum: "2026-09-21",
          ziffer: "4",
          bezeichnung: "Kurze Information",
          anzahl: 1,
          einzelbetrag: { cents: 820 },
        },
      },
      {
        type: "leistung-geloescht",
        data: { leistungId: "24242424-2424-4424-8424-242424242424" },
      },
      {
        type: "diagnose-gestellt",
        data: {
          diagnoseId: "12121212-1212-4212-8212-121212121212",
          praxiskuerzel: "NHP",
          patientennummer: 2,
          datum: "2026-09-21",
          text: "Akute Bronchitis",
        },
      },
    ]);

    const result = behandlungenErmitteln(readModel, {
      type: "behandlungen-ermitteln",
      parameters: { patientennummer: 1 },
    });

    expect(result).toEqual([
      {
        art: "leistung",
        eintrag: {
          leistungId: "23232323-2323-4323-8323-232323232323",
          praxiskuerzel: "NHP",
          patientennummer: 1,
          datum: "2026-09-21",
          ziffer: "20.1",
          bezeichnung: "Akupunktur",
          anzahl: 2,
          einzelbetrag: { cents: 1530 },
        },
      },
      {
        art: "diagnose",
        eintrag: {
          diagnoseId: "11111111-1111-4111-8111-111111111111",
          praxiskuerzel: "NHP",
          patientennummer: 1,
          datum: "2026-09-14",
          text: "Chronische Rückenschmerzen",
        },
      },
      {
        art: "leistung",
        eintrag: {
          leistungId: "22222222-2222-4222-8222-222222222222",
          praxiskuerzel: "NHP",
          patientennummer: 1,
          datum: "2026-09-14",
          ziffer: "1",
          bezeichnung: "Eingehende Untersuchung",
          anzahl: 1,
          einzelbetrag: { cents: 2050 },
        },
      },
    ]);
  });

  it("sollte zu jeder abgerechneten Leistung die Rechnung mit Status ermitteln", () => {
    const readModel = projectAll(initialReadModel, [
      leistungErbracht(ersteLeistung, "2026-09-24"),
      leistungErbracht(zweiteLeistung, "2026-09-23"),
      leistungErbracht(dritteLeistung, "2026-09-22"),
      leistungErbracht(vierteLeistung, "2026-09-21"),
      rechnungErstellt(ersteRechnung, [zweiteLeistung]),
      rechnungErstellt(zweiteRechnung, [dritteLeistung]),
      rechnungVersendet(zweiteRechnung, "1/260925", "2026-09-25"),
      rechnungErstellt(dritteRechnung, [vierteLeistung]),
      rechnungVersendet(dritteRechnung, "1/260926", "2026-09-26"),
      { type: "rechnung-bezahlt", data: { rechnungId: dritteRechnung } },
    ]);

    const result = behandlungenErmitteln(readModel, {
      type: "behandlungen-ermitteln",
      parameters: { patientennummer: 1 },
    });

    expect(result).toEqual([
      { art: "leistung", eintrag: leistung(ersteLeistung, "2026-09-24") },
      {
        art: "leistung",
        eintrag: leistung(zweiteLeistung, "2026-09-23"),
        rechnung: { rechnungId: ersteRechnung, status: "entwurf" },
      },
      {
        art: "leistung",
        eintrag: leistung(dritteLeistung, "2026-09-22"),
        rechnung: {
          rechnungId: zweiteRechnung,
          rechnungsnummer: "1/260925",
          status: "versendet",
        },
      },
      {
        art: "leistung",
        eintrag: leistung(vierteLeistung, "2026-09-21"),
        rechnung: {
          rechnungId: dritteRechnung,
          rechnungsnummer: "1/260926",
          status: "bezahlt",
        },
      },
    ]);
  });

  it("sollte den Rechnungsstatus nach einer Rücknahme ermitteln", () => {
    const readModel = projectAll(initialReadModel, [
      leistungErbracht(ersteLeistung, "2026-09-24"),
      leistungErbracht(zweiteLeistung, "2026-09-23"),
      leistungErbracht(dritteLeistung, "2026-09-22"),
      leistungErbracht(vierteLeistung, "2026-09-21"),
      rechnungErstellt(ersteRechnung, [ersteLeistung, zweiteLeistung]),
      {
        type: "rechnung-geaendert",
        data: {
          rechnungId: ersteRechnung,
          praxiskuerzel: "NHP",
          diagnosetext: "Chronische Rückenschmerzen",
          rechnungstext:
            "Bitte überweisen Sie den Betrag innerhalb von 14 Tagen.",
          leistungen: [zweiteLeistung],
        },
      },
      rechnungErstellt(zweiteRechnung, [dritteLeistung]),
      { type: "entwurf-geloescht", data: { rechnungId: zweiteRechnung } },
      rechnungErstellt(dritteRechnung, [vierteLeistung]),
      rechnungVersendet(dritteRechnung, "1/260925", "2026-09-25"),
      {
        type: "rechnungsversand-zurueckgenommen",
        data: {
          rechnungId: dritteRechnung,
          patientennummer: 1,
          rechnungsnummer: "1/260925",
          datum: "2026-09-25",
        },
      },
      rechnungVersendet(ersteRechnung, "1/260926", "2026-09-26"),
      { type: "rechnung-bezahlt", data: { rechnungId: ersteRechnung } },
      {
        type: "rechnungszahlung-zurueckgenommen",
        data: { rechnungId: ersteRechnung },
      },
    ]);

    const result = behandlungenErmitteln(readModel, {
      type: "behandlungen-ermitteln",
      parameters: { patientennummer: 1 },
    });

    expect(result).toEqual([
      { art: "leistung", eintrag: leistung(ersteLeistung, "2026-09-24") },
      {
        art: "leistung",
        eintrag: leistung(zweiteLeistung, "2026-09-23"),
        rechnung: {
          rechnungId: ersteRechnung,
          rechnungsnummer: "1/260926",
          status: "versendet",
        },
      },
      { art: "leistung", eintrag: leistung(dritteLeistung, "2026-09-22") },
      {
        art: "leistung",
        eintrag: leistung(vierteLeistung, "2026-09-21"),
        rechnung: { rechnungId: dritteRechnung, status: "entwurf" },
      },
    ]);
  });
});

const ersteLeistung = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa";
const zweiteLeistung = "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb";
const dritteLeistung = "cccccccc-cccc-4ccc-8ccc-cccccccccccc";
const vierteLeistung = "dddddddd-dddd-4ddd-8ddd-dddddddddddd";
const ersteRechnung = "55555555-5555-4555-8555-555555555555";
const zweiteRechnung = "66666666-6666-4666-8666-666666666666";
const dritteRechnung = "77777777-7777-4777-8777-777777777777";

function leistung(leistungId: string, datum: string): Leistung {
  return {
    leistungId,
    praxiskuerzel: "NHP",
    patientennummer: 1,
    datum,
    ziffer: "1",
    bezeichnung: "Eingehende Untersuchung",
    anzahl: 1,
    einzelbetrag: { cents: 2050 },
  };
}

function leistungErbracht(leistungId: string, datum: string): DomainEvent {
  return { type: "leistung-erbracht", data: leistung(leistungId, datum) };
}

function rechnungErstellt(
  rechnungId: string,
  leistungen: readonly string[],
): DomainEvent {
  return {
    type: "rechnung-erstellt",
    data: {
      rechnungId,
      praxiskuerzel: "NHP",
      patientennummer: 1,
      diagnosetext: "Chronische Rückenschmerzen",
      rechnungstext: "Bitte überweisen Sie den Betrag innerhalb von 14 Tagen.",
      leistungen,
    },
  };
}

function rechnungVersendet(
  rechnungId: string,
  rechnungsnummer: string,
  datum: string,
): DomainEvent {
  return {
    type: "rechnung-versendet",
    data: { rechnungId, patientennummer: 1, rechnungsnummer, datum },
  };
}
