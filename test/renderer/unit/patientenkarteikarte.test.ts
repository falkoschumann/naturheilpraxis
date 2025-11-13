// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

import { Temporal } from "@js-temporal/polyfill";
import { describe, expect, it } from "vitest";

import { Einstellungen } from "../../../src/shared/domain/einstellungen";
import {
  abgebrochen,
  feldAktualisiert,
  FormularZustand,
  initialisiereFormular,
  initialState,
  patientGefunden,
  reducer,
  sendeFormular,
  SendenText,
  type State,
  verarbeitungAbgeschlossen,
} from "../../../src/renderer/domain/patientenkarteikarte";
import type { Patient } from "../../../src/shared/domain/naturheilpraxis";

const aufnahmeState: State = {
  patient: {
    annahmejahr: Temporal.Now.plainDateISO().year,
    praxis: "Praxis 1",
    schluesselworte: ["Aktiv", "Weihnachtskarte"],
  },
  formularZustand: FormularZustand.AUFNEHMEN,
  kannAbschicken: false,
  kannAbbrechen: false,
  istSchreibgeschuetzt: false,
  sendenText: SendenText.AUFNEHMEN,
  praxis: ["Praxis 1", "Praxis 2"],
  anrede: ["Herr", "Frau", "Fräulein"],
  familienstand: ["ledig", "verheiratet", "geschieden", "verwitwet"],
  schluesselworte: ["Aktiv", "Weihnachtskarte", "Geburtstagskarte"],
  standardSchluesselworte: ["Aktiv", "Weihnachtskarte"],
};

const aufnahmeAusgefuelltState: State = {
  ...aufnahmeState,
  patient: {
    ...aufnahmeState.patient,
    geburtsdatum: Temporal.PlainDate.from("1980-01-01"),
    vorname: "Max",
    nachname: "Mustermann",
  },
  formularZustand: FormularZustand.AUFNEHMEN,
  kannAbschicken: true,
  kannAbbrechen: true,
  istSchreibgeschuetzt: false,
  sendenText: "Aufnehmen",
};

const aufnahmeVerarbeitenState: State = {
  ...aufnahmeAusgefuelltState,
  formularZustand: FormularZustand.VERARBEITEN,
  kannAbschicken: false,
  kannAbbrechen: false,
  istSchreibgeschuetzt: true,
  sendenText: SendenText.AUFNEHMEN,
};

const anzeigenState: State = {
  ...aufnahmeState,
  patient: {
    ...aufnahmeState.patient,
    nummer: 1,
    geburtsdatum: Temporal.PlainDate.from("1980-01-01"),
    vorname: "Max",
    nachname: "Mustermann",
  },
  formularZustand: FormularZustand.ANZEIGEN,
  kannAbschicken: true,
  kannAbbrechen: false,
  istSchreibgeschuetzt: true,
  sendenText: SendenText.BEARBEITEN,
};

const bearbeitungState: State = {
  ...anzeigenState,
  formularZustand: FormularZustand.BEARBEITEN,
  kannAbschicken: false,
  kannAbbrechen: true,
  istSchreibgeschuetzt: false,
  sendenText: SendenText.SPEICHERN,
};

const bearbeitungVerarbeitenState: State = {
  ...bearbeitungState,
  formularZustand: FormularZustand.VERARBEITEN,
  kannAbschicken: false,
  kannAbbrechen: false,
  istSchreibgeschuetzt: true,
  sendenText: SendenText.SPEICHERN,
};

describe("Patientenkarteikarte", () => {
  describe("Initialisiere Formular", () => {
    it("sollte initialisieren", () => {
      let state = initialState;

      state = reducer(
        state,
        initialisiereFormular({
          einstellungen: Einstellungen.createTestInstance(),
        }),
      );

      expect(state).toEqual<State>(aufnahmeState);
    });
  });

  describe("Feld aktualisiert", () => {
    it("sollte Formular als gültig markieren, wenn alle erforderlichen Felder ausgefüllt sind", () => {
      const log: State[] = [];
      let state = aufnahmeState;

      state = reducer(
        state,
        feldAktualisiert({
          feld: "geburtsdatum",
          wert: Temporal.PlainDate.from("1980-01-01"),
        }),
      );
      log.push(state);
      state = reducer(
        state,
        feldAktualisiert({ feld: "vorname", wert: "Max" }),
      );
      log.push(state);
      state = reducer(
        state,
        feldAktualisiert({ feld: "nachname", wert: "Mustermann" }),
      );
      log.push(state);

      expect(log).toEqual<State[]>([
        {
          ...aufnahmeState,
          patient: {
            ...aufnahmeState.patient,
            geburtsdatum: Temporal.PlainDate.from("1980-01-01"),
          },
          kannAbschicken: false,
          kannAbbrechen: true,
        },
        {
          ...aufnahmeState,
          patient: {
            ...aufnahmeState.patient,
            geburtsdatum: Temporal.PlainDate.from("1980-01-01"),
            vorname: "Max",
          },
          kannAbschicken: false,
          kannAbbrechen: true,
        },
        aufnahmeAusgefuelltState,
      ]);
    });
  });

  describe("Sende Formular", () => {
    it("sollte ausgefülltes Aufnahmeformular verarbeiten", () => {
      let state = aufnahmeAusgefuelltState;

      state = reducer(state, sendeFormular());

      expect(state).toEqual<State>(aufnahmeVerarbeitenState);
    });

    it("sollte Bearbeiten aktivieren", () => {
      let state = anzeigenState;

      state = reducer(state, sendeFormular());

      expect(state).toEqual<State>(bearbeitungState);
    });

    it("sollte bearbeitetes Formular verarbeiten", () => {
      let state = bearbeitungState;

      state = reducer(state, sendeFormular());

      expect(state).toEqual<State>(bearbeitungVerarbeitenState);
    });
  });

  describe("Verarbeitung abgeschlossen", () => {
    it("sollte Aufnehmen abschließen", () => {
      let state = aufnahmeVerarbeitenState;

      state = reducer(state, verarbeitungAbgeschlossen({ nummer: 1 }));

      expect(state).toEqual<State>(anzeigenState);
    });

    it("sollte Bearbeiten abschließen", () => {
      let state: State = bearbeitungVerarbeitenState;

      state = reducer(state, verarbeitungAbgeschlossen({}));

      expect(state).toEqual<State>(anzeigenState);
    });
  });

  describe("Eingabe abgebrochen", () => {
    it("sollte Aufnahme abbrechen", () => {
      let state = aufnahmeAusgefuelltState;
      state = reducer(
        state,
        feldAktualisiert({ feld: "vorname", wert: "Erika" }),
      );

      state = reducer(state, abgebrochen());

      expect(state).toEqual<State>(aufnahmeState);
    });

    it("sollte Bearbeiten abbrechen", () => {
      let state = bearbeitungState;
      // TODO discard changes
      //state = reducer(
      //  state,
      //  feldAktualisiert({ feld: "vorname", wert: "Erika" }),
      //);

      state = reducer(state, abgebrochen());

      expect(state).toEqual<State>(anzeigenState);
    });
  });

  describe("Patient gefunden", () => {
    it("sollte Patient finden", () => {
      let state = aufnahmeState;
      const patient = anzeigenState.patient as Patient;

      state = reducer(state, patientGefunden({ patient }));

      expect(state).toEqual<State>(anzeigenState);
    });

    it("sollte Patient nicht finden", () => {
      let state = aufnahmeState;

      state = reducer(state, patientGefunden({ patient: undefined }));

      expect(state).toEqual<State>(aufnahmeState);
    });
  });
});
