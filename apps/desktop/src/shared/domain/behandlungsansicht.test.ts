// Copyright (c) 2026 Falko Schumann. MIT license.

import { describe, expect, it } from "vitest";

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
});
