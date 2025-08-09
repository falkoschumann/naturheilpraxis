// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

// @vitest-environment jsdom

import { describe, expect, it } from "vitest";

import {
  type Configuration,
  createTestConfiguration,
} from "../../src/main/domain/configuration";
import {
  createPatient,
  createTestPatient,
  type NimmPatientAufCommandStatus,
  type PatientenkarteiQueryResult,
} from "../../src/main/domain/naturheilpraxis";
import {
  type Action,
  cancel,
  findePatient,
  init,
  reducer,
  type State,
  submit,
  updated,
} from "../../src/renderer/ui/patientenkarteikarte-reducer";
import { Failure } from "../../src/main/common/messages";
import { Store } from "../../src/renderer/ui/reducer";

describe("Patientenkarteikarte", () => {
  describe("Nimm Patient auf", () => {
    describe("Erfasse Informationen wie Name, Geburtsdatum, Praxis, Annahmejahr, Anschrift, Kontaktmöglichkeit", () => {
      it("Aufnehmen", async () => {
        const store = createStore({
          nimmPatientAuf: { success: true, nummer: 1 },
        });

        store.dispatch(updated({ feld: "geburtsdatum", wert: "1980-01-01" }));
        store.dispatch(updated({ feld: "vorname", wert: "Max" }));
        store.dispatch(updated({ feld: "nachname", wert: "Mustermann" }));
        await store.dispatch(submit());

        expect(store.getLog()).toEqual([
          configuredState,
          {
            ...configuredState,
            patient: {
              ...configuredState.patient,
              geburtsdatum: "1980-01-01",
            },
            canSubmit: false,
            canCancel: true,
          },
          {
            ...configuredState,
            patient: {
              ...configuredState.patient,
              geburtsdatum: "1980-01-01",
              vorname: "Max",
            },
            canSubmit: false,
            canCancel: true,
          },
          {
            ...configuredState,
            patient: {
              ...configuredState.patient,
              geburtsdatum: "1980-01-01",
              vorname: "Max",
              nachname: "Mustermann",
            },
            canSubmit: true,
            canCancel: true,
          },
          {
            ...configuredState,
            patient: {
              ...configuredState.patient,
              geburtsdatum: "1980-01-01",
              vorname: "Max",
              nachname: "Mustermann",
            },
            status: "working",
            canSubmit: false,
            canCancel: false,
            isReadOnly: true,
          },
          {
            ...configuredState,
            patient: {
              ...configuredState.patient,
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
          },
        ]);
      });

      it("Abbrechen", async () => {
        const store = createStore({});

        store.dispatch(updated({ feld: "geburtsdatum", wert: "1980-01-01" }));
        store.dispatch(updated({ feld: "vorname", wert: "Max" }));
        store.dispatch(updated({ feld: "nachname", wert: "Mustermann" }));
        await store.dispatch(cancel());

        expect(store.getLog()).toEqual([
          configuredState,
          {
            ...configuredState,
            patient: {
              ...configuredState.patient,
              geburtsdatum: "1980-01-01",
            },
            canSubmit: false,
            canCancel: true,
          },
          {
            ...configuredState,
            patient: {
              ...configuredState.patient,
              geburtsdatum: "1980-01-01",
              vorname: "Max",
            },
            canSubmit: false,
            canCancel: true,
          },
          {
            ...configuredState,
            patient: {
              ...configuredState.patient,
              geburtsdatum: "1980-01-01",
              vorname: "Max",
              nachname: "Mustermann",
            },
            canSubmit: true,
            canCancel: true,
          },
          configuredState,
        ]);
      });
    });

    describe("Aktualisiert eine Patientenkarteikarte", () => {
      it("Speichern", async () => {
        const patient = createTestPatient();
        const store = createStore({
          patientenkartei: { patienten: [patient] },
        });

        await store.dispatch(findePatient({ nummer: 1 }));
        store.dispatch(submit());
        store.dispatch(updated({ feld: "nachname", wert: "Schmidt" }));
        await store.dispatch(submit());

        expect(store.getLog()).toEqual([
          configuredState,
          {
            ...configuredState,
            patient,
            status: "view",
            canSubmit: true,
            canCancel: false,
            isReadOnly: true,
            submitButtonText: "Bearbeiten",
          },
          {
            ...configuredState,
            patient,
            status: "edit",
            canSubmit: true,
            canCancel: true,
            isReadOnly: false,
            submitButtonText: "Speichern",
          },
          {
            ...configuredState,
            patient: { ...patient, nachname: "Schmidt" },
            status: "edit",
            canSubmit: true,
            canCancel: true,
            isReadOnly: false,
            submitButtonText: "Speichern",
          },
          {
            ...configuredState,
            patient: { ...patient, nachname: "Schmidt" },
            status: "working",
            canSubmit: false,
            canCancel: false,
            isReadOnly: true,
            submitButtonText: "Speichern",
          },
          {
            ...configuredState,
            patient: { ...patient, nachname: "Schmidt" },
            status: "view",
            canSubmit: true,
            canCancel: false,
            isReadOnly: true,
            submitButtonText: "Bearbeiten",
          },
        ]);
      });

      it("Abbrechen", async () => {
        const patient = createTestPatient();
        const store = createStore({
          patientenkartei: { patienten: [patient] },
        });

        await store.dispatch(findePatient({ nummer: 1 }));
        store.dispatch(submit());
        store.dispatch(updated({ feld: "nachname", wert: "Schmidt" }));
        await store.dispatch(cancel());

        expect(store.getLog()).toEqual([
          configuredState,
          {
            ...configuredState,
            patient,
            status: "view",
            canSubmit: true,
            canCancel: false,
            isReadOnly: true,
            submitButtonText: "Bearbeiten",
          },
          {
            ...configuredState,
            patient,
            status: "edit",
            canSubmit: true,
            canCancel: true,
            isReadOnly: false,
            submitButtonText: "Speichern",
          },
          {
            ...configuredState,
            patient: { ...patient, nachname: "Schmidt" },
            status: "edit",
            canSubmit: true,
            canCancel: true,
            isReadOnly: false,
            submitButtonText: "Speichern",
          },
          {
            ...configuredState,
            patient,
            status: "view",
            canSubmit: true,
            canCancel: false,
            isReadOnly: true,
            submitButtonText: "Bearbeiten",
          },
        ]);
      });
    });
  });
});

function createStore({
  configuration = createTestConfiguration(),
  nimmPatientAuf = new Failure("Nulled failure"),
  patientenkartei = { patienten: [] },
}: {
  configuration?: Configuration;
  nimmPatientAuf?: NimmPatientAufCommandStatus;
  patientenkartei?: PatientenkarteiQueryResult;
}): Store<State, Action> {
  window.naturheilpraxis = {
    configuration,
    nimmPatientAuf: () => Promise.resolve(nimmPatientAuf),
    patientenkartei: () => Promise.resolve(patientenkartei),
  };
  return Store.create(reducer, { configuration }, init);
}

const configuredState: State = {
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
  configuration: createTestConfiguration(),
} as const;
