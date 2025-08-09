// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

import { describe, expect, it } from "vitest";

import { createTestConfiguration } from "../../src/main/domain/configuration";
import {
  cancelled,
  done,
  found,
  init,
  reducer,
  type State,
  submit2,
  updated
} from "../../src/renderer/ui/patientenkarteikarte-reducer";

const initialState: State = init({ configuration: createTestConfiguration() });

const newState: State = {
  ...initialState,
  patient: {
    ...initialState.patient,
    geburtsdatum: "1980-01-01",
    vorname: "Max",
    nachname: "Mustermann",
  },
  status: "new",
  canSubmit: true,
  canCancel: true,
  isReadOnly: false,
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
  status: "view",
  canSubmit: true,
  canCancel: false,
  isReadOnly: true,
  submitButtonText: "Bearbeiten",
};

const workingState: State = {
  ...newState,
  status: "working",
  canSubmit: false,
  canCancel: false,
  isReadOnly: true,
  submitButtonText: "Aufnehmen",
};

const editState: State = {
  ...viewState,
  status: "edit",
  canSubmit: true, // TODO could be false if no changes
  canCancel: true,
  isReadOnly: false,
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
      status: "new",
      canSubmit: false,
      canCancel: false,
      isReadOnly: false,
      submitButtonText: "Aufnehmen",
      configuration: createTestConfiguration(),
    };
    expect(initialState).toEqual(expectedState);
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

      expect(log).toEqual([
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

      state = reducer(state, submit2());

      expect(state).toEqual({
        ...newState,
        status: "working",
        canSubmit: false,
        canCancel: false,
        isReadOnly: true,
        submitButtonText: "Aufnehmen",
      });
    });

    it("Cancelled", () => {
      let state = newState;

      state = reducer(state, cancelled());

      expect(state).toEqual(initialState);
    });

    it("Found", () => {
      let state = initialState;
      const patient = viewState.patient;

      state = reducer(state, found({ patient }));

      expect(state).toEqual(viewState);
    });
  });

  describe("Verarbeiten (working)", () => {
    it("Done from new", () => {
      let state = workingState;

      state = reducer(state, done({ nummer: 1, success: true }));

      expect(state).toEqual(viewState);
    });

    it("Done from edit", () => {
      let state: State = {
        ...viewState,
        status: "working",
        canSubmit: false,
        submitButtonText: "Speichern",
      };

      // TODO nummer should be optional, because it is not needed for updates
      state = reducer(state, done({ nummer: 1, success: true }));

      expect(state).toEqual(viewState);
    });
  });

  describe("Anzeigen (view)", () => {
    it("Submit", () => {
      let state = viewState;

      state = reducer(state, submit2());

      expect(state).toEqual(editState);
    });
  });

  describe("Bearbeiten (edit)", () => {
    it("Updated", () => {
      let state = editState;

      state = reducer(state, updated({ feld: "vorname", wert: "Erika" }));

      expect(state).toEqual({
        ...editState,
        patient: {
          ...editState.patient,
          vorname: "Erika",
        },
        canCancel: true,
      });
    });

    it("Submit", () => {
      let state = editState;

      state = reducer(state, submit2());

      expect(state).toEqual({
        ...viewState,
        status: "working",
        canSubmit: false,
        submitButtonText: "Speichern",
      });
    });

    it("Cancelled", () => {
      let state = editState;

      // TODO discard changes
      state = reducer(state, cancelled());

      expect(state).toEqual(viewState);
    });
  });
});
