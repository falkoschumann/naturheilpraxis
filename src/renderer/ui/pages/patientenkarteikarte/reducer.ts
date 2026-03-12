// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

import type { FluxStandardActionAuto } from "flux-standard-action";

import { Patient } from "../../../../shared/domain/patient";

// region Actions and Action Creators

const INITIALISIERE_FORMULAR_ACTION = "initialisierePatientendaten";

type InitialisierePatientendatenPayload = Patient;

export function initialisiereFormular(
  payload: InitialisierePatientendatenPayload = {},
): FluxStandardActionAuto<
  typeof INITIALISIERE_FORMULAR_ACTION,
  InitialisierePatientendatenPayload
> {
  return { type: INITIALISIERE_FORMULAR_ACTION, payload };
}

const AKTUALISIERE_FELD_ACTION = "aktualisiereFeld";

type AktualisiereFeldPayload = Patient;

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

const BEARBEITE_PATIENTENDATEN_ACTION = "bearbeitePatientendaten";

export function bearbeitePatientendaten(): FluxStandardActionAuto<
  typeof BEARBEITE_PATIENTENDATEN_ACTION
> {
  return { type: BEARBEITE_PATIENTENDATEN_ACTION, payload: undefined };
}

export type Action =
  | ReturnType<typeof initialisiereFormular>
  | ReturnType<typeof aktualisiereFeld>
  | ReturnType<typeof sendeFormular>
  | ReturnType<typeof brichBearbeitungAb>
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
  patient: Patient;
  prevPatient: Patient;
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
    case INITIALISIERE_FORMULAR_ACTION:
      return doInitialisiereFormular(state, action);
    case AKTUALISIERE_FELD_ACTION:
      return doAktualisiereFeld(state, action);
    case SENDE_FORMULAR_ACTION:
      return doSendeFormular(state);
    case BRICH_BEARBEITUNG_AB_ACTION:
      return doBrichBearbeitungAb(state);
    case BEARBEITE_PATIENTENDATEN_ACTION:
      return doBearbeitePatientendaten(state);
    default:
      return state;
  }
}

function doInitialisiereFormular(
  state: State,
  action: ReturnType<typeof initialisiereFormular>,
): State {
  const istNeuerPatient = action.payload.nummer == null;
  return {
    ...state,
    patient: action.payload,
    prevPatient: action.payload,
    zustand: istNeuerPatient
      ? FormularZustand.AUFNAHME
      : FormularZustand.ANZEIGE,
    nurLesen: !istNeuerPatient,
    sendenText: istNeuerPatient ? "Aufnehmen" : "Bearbeiten",
    sendenDeaktiviert: istNeuerPatient,
  };
}

function doAktualisiereFeld(
  state: State,
  action: ReturnType<typeof aktualisiereFeld>,
): State {
  return {
    ...state,
    patient: { ...state.patient, ...action.payload },
    sendenDeaktiviert: false,
    abbrechenDeaktiviert: false,
  };
}

function doSendeFormular(state: State): State {
  return {
    ...state,
    zustand: FormularZustand.VERARBEITUNG,
    nurLesen: true,
    sendenDeaktiviert: true,
    abbrechenDeaktiviert: true,
  };
}

function doBrichBearbeitungAb(state: State): State {
  const istNeuerPatient = state.patient.nummer == null;
  return {
    ...state,
    patient: state.prevPatient,
    zustand: istNeuerPatient
      ? FormularZustand.AUFNAHME
      : FormularZustand.ANZEIGE,
    nurLesen: !istNeuerPatient,
    sendenText: istNeuerPatient ? "Aufnehmen" : "Bearbeiten",
    sendenDeaktiviert: istNeuerPatient,
    abbrechenDeaktiviert: true,
  };
}

function doBearbeitePatientendaten(state: State): State {
  return {
    ...state,
    zustand: FormularZustand.BEARBEITUNG,
    nurLesen: false,
    sendenText: "Speichern",
    sendenDeaktiviert: true,
    abbrechenDeaktiviert: false,
  };
}

// endregion
