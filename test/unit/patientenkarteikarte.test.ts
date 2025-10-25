// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

import { describe, expect, it } from "vitest";

import { createTestConfiguration } from "../../src/shared/domain/configuration";
import {
  cancelled,
  done,
  found,
  init,
  reducer,
  type State,
  submit,
  updated,
} from "../../src/renderer/domain/patientenkarteikarte";

const initialState: State = init({ configuration: createTestConfiguration() });

const newState: State = {
  ...initialState,
  patient: {
    ...initialState.patient,
    geburtsdatum: "1980-01-01",
    vorname: "Max",
    nachname: "Mustermann",
  },
  state: "new",
  canSubmit: true,
  canCancel: true,
  isReadOnly: false,
  submitButtonText: "Aufnehmen",
};

const workingNewState: State = {
  ...newState,
  state: "working",
  canSubmit: false,
  canCancel: false,
  isReadOnly: true,
  submitButtonText: "Aufnehmen",
};

const viewState: State = {
  ...initialState,
  patient: {
    ...initialState.patient,
    nummer: 1,
    geburtsdatum: "1980-01-01",
    vorname: "Max",
    nachname: "Mustermann",
  },
  state: "view",
  canSubmit: true,
  canCancel: false,
  isReadOnly: true,
  submitButtonText: "Bearbeiten",
};

const editState: State = {
  ...viewState,
  state: "edit",
  canSubmit: false,
  canCancel: true,
  isReadOnly: false,
  submitButtonText: "Speichern",
};

const workingEditState: State = {
  ...editState,
  state: "working",
  canSubmit: false,
  canCancel: false,
  isReadOnly: true,
  submitButtonText: "Speichern",
};

describe("Patientenkarteikarte reducer", () => {
  it("Initialisierung", () => {
    const expectedState: State = {
      patient: {
        nummer: -1,
        nachname: "",
        vorname: "",
        geburtsdatum: "",
        annahmejahr: new Date().getFullYear(),
        praxis: "Praxis 1",
        anrede: "Herr",
        familienstand: "ledig",
        schluesselworte: ["Aktiv", "Weihnachtskarte"],
      },
      state: "new",
      canSubmit: false,
      canCancel: false,
      isReadOnly: false,
      submitButtonText: "Aufnehmen",
      configuration: createTestConfiguration(),
    };
    expect(initialState).toEqual<State>(expectedState);
  });

  describe("Aufnahme (new)", () => {
    it("Updated", () => {
      const log: State[] = [];
      let state = initialState;

      state = reducer(
        state,
        updated({ feld: "geburtsdatum", wert: "1980-01-01" }),
      );
      log.push(state);
      state = reducer(state, updated({ feld: "vorname", wert: "Max" }));
      log.push(state);
      state = reducer(state, updated({ feld: "nachname", wert: "Mustermann" }));
      log.push(state);

      expect(log).toEqual<State[]>([
        {
          ...initialState,
          patient: {
            ...initialState.patient,
            geburtsdatum: "1980-01-01",
          },
          canSubmit: false,
          canCancel: true, // Cancellable after update
        },
        {
          ...initialState,
          patient: {
            ...initialState.patient,
            geburtsdatum: "1980-01-01",
            vorname: "Max",
          },
          canSubmit: false,
          canCancel: true,
        },
        {
          ...initialState,
          patient: {
            ...initialState.patient,
            geburtsdatum: "1980-01-01",
            vorname: "Max",
            nachname: "Mustermann",
          },
          canSubmit: true, // Patient information is now complete
          canCancel: true,
        },
      ]);
    });

    it("Submit", () => {
      let state = newState;

      state = reducer(state, submit());

      expect(state).toEqual<State>({
        ...newState,
        state: "working",
        canSubmit: false,
        canCancel: false,
        isReadOnly: true,
        submitButtonText: "Aufnehmen",
      });
    });

    it("Cancelled", () => {
      let state = newState;

      state = reducer(state, cancelled());

      expect(state).toEqual<State>(initialState);
    });

    it("Found with patient", () => {
      let state = initialState;
      const patient = viewState.patient;

      state = reducer(state, found({ patient }));

      expect(state).toEqual<State>(viewState);
    });

    it("Found without patient", () => {
      let state = initialState;

      state = reducer(state, found({ patient: undefined }));

      expect(state).toEqual<State>(initialState);
    });
  });

  describe("Verarbeiten (working)", () => {
    it("Done from new", () => {
      let state = workingNewState;

      state = reducer(state, done({ nummer: 1 }));

      expect(state).toEqual<State>(viewState);
    });

    it("Done from edit", () => {
      let state: State = workingEditState;

      state = reducer(state, done({}));

      expect(state).toEqual<State>(viewState);
    });
  });

  describe("Anzeigen (view)", () => {
    it("Submit", () => {
      let state = viewState;

      state = reducer(state, submit());

      expect(state).toEqual<State>(editState);
    });
  });

  describe("Bearbeiten (edit)", () => {
    it("Updated", () => {
      let state = editState;

      state = reducer(state, updated({ feld: "vorname", wert: "Erika" }));

      expect(state).toEqual<State>({
        ...editState,
        patient: {
          ...editState.patient,
          vorname: "Erika",
        },
        canSubmit: true,
        canCancel: true,
      });
    });

    it("Submit", () => {
      let state = editState;

      state = reducer(state, submit());

      expect(state).toEqual<State>({
        ...viewState,
        state: "working",
        canSubmit: false,
        submitButtonText: "Speichern",
      });
    });

    it("Cancelled", () => {
      let state = editState;

      // TODO discard changes
      state = reducer(state, cancelled());

      expect(state).toEqual<State>(viewState);
    });
  });
});
