// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

import { describe, expect, it } from "vitest";

import { createTestConfiguration } from "../../src/main/domain/configuration";
import { createTestPatient } from "../../src/main/domain/naturheilpraxis";
import {
  cancelled,
  editing,
  init,
  patientAktualisiert,
  reducer,
  type State,
  submitted,
  submitting,
} from "../../src/renderer/ui/patientenkarteikarte-model";

describe("Patientenkarteikarte", () => {
  describe("Initialisierung", () => {
    it("Erstelle neue Patientenkarteikarte", () => {
      const configuration = createTestConfiguration();

      const state = init({ configuration });

      expect(state).toEqual({
        patient: {
          annahmejahr: new Date().getFullYear(),
          praxis: "Praxis 1",
          schluesselworte: ["Aktiv", "Weihnachtskarte"],
        },
        status: "new",
        canSubmit: false,
        canCancel: false,
        isReadOnly: false,
        submitButtonText: "Aufnehmen",
        configuration,
      });
    });

    it("Öffnen bestehende Patientenkarteikarte", () => {
      const patient = createTestPatient();
      const configuration = createTestConfiguration();

      const state = init({ patient, configuration });

      expect(state).toEqual({
        patient,
        status: "view",
        canSubmit: true,
        canCancel: false,
        isReadOnly: true,
        submitButtonText: "Bearbeiten",
        configuration,
      });
    });
  });

  describe("Nimm Patient auf", () => {
    it("Gib erforderliche Felder an", () => {
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
        patient: {
          geburtsdatum: "1980-01-01",
          vorname: "Max",
          nachname: "Mustermann",
          annahmejahr: new Date().getFullYear(),
          praxis: "Praxis 1",
          schluesselworte: ["Aktiv", "Weihnachtskarte"],
        },
        status: "new",
        canSubmit: true,
        canCancel: false,
        isReadOnly: false,
        submitButtonText: "Aufnehmen",
        configuration,
      });
    });

    it("Submitting", () => {
      const configuration = createTestConfiguration();
      let state: State = {
        patient: {
          geburtsdatum: "1980-01-01",
          vorname: "Max",
          nachname: "Mustermann",
          annahmejahr: new Date().getFullYear(),
          praxis: "Praxis 1",
          schluesselworte: ["Aktiv", "Weihnachtskarte"],
        },
        status: "new",
        canSubmit: true,
        canCancel: false,
        isReadOnly: false,
        submitButtonText: "Aufnehmen",
        configuration,
      };

      state = reducer(state, submitting());

      expect(state).toEqual({
        patient: {
          geburtsdatum: "1980-01-01",
          vorname: "Max",
          nachname: "Mustermann",
          annahmejahr: new Date().getFullYear(),
          praxis: "Praxis 1",
          schluesselworte: ["Aktiv", "Weihnachtskarte"],
        },
        status: "working",
        canSubmit: false,
        canCancel: false,
        isReadOnly: false,
        submitButtonText: "Aufnehmen",
        configuration,
      });
    });

    it("Submitted", () => {
      const configuration = createTestConfiguration();
      let state: State = {
        patient: {
          geburtsdatum: "1980-01-01",
          vorname: "Max",
          nachname: "Mustermann",
          annahmejahr: new Date().getFullYear(),
          praxis: "Praxis 1",
          schluesselworte: ["Aktiv", "Weihnachtskarte"],
        },
        status: "working",
        canSubmit: false,
        canCancel: false,
        isReadOnly: false,
        submitButtonText: "Aufnehmen",
        configuration,
      };

      state = reducer(state, submitted());

      expect(state).toEqual({
        patient: {
          geburtsdatum: "1980-01-01",
          vorname: "Max",
          nachname: "Mustermann",
          annahmejahr: new Date().getFullYear(),
          praxis: "Praxis 1",
          schluesselworte: ["Aktiv", "Weihnachtskarte"],
        },
        status: "view",
        canSubmit: true,
        canCancel: false,
        isReadOnly: true,
        submitButtonText: "Bearbeiten",
        configuration,
      });
    });
  });

  describe("Aktualisiere eine Patientenkarteikarte", () => {
    it("Ändere Nachname", () => {
      const patient = createTestPatient();
      const configuration = createTestConfiguration();
      let state = init({ patient, configuration });

      state = reducer(state, editing());
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

    it("submitting", () => {
      const patient = createTestPatient();
      const configuration = createTestConfiguration();
      let state: State = {
        patient: { ...patient, nachname: "Schmidt" },
        status: "edit",
        canSubmit: true,
        canCancel: false,
        isReadOnly: false,
        submitButtonText: "Speichern",
        configuration,
      };

      state = reducer(state, submitting());

      expect(state).toEqual({
        patient: { ...patient, nachname: "Schmidt" },
        status: "working",
        canSubmit: false,
        canCancel: false,
        isReadOnly: false,
        submitButtonText: "Speichern",
        configuration,
      });
    });

    it("submitted", () => {
      const patient = createTestPatient();
      const configuration = createTestConfiguration();
      let state: State = {
        patient: { ...patient, nachname: "Schmidt" },
        status: "working",
        canSubmit: false,
        canCancel: false,
        isReadOnly: false,
        submitButtonText: "Speichern",
        configuration,
      };

      state = reducer(state, submitted());

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

    it("cancelled", () => {
      const patient = createTestPatient();
      const configuration = createTestConfiguration();
      let state = init({ patient, configuration });

      state = reducer(state, editing());
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
  });
});
