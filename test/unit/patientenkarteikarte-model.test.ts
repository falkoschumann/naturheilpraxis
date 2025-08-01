// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

// @vitest-environment jsdom

import { describe, expect, it } from "vitest";

import { createTestConfiguration } from "../../src/main/domain/configuration";
import {
  createPatient,
  createTestPatient,
} from "../../src/main/domain/naturheilpraxis";
import {
  type Action,
  cancelled,
  edit,
  findePatient,
  init,
  patientAktualisiert,
  reducer,
  reset,
  type State,
  submit,
  type Thunk,
  view,
} from "../../src/renderer/ui/patientenkarteikarte-model";
import { Failure } from "../../src/main/common/messages";

describe("Patientenkarteikarte", () => {
  it("Initialisiere Patientenkarteikarte", () => {
    const configuration = createTestConfiguration();

    const state = init({ configuration });

    expect(state).toEqual({
      patient: createPatient({
        anrede: "Herr",
        annahmejahr: new Date().getFullYear(),
        praxis: "Praxis 1",
        familienstand: "ledig",
        schluesselworte: ["Aktiv", "Weihnachtskarte"],
      }),
      status: "new",
      canSubmit: false,
      canCancel: false,
      isReadOnly: false,
      submitButtonText: "Aufnehmen",
      configuration,
    });
  });

  it("Finde Patient", async () => {
    const configuration = createTestConfiguration();
    const patient = createTestPatient();
    window.naturheilpraxis = {
      configuration,
      nimmPatientAuf: () => Promise.resolve(new Failure("Unknown error")),
      patientenkartei: () => Promise.resolve({ patienten: [patient] }),
    };
    const state = init({ configuration });

    const store = new StoreFake(state);
    await store.dispatch(findePatient({ nummer: 1 }));

    expect(store.getState()).toEqual({
      patient,
      status: "view",
      canSubmit: true,
      canCancel: false,
      isReadOnly: true,
      submitButtonText: "Bearbeiten",
      configuration,
    });
  });

  describe("Nimm Patient auf", () => {
    it("Enter required fields", () => {
      const configuration = createTestConfiguration();
      let state = init({ configuration });

      state = reducer(
        state,
        patientAktualisiert({ feld: "geburtsdatum", wert: "1980-01-01" }),
      );
      expect(state.canSubmit).toBe(false);
      state = reducer(
        state,
        patientAktualisiert({ feld: "vorname", wert: "Max" }),
      );
      expect(state.canSubmit).toBe(false);
      state = reducer(
        state,
        patientAktualisiert({ feld: "nachname", wert: "Mustermann" }),
      );

      expect(state).toEqual({
        patient: createPatient({
          geburtsdatum: "1980-01-01",
          anrede: "Herr",
          vorname: "Max",
          nachname: "Mustermann",
          annahmejahr: new Date().getFullYear(),
          praxis: "Praxis 1",
          familienstand: "ledig",
          schluesselworte: ["Aktiv", "Weihnachtskarte"],
        }),
        status: "new",
        canSubmit: true,
        canCancel: false,
        isReadOnly: false,
        submitButtonText: "Aufnehmen",
        configuration,
      });
    });

    it("Submit", async () => {
      const configuration = createTestConfiguration();
      window.naturheilpraxis = {
        configuration,
        nimmPatientAuf: () => Promise.resolve({ success: true, nummer: 1 }),
        patientenkartei: () => Promise.resolve({ patienten: [] }),
      };
      const initialState: State = {
        patient: createPatient({
          geburtsdatum: "1980-01-01",
          vorname: "Max",
          nachname: "Mustermann",
          annahmejahr: new Date().getFullYear(),
          praxis: "Praxis 1",
          schluesselworte: ["Aktiv", "Weihnachtskarte"],
        }),
        status: "new",
        canSubmit: true,
        canCancel: false,
        isReadOnly: false,
        submitButtonText: "Aufnehmen",
        configuration,
      };

      const store = new StoreFake(initialState);
      await store.dispatch(submit());

      expect(store.log).toEqual([
        initialState,
        {
          patient: createPatient({
            geburtsdatum: "1980-01-01",
            vorname: "Max",
            nachname: "Mustermann",
            annahmejahr: new Date().getFullYear(),
            praxis: "Praxis 1",
            schluesselworte: ["Aktiv", "Weihnachtskarte"],
          }),
          status: "working",
          canSubmit: false,
          canCancel: false,
          isReadOnly: false,
          submitButtonText: "Aufnehmen",
          configuration,
        },
        {
          patient: createPatient({
            geburtsdatum: "1980-01-01",
            vorname: "Max",
            nachname: "Mustermann",
            annahmejahr: new Date().getFullYear(),
            praxis: "Praxis 1",
            schluesselworte: ["Aktiv", "Weihnachtskarte"],
          }),
          status: "view",
          canSubmit: true,
          canCancel: false,
          isReadOnly: true,
          submitButtonText: "Bearbeiten",
          configuration,
        },
      ]);
    });
  });

  describe("Aktualisiere eine Patientenkarteikarte", () => {
    it("Change Nachname", () => {
      const patient = createTestPatient();
      const configuration = createTestConfiguration();
      let state = init({ configuration });

      state = reducer(state, view({ patient }));
      expect(state).toEqual({
        patient,
        status: "view",
        canSubmit: true,
        canCancel: false,
        isReadOnly: true,
        submitButtonText: "Bearbeiten",
        configuration,
      });
      state = reducer(state, edit());
      expect(state.status).toEqual("edit");
      expect(state.isReadOnly).toEqual(false);
      state = reducer(
        state,
        patientAktualisiert({ feld: "nachname", wert: "Schmidt" }),
      );

      expect(state).toEqual({
        patient: { ...patient, nachname: "Schmidt" },
        status: "edit",
        canSubmit: true,
        canCancel: true,
        isReadOnly: false,
        submitButtonText: "Speichern",
        configuration,
      });
    });

    it("Submit", async () => {
      const configuration = createTestConfiguration();
      const patient = createTestPatient();
      window.naturheilpraxis = {
        configuration,
        nimmPatientAuf: () =>
          Promise.resolve({ success: true, nummer: patient.nummer }),
        patientenkartei: () => Promise.resolve({ patienten: [] }),
      };
      const initialState: State = {
        patient: { ...patient, nachname: "Schmidt" },
        status: "edit",
        canSubmit: true,
        canCancel: false,
        isReadOnly: false,
        submitButtonText: "Speichern",
        configuration,
      };

      const store = new StoreFake(initialState);
      await store.dispatch(submit());

      expect(store.log).toEqual([
        initialState,
        {
          patient: { ...patient, nachname: "Schmidt" },
          status: "working",
          canSubmit: false,
          canCancel: false,
          isReadOnly: false,
          submitButtonText: "Speichern",
          configuration,
        },
        {
          patient: { ...patient, nachname: "Schmidt" },
          status: "view",
          canSubmit: true,
          canCancel: false,
          isReadOnly: true,
          submitButtonText: "Bearbeiten",
          configuration,
        },
      ]);
    });

    it("Cancelled", () => {
      const patient = createTestPatient();
      const configuration = createTestConfiguration();
      let state = init({ configuration });
      state = reducer(state, view({ patient }));

      state = reducer(state, edit());
      expect(state.status).toEqual("edit");
      expect(state.canCancel).toEqual(true);
      expect(state.isReadOnly).toEqual(false);
      state = reducer(
        state,
        patientAktualisiert({ feld: "nachname", wert: "Schmidt" }),
      );
      state = reducer(state, cancelled());

      // TODO reset patient to original state or get new projection
      expect(state).toEqual({
        patient: { ...patient, nachname: "Schmidt" },
        status: "view",
        canSubmit: true,
        canCancel: false,
        isReadOnly: true,
        submitButtonText: "Bearbeiten",
        configuration,
      });
    });

    it("Reset", () => {
      const patient = createTestPatient();
      const configuration = createTestConfiguration();
      let state = init({ configuration });
      state = reducer(state, view({ patient }));

      state = reducer(state, reset());

      expect(state).toEqual({
        patient: createPatient({
          annahmejahr: new Date().getFullYear(),
          praxis: configuration.praxis[0],
          anrede: configuration.anrede[0],
          familienstand: configuration.familienstand[0],
          schluesselworte: configuration.defaultSchluesselworte,
        }),
        status: "new",
        canSubmit: false,
        canCancel: false,
        isReadOnly: false,
        submitButtonText: "Aufnehmen",
        configuration,
      });
    });
  });
});

class StoreFake {
  log: State[] = [];

  constructor(initialState: State) {
    this.log.push(initialState);
  }

  getState(): State {
    return this.log.slice(-1)[0];
  }

  dispatch<T>(action: Action | Thunk<Action, State, T>): void | T {
    if (typeof action === "function") {
      const thunk = action as Thunk<Action, State, T>;
      return thunk(this.dispatch.bind(this), this.getState.bind(this));
    }

    const state = reducer(this.getState(), action);
    this.log.push(state);
  }
}
