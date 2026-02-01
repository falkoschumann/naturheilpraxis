// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

import type { FluxStandardActionAuto } from "flux-standard-action";

import { Patient } from "../../../../shared/domain/patient";

// region Actions and Action Creators

const INITIALISIERE_PATIENTENDATEN_ACTION = "initialisierePatientendaten";

type InitialisierePatientendatenPayload = Partial<Patient>;

export function initialisierePatientendaten(
  payload: InitialisierePatientendatenPayload = {},
): FluxStandardActionAuto<
  typeof INITIALISIERE_PATIENTENDATEN_ACTION,
  InitialisierePatientendatenPayload
> {
  return { type: INITIALISIERE_PATIENTENDATEN_ACTION, payload };
}

const AKTUALISIERE_FELD_ACTION = "aktualisiereFeld";

type AktualisiereFeldPayload = Partial<Patient>;

export function aktualisiereFeld(
  payload: AktualisiereFeldPayload,
): FluxStandardActionAuto<
  typeof AKTUALISIERE_FELD_ACTION,
  AktualisiereFeldPayload
> {
  return { type: AKTUALISIERE_FELD_ACTION, payload };
}

const SENDE_FORMULAR_ACTION = "sendeFormular";

export function sendeFormular(): FluxStandardActionAuto<
  typeof SENDE_FORMULAR_ACTION
> {
  return { type: SENDE_FORMULAR_ACTION, payload: undefined };
}

const BRICH_BEARBEITUNG_AB_ACTION = "brichBearbeitungAb";

export function brichBearbeitungAb(): FluxStandardActionAuto<
  typeof BRICH_BEARBEITUNG_AB_ACTION
> {
  return { type: BRICH_BEARBEITUNG_AB_ACTION, payload: undefined };
}

const VERARBEITUNG_ABGESCHLOSSEN_ACTION = "verarbeitungAbgeschlossen";

type VerarbeitungAbgeschlossenPayload = { nummer?: number };

export function verarbeitungAbgeschlossen(
  payload: VerarbeitungAbgeschlossenPayload = {},
): FluxStandardActionAuto<
  typeof VERARBEITUNG_ABGESCHLOSSEN_ACTION,
  VerarbeitungAbgeschlossenPayload
> {
  return { type: VERARBEITUNG_ABGESCHLOSSEN_ACTION, payload };
}

const ZEIGE_PATIENTENDATEN_AN_ACTION = "zeigePatientendatenAn";

type ZeigePatientendatenAnPayload = Patient;

export function zeigePatientendatenAn(
  payload: ZeigePatientendatenAnPayload,
): FluxStandardActionAuto<
  typeof ZEIGE_PATIENTENDATEN_AN_ACTION,
  ZeigePatientendatenAnPayload
> {
  return { type: ZEIGE_PATIENTENDATEN_AN_ACTION, payload };
}

const BEARBEITE_PATIENTENDATEN_ACTION = "bearbeitePatientendaten";

export function bearbeitePatientendaten(): FluxStandardActionAuto<
  typeof BEARBEITE_PATIENTENDATEN_ACTION
> {
  return { type: BEARBEITE_PATIENTENDATEN_ACTION, payload: undefined };
}

export type Action =
  | ReturnType<typeof initialisierePatientendaten>
  | ReturnType<typeof aktualisiereFeld>
  | ReturnType<typeof sendeFormular>
  | ReturnType<typeof brichBearbeitungAb>
  | ReturnType<typeof verarbeitungAbgeschlossen>
  | ReturnType<typeof zeigePatientendatenAn>
  | ReturnType<typeof bearbeitePatientendaten>;

// endregion
// region State

export const FormularZustand = Object.freeze({
  START: "Start",
  AUFNAHME: "Aufnahme",
  VERARBEITUNG: "Verarbeitung",
  ANZEIGE: "Anzeige",
  BEARBEITUNG: "Bearbeitung",
} as const);

export type FormularZustand =
  (typeof FormularZustand)[keyof typeof FormularZustand];

export interface State {
  patient: Partial<Patient>;
  prevPatient: Partial<Patient>;
  zustand: FormularZustand;
  nurLesen: boolean;
  sendenText: "Aufnehmen" | "Bearbeiten" | "Speichern";
  sendenDeaktiviert: boolean;
  abbrechenDeaktiviert: boolean;
}

export const initialState: State = {
  patient: {},
  prevPatient: {},
  zustand: FormularZustand.START,
  nurLesen: true,
  sendenText: "Bearbeiten",
  sendenDeaktiviert: true,
  abbrechenDeaktiviert: true,
};

// endregion
// region Reducer

export function reducer(state: State, action: Action): State {
  switch (action.type) {
    case INITIALISIERE_PATIENTENDATEN_ACTION:
      return {
        ...state,
        patient: { ...action.payload },
        prevPatient: { ...action.payload },
        zustand: FormularZustand.AUFNAHME,
        nurLesen: false,
        sendenText: "Aufnehmen",
        sendenDeaktiviert: true,
        abbrechenDeaktiviert: true,
      };
    case AKTUALISIERE_FELD_ACTION: {
      const patient = {
        ...state.patient,
        ...action.payload,
      };
      return {
        ...state,
        patient,
        sendenDeaktiviert: !validiereFormular(patient),
        abbrechenDeaktiviert: false,
      };
    }
    case SENDE_FORMULAR_ACTION:
      return {
        ...state,
        zustand: FormularZustand.VERARBEITUNG,
        nurLesen: true,
        sendenDeaktiviert: true,
        abbrechenDeaktiviert: true,
      };
    case BRICH_BEARBEITUNG_AB_ACTION:
      return {
        ...state,
        patient: { ...state.prevPatient },
        zustand:
          state.zustand === FormularZustand.AUFNAHME
            ? FormularZustand.AUFNAHME
            : FormularZustand.ANZEIGE,
        nurLesen: state.zustand !== FormularZustand.AUFNAHME,
        sendenText:
          state.zustand === FormularZustand.AUFNAHME
            ? "Aufnehmen"
            : "Bearbeiten",
        sendenDeaktiviert: true,
        abbrechenDeaktiviert: true,
      };
    case VERARBEITUNG_ABGESCHLOSSEN_ACTION:
      return {
        ...state,
        patient: {
          ...state.patient,
          nummer: state.patient.nummer ?? action.payload.nummer,
        },
        prevPatient: {
          ...state.patient,
          nummer: state.patient.nummer ?? action.payload.nummer,
        },
        zustand: FormularZustand.ANZEIGE,
        nurLesen: true,
        sendenText: "Bearbeiten",
        sendenDeaktiviert: false,
      };
    case ZEIGE_PATIENTENDATEN_AN_ACTION:
      return {
        ...state,
        patient: { ...action.payload },
        prevPatient: { ...action.payload },
        zustand: FormularZustand.ANZEIGE,
        nurLesen: true,
        sendenText: "Bearbeiten",
        sendenDeaktiviert: false,
        abbrechenDeaktiviert: true,
      };
    case BEARBEITE_PATIENTENDATEN_ACTION:
      return {
        ...state,
        zustand: FormularZustand.BEARBEITUNG,
        nurLesen: false,
        sendenText: "Speichern",
        abbrechenDeaktiviert: false,
      };
    default:
      return state;
  }
}

function validiereFormular(patient: Partial<Patient>): boolean {
  return (
    patient.geburtsdatum != null &&
    patient.annahmejahr != null &&
    Number.isInteger(patient.annahmejahr) &&
    patient.praxis != null &&
    patient.praxis.trim().length > 0 &&
    patient.vorname != null &&
    patient.vorname.trim().length > 0 &&
    patient.nachname != null &&
    patient.nachname.trim().length > 0
  );
}

// endregion
