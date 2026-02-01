// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

import { describe, expect, it } from "vitest";

import { Patient } from "../../../src/shared/domain/patient";
import {
  aktualisiereFeld,
  bearbeitePatientendaten,
  brichBearbeitungAb,
  FormularZustand,
  initialisierePatientendaten,
  initialState,
  reducer,
  sendeFormular,
  type State,
  verarbeitungAbgeschlossen,
  zeigePatientendatenAn,
} from "../../../src/renderer/ui/pages/patientenkarteikarte/reducer";
import { Temporal } from "@js-temporal/polyfill";

describe("Patientenkarteikarte", () => {
  it("should return state for unknown action", () => {
    let state = initialState;

    // @ts-expect-error invalid action
    state = reducer(state, { type: "UNKNOWN_ACTION", payload: undefined });

    expect(state).toBe(initialState);
  });

  describe("Start", () => {
    it("sollte Patientendaten initialisieren", () => {
      let state = initialState;

      state = reducer(
        state,
        initialisierePatientendaten({
          annahmejahr: 2026,
          praxis: "Test-Praxis",
          schluesselworte: ["Test-Schlüsselwort"],
        }),
      );

      expect(state).toEqual<State>({
        patient: {
          annahmejahr: 2026,
          praxis: "Test-Praxis",
          schluesselworte: ["Test-Schlüsselwort"],
        },
        prevPatient: {
          annahmejahr: 2026,
          praxis: "Test-Praxis",
          schluesselworte: ["Test-Schlüsselwort"],
        },
        zustand: FormularZustand.AUFNAHME,
        nurLesen: false,
        sendenText: "Aufnehmen",
        sendenDeaktiviert: true,
        abbrechenDeaktiviert: true,
      });
    });

    it("sollte Patientendaten anzeigen", () => {
      let state = initialState;

      state = reducer(
        state,
        zeigePatientendatenAn(Patient.createTestInstance()),
      );

      expect(state).toEqual<State>({
        patient: Patient.createTestInstance(),
        prevPatient: Patient.createTestInstance(),
        zustand: FormularZustand.ANZEIGE,
        nurLesen: true,
        sendenText: "Bearbeiten",
        sendenDeaktiviert: false,
        abbrechenDeaktiviert: true,
      });
    });
  });

  describe("Aufnahme", () => {
    it("sollte Feld aktualisieren wenn Formular ist ungültig", () => {
      let state: State = {
        patient: {
          annahmejahr: 2026,
          praxis: "Test-Praxis",
        },
        prevPatient: {
          annahmejahr: 2026,
          praxis: "Test-Praxis",
        },
        zustand: FormularZustand.AUFNAHME,
        nurLesen: false,
        sendenText: "Aufnehmen",
        sendenDeaktiviert: true,
        abbrechenDeaktiviert: true,
      };

      state = reducer(state, aktualisiereFeld({ annahmejahr: 2016 }));
      state = reducer(state, aktualisiereFeld({ nachname: "Mustermann" }));
      state = reducer(state, aktualisiereFeld({ annahmejahr: 2016 }));

      expect(state).toEqual<State>({
        patient: {
          annahmejahr: 2016,
          praxis: "Test-Praxis",
          nachname: "Mustermann",
        },
        prevPatient: {
          annahmejahr: 2026,
          praxis: "Test-Praxis",
        },
        zustand: FormularZustand.AUFNAHME,
        nurLesen: false,
        sendenText: "Aufnehmen",
        sendenDeaktiviert: true,
        abbrechenDeaktiviert: false,
      });
    });

    it("sollte Feld aktualisieren wenn Formular ist gültig", () => {
      let state: State = {
        patient: {
          annahmejahr: 2026,
          praxis: "Test-Praxis",
        },
        prevPatient: {
          annahmejahr: 2026,
          praxis: "Test-Praxis",
        },
        zustand: FormularZustand.AUFNAHME,
        nurLesen: false,
        sendenText: "Aufnehmen",
        sendenDeaktiviert: true,
        abbrechenDeaktiviert: true,
      };

      state = reducer(state, aktualisiereFeld({ annahmejahr: 2016 }));
      state = reducer(state, aktualisiereFeld({ nachname: "Mustermann" }));
      state = reducer(state, aktualisiereFeld({ annahmejahr: 2016 }));
      state = reducer(state, aktualisiereFeld({ vorname: "Max" }));
      state = reducer(state, aktualisiereFeld({ nachname: "Mustermann" }));
      state = reducer(
        state,
        aktualisiereFeld({
          geburtsdatum: Temporal.PlainDate.from("1990-01-01"),
        }),
      );

      expect(state).toEqual<State>({
        patient: {
          annahmejahr: 2016,
          praxis: "Test-Praxis",
          vorname: "Max",
          nachname: "Mustermann",
          geburtsdatum: Temporal.PlainDate.from("1990-01-01"),
        },
        prevPatient: {
          annahmejahr: 2026,
          praxis: "Test-Praxis",
        },
        zustand: FormularZustand.AUFNAHME,
        nurLesen: false,
        sendenText: "Aufnehmen",
        sendenDeaktiviert: false,
        abbrechenDeaktiviert: false,
      });
    });

    it("sollte Formular senden", () => {
      let state: State = {
        patient: {
          annahmejahr: 2016,
          praxis: "Test-Praxis",
          nachname: "Mustermann",
        },
        prevPatient: {
          annahmejahr: 2026,
          praxis: "Test-Praxis",
        },
        zustand: FormularZustand.AUFNAHME,
        nurLesen: false,
        sendenText: "Aufnehmen",
        sendenDeaktiviert: false,
        abbrechenDeaktiviert: false,
      };

      state = reducer(state, sendeFormular());

      expect(state).toEqual<State>({
        patient: {
          annahmejahr: 2016,
          praxis: "Test-Praxis",
          nachname: "Mustermann",
        },
        prevPatient: {
          annahmejahr: 2026,
          praxis: "Test-Praxis",
        },
        zustand: FormularZustand.VERARBEITUNG,
        nurLesen: true,
        sendenText: "Aufnehmen",
        sendenDeaktiviert: true,
        abbrechenDeaktiviert: true,
      });
    });

    it("sollte Aufnahme abbrechen", () => {
      let state: State = {
        patient: {
          annahmejahr: 2016,
          praxis: "Test-Praxis",
          nachname: "Mustermann",
        },
        prevPatient: {
          annahmejahr: 2026,
          praxis: "Test-Praxis",
        },
        zustand: FormularZustand.AUFNAHME,
        nurLesen: false,
        sendenText: "Aufnehmen",
        sendenDeaktiviert: false,
        abbrechenDeaktiviert: false,
      };

      state = reducer(state, brichBearbeitungAb());

      expect(state).toEqual<State>({
        patient: {
          annahmejahr: 2026,
          praxis: "Test-Praxis",
        },
        prevPatient: {
          annahmejahr: 2026,
          praxis: "Test-Praxis",
        },
        zustand: FormularZustand.AUFNAHME,
        nurLesen: false,
        sendenText: "Aufnehmen",
        sendenDeaktiviert: true,
        abbrechenDeaktiviert: true,
      });
    });
  });

  describe("Verarbeitung", () => {
    it("sollte Verarbeitung abschließen, wenn Patient aufgenommen wird", () => {
      let state: State = {
        patient: {
          annahmejahr: 2016,
          praxis: "Test-Praxis",
          nachname: "Mustermann",
        },
        prevPatient: {
          annahmejahr: 2026,
          praxis: "Test-Praxis",
        },
        zustand: FormularZustand.VERARBEITUNG,
        nurLesen: true,
        sendenText: "Aufnehmen",
        sendenDeaktiviert: true,
        abbrechenDeaktiviert: true,
      };

      state = reducer(state, verarbeitungAbgeschlossen({ nummer: 1 }));

      expect(state).toEqual<State>({
        patient: {
          annahmejahr: 2016,
          praxis: "Test-Praxis",
          nachname: "Mustermann",
          nummer: 1,
        },
        prevPatient: {
          annahmejahr: 2016,
          praxis: "Test-Praxis",
          nachname: "Mustermann",
          nummer: 1,
        },
        zustand: FormularZustand.ANZEIGE,
        nurLesen: true,
        sendenText: "Bearbeiten",
        sendenDeaktiviert: false,
        abbrechenDeaktiviert: true,
      });
    });

    it("sollte Verarbeitung abschließen, wenn Patient bearbeitet wird", () => {
      let state: State = {
        patient: {
          annahmejahr: 2016,
          praxis: "Test-Praxis",
          nachname: "Mustermann",
          nummer: 2,
        },
        prevPatient: {
          annahmejahr: 2026,
          praxis: "Test-Praxis",
          nummer: 2,
        },
        zustand: FormularZustand.VERARBEITUNG,
        nurLesen: false,
        sendenText: "Speichern",
        sendenDeaktiviert: true,
        abbrechenDeaktiviert: true,
      };

      state = reducer(state, verarbeitungAbgeschlossen({ nummer: 1 }));

      expect(state).toEqual<State>({
        patient: {
          annahmejahr: 2016,
          praxis: "Test-Praxis",
          nachname: "Mustermann",
          nummer: 2,
        },
        prevPatient: {
          annahmejahr: 2016,
          praxis: "Test-Praxis",
          nachname: "Mustermann",
          nummer: 2,
        },
        zustand: FormularZustand.ANZEIGE,
        nurLesen: true,
        sendenText: "Bearbeiten",
        sendenDeaktiviert: false,
        abbrechenDeaktiviert: true,
      });
    });
  });

  describe("Anzeige", () => {
    it("sollte Patientendaten bearbeiten", () => {
      let state: State = {
        patient: {
          annahmejahr: 2016,
          praxis: "Test-Praxis",
          nachname: "Mustermann",
          nummer: 2,
        },
        prevPatient: {
          annahmejahr: 2016,
          praxis: "Test-Praxis",
          nachname: "Mustermann",
          nummer: 2,
        },
        zustand: FormularZustand.ANZEIGE,
        nurLesen: true,
        sendenText: "Bearbeiten",
        sendenDeaktiviert: true,
        abbrechenDeaktiviert: true,
      };

      state = reducer(state, bearbeitePatientendaten());

      expect(state).toEqual<State>({
        patient: {
          annahmejahr: 2016,
          praxis: "Test-Praxis",
          nachname: "Mustermann",
          nummer: 2,
        },
        prevPatient: {
          annahmejahr: 2016,
          praxis: "Test-Praxis",
          nachname: "Mustermann",
          nummer: 2,
        },
        zustand: FormularZustand.BEARBEITUNG,
        nurLesen: false,
        sendenText: "Speichern",
        sendenDeaktiviert: true,
        abbrechenDeaktiviert: false,
      });
    });
  });

  describe("Bearbeiten", () => {
    it("sollte Feld aktualisieren und Formular ist nicht gültig", () => {
      let state: State = {
        patient: {
          annahmejahr: 2026,
          praxis: "Test-Praxis",
          nummer: 2,
        },
        prevPatient: {
          annahmejahr: 2026,
          praxis: "Test-Praxis",
          nummer: 2,
        },
        zustand: FormularZustand.BEARBEITUNG,
        nurLesen: false,
        sendenText: "Speichern",
        sendenDeaktiviert: true,
        abbrechenDeaktiviert: false,
      };

      state = reducer(state, aktualisiereFeld({ annahmejahr: 2016 }));
      state = reducer(state, aktualisiereFeld({ nachname: "Mustermann" }));

      expect(state).toEqual<State>({
        patient: {
          annahmejahr: 2016,
          praxis: "Test-Praxis",
          nachname: "Mustermann",
          nummer: 2,
        },
        prevPatient: {
          annahmejahr: 2026,
          praxis: "Test-Praxis",
          nummer: 2,
        },
        zustand: FormularZustand.BEARBEITUNG,
        nurLesen: false,
        sendenText: "Speichern",
        sendenDeaktiviert: true,
        abbrechenDeaktiviert: false,
      });
    });

    it("sollte Feld aktualisieren und Formular ist gültig", () => {
      let state: State = {
        patient: {
          annahmejahr: 2026,
          praxis: "Test-Praxis",
          nummer: 2,
        },
        prevPatient: {
          annahmejahr: 2026,
          praxis: "Test-Praxis",
          nummer: 2,
        },
        zustand: FormularZustand.BEARBEITUNG,
        nurLesen: false,
        sendenText: "Speichern",
        sendenDeaktiviert: true,
        abbrechenDeaktiviert: false,
      };

      state = reducer(state, aktualisiereFeld({ annahmejahr: 2016 }));
      state = reducer(state, aktualisiereFeld({ vorname: "Max" }));
      state = reducer(state, aktualisiereFeld({ nachname: "Mustermann" }));
      state = reducer(
        state,
        aktualisiereFeld({
          geburtsdatum: Temporal.PlainDate.from("1990-01-01"),
        }),
      );

      expect(state).toEqual<State>({
        patient: {
          annahmejahr: 2016,
          praxis: "Test-Praxis",
          vorname: "Max",
          nachname: "Mustermann",
          geburtsdatum: Temporal.PlainDate.from("1990-01-01"),
          nummer: 2,
        },
        prevPatient: {
          annahmejahr: 2026,
          praxis: "Test-Praxis",
          nummer: 2,
        },
        zustand: FormularZustand.BEARBEITUNG,
        nurLesen: false,
        sendenText: "Speichern",
        sendenDeaktiviert: false,
        abbrechenDeaktiviert: false,
      });
    });

    it("sollte Formular senden", () => {
      let state: State = {
        patient: {
          nummer: 2,
          annahmejahr: 2016,
          praxis: "Test-Praxis",
          nachname: "Mustermann",
        },
        prevPatient: {
          annahmejahr: 2026,
          praxis: "Test-Praxis",
          nummer: 2,
        },
        zustand: FormularZustand.BEARBEITUNG,
        nurLesen: false,
        sendenText: "Speichern",
        sendenDeaktiviert: false,
        abbrechenDeaktiviert: false,
      };

      state = reducer(state, sendeFormular());

      expect(state).toEqual<State>({
        patient: {
          nummer: 2,
          annahmejahr: 2016,
          praxis: "Test-Praxis",
          nachname: "Mustermann",
        },
        prevPatient: {
          annahmejahr: 2026,
          praxis: "Test-Praxis",
          nummer: 2,
        },
        zustand: FormularZustand.VERARBEITUNG,
        nurLesen: true,
        sendenText: "Speichern",
        sendenDeaktiviert: true,
        abbrechenDeaktiviert: true,
      });
    });

    it("sollte Bearbeitung abbrechen", () => {
      let state: State = {
        patient: {
          nummer: 2,
          annahmejahr: 2016,
          praxis: "Test-Praxis",
          nachname: "Mustermann",
        },
        prevPatient: {
          annahmejahr: 2026,
          praxis: "Test-Praxis",
          nummer: 2,
        },
        zustand: FormularZustand.BEARBEITUNG,
        nurLesen: false,
        sendenText: "Speichern",
        sendenDeaktiviert: false,
        abbrechenDeaktiviert: false,
      };

      state = reducer(state, brichBearbeitungAb());

      expect(state).toEqual<State>({
        patient: {
          annahmejahr: 2026,
          praxis: "Test-Praxis",
          nummer: 2,
        },
        prevPatient: {
          annahmejahr: 2026,
          praxis: "Test-Praxis",
          nummer: 2,
        },
        zustand: FormularZustand.ANZEIGE,
        nurLesen: true,
        sendenText: "Bearbeiten",
        sendenDeaktiviert: true,
        abbrechenDeaktiviert: true,
      });
    });
  });
});
