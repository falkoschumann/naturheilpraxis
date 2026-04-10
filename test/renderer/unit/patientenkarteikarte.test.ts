// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

import { describe, expect, it } from "vitest";

import { Patient } from "../../../src/shared/domain/patient";
import {
  aktualisiereFeld,
  bearbeitePatientendaten,
  brichBearbeitungAb,
  FormularZustand,
  initialisiereFormular,
  initialState,
  reducer,
  sendeFormular,
  type State,
} from "../../../src/renderer/ui/pages/patientenkarteikarte/patient/reducer";

function erzeugePatient(): Patient {
  return {
    annahmejahr: 2026,
    praxis: "Test-Praxis",
    schlüsselworte: ["Test-Schlüsselwort"],
  };
}

const aufnahmeState: State = Object.freeze({
  patient: erzeugePatient(),
  prevPatient: erzeugePatient(),
  zustand: FormularZustand.AUFNAHME,
  nurLesen: false,
  sendenText: "Aufnehmen",
  sendenDeaktiviert: true,
  abbrechenDeaktiviert: true,
});

const anzeigeState: State = Object.freeze({
  patient: Patient.createTestInstance(),
  prevPatient: Patient.createTestInstance(),
  zustand: FormularZustand.ANZEIGE,
  nurLesen: true,
  sendenText: "Bearbeiten",
  sendenDeaktiviert: false,
  abbrechenDeaktiviert: true,
});

const bearbeitungState: State = Object.freeze({
  patient: Patient.createTestInstance(),
  prevPatient: Patient.createTestInstance(),
  zustand: FormularZustand.BEARBEITUNG,
  nurLesen: false,
  sendenText: "Speichern",
  sendenDeaktiviert: true,
  abbrechenDeaktiviert: false,
});

const verarbeitungState: State = Object.freeze({
  patient: Patient.createTestInstance(),
  prevPatient: Patient.createTestInstance(),
  zustand: FormularZustand.VERARBEITUNG,
  nurLesen: true,
  sendenText: "Speichern",
  sendenDeaktiviert: true,
  abbrechenDeaktiviert: true,
});

describe("Patientenkarteikarte", () => {
  it("sollte unbekannte Aktion ignorieren", () => {
    let state = initialState;

    // @ts-expect-error invalid action
    state = reducer(state, { type: "UNKNOWN_ACTION", payload: undefined });

    expect(state).toBe(initialState);
  });

  describe("Start", () => {
    it("sollte in Zustand Aufnahme wechseln, wenn Patient neu ist", () => {
      let state = initialState;

      state = reducer(state, initialisiereFormular(erzeugePatient()));

      expect(state).toEqual<State>(aufnahmeState);
    });

    it("sollte in Zustand Anzeige wechseln, wenn Patient bekannt ist", () => {
      let state = initialState;

      state = reducer(
        state,
        initialisiereFormular(Patient.createTestInstance()),
      );

      expect(state).toEqual<State>(anzeigeState);
    });
  });

  describe("Aufnahme", () => {
    it("sollte im Zustand Aufnahme bleiben, wenn Feld aktualisiert wird", () => {
      let state = aufnahmeState;

      state = reducer(state, aktualisiereFeld({ nachname: "Test Nachname" }));

      expect(state).toEqual({
        ...aufnahmeState,
        patient: {
          ...aufnahmeState.patient,
          nachname: "Test Nachname",
        },
        sendenDeaktiviert: false,
        abbrechenDeaktiviert: false,
      });
    });

    it("sollte in Zustand Verarbeitung wechseln, wenn Formular gesendet wird", () => {
      let state: State = {
        ...bearbeitungState,
        patient: {
          ...bearbeitungState.patient,
          nummer: undefined,
        },
        prevPatient: {
          ...bearbeitungState.patient,
          nummer: undefined,
        },
      };

      state = reducer(state, sendeFormular());

      expect(state).toEqual<State>({
        ...verarbeitungState,
        patient: {
          ...bearbeitungState.patient,
          nummer: undefined,
        },
        prevPatient: {
          ...bearbeitungState.patient,
          nummer: undefined,
        },
      });
    });

    it("sollte im Zustand Aufnahme bleiben, wenn Aufnahme abgebrochen wird", () => {
      let state: State = {
        ...aufnahmeState,
        patient: {
          ...aufnahmeState.patient,
          nachname: "Test Nachname",
        },
        sendenDeaktiviert: false,
        abbrechenDeaktiviert: false,
      };

      state = reducer(state, brichBearbeitungAb());

      expect(state).toEqual(aufnahmeState);
    });
  });

  describe("Anzeige", () => {
    it("sollte in Zustand Bearbeitung wechseln, wenn Patientendaten bearbeitet werden", () => {
      let state = anzeigeState;

      state = reducer(state, bearbeitePatientendaten());

      expect(state).toEqual<State>(bearbeitungState);
    });
  });

  describe("Bearbeitung", () => {
    it("sollte im Zustand Bearbeitung bleiben, wenn Feld aktualisiert wird", () => {
      let state = bearbeitungState;

      state = reducer(state, aktualisiereFeld({ nachname: "Test Nachname" }));

      expect(state).toEqual({
        ...bearbeitungState,
        patient: {
          ...bearbeitungState.patient,
          nachname: "Test Nachname",
        },
        sendenDeaktiviert: false,
        abbrechenDeaktiviert: false,
      });
    });

    it("sollte in Zustand Verarbeitung wechseln, wenn Formular gesendet wird", () => {
      let state = bearbeitungState;

      state = reducer(state, sendeFormular());

      expect(state).toEqual<State>(verarbeitungState);
    });

    it("sollte in Zustand Anzeige wechseln, wenn Bearbeitung abgebrochen wird", () => {
      let state: State = {
        ...bearbeitungState,
        patient: {
          ...bearbeitungState.patient,
          nachname: "Test Nachname",
        },
        sendenDeaktiviert: false,
        abbrechenDeaktiviert: false,
      };

      state = reducer(state, brichBearbeitungAb());

      expect(state).toEqual(anzeigeState);
    });
  });
});
