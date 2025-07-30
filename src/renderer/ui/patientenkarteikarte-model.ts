// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

import { createPatient, type Patient } from "../../main/domain/naturheilpraxis";
import type { Configuration } from "../../main/domain/configuration";

export type Status = "new" | "view" | "edit" | "working";

export type SubmitText = "Aufnehmen" | "Bearbeiten" | "Speichern";

export interface State {
  patient: Patient;
  status: Status;
  canSubmit: boolean;
  canCancel: boolean;
  isReadOnly: boolean;
  submitButtonText: SubmitText;
  configuration: {
    praxis: string[];
    anrede: string[];
    familienstand: string[];
    schluesselworte: string[];
    defaultSchluesselworte: string[];
  };
}

export function init({
  configuration,
}: {
  configuration: Configuration;
}): State {
  return {
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
  };
}

export type Action =
  | ReturnType<typeof patientAktualisiert>
  | ReturnType<typeof submitting>
  | ReturnType<typeof submitted>
  | ReturnType<typeof view>
  | ReturnType<typeof edit>
  | ReturnType<typeof cancelled>
  | ReturnType<typeof reset>;

export function reducer(state: State, action: Action): State {
  switch (action.type) {
    case PATIENT_AKTUALISIERT_ACTION: {
      const patient = {
        ...state.patient,
        [action.payload.feld]: action.payload.wert,
      };
      const canSubmit =
        patient.geburtsdatum != null &&
        patient.geburtsdatum.trim().length > 0 &&
        patient.annahmejahr != null &&
        patient.praxis != null &&
        patient.praxis.trim().length > 0 &&
        patient.vorname != null &&
        patient.vorname.trim().length > 0 &&
        patient.nachname != null &&
        patient.nachname.trim().length > 0;

      return { ...state, patient, canSubmit };
    }
    case SUBMITTING_ACTION:
      return {
        ...state,
        status: "working",
        canSubmit: false,
      };
    case SUBMITTED_ACTION:
      return {
        ...state,
        status: "view",
        canSubmit: true,
        isReadOnly: true,
        submitButtonText: "Bearbeiten",
      };
    case VIEW_ACTION:
      return {
        ...state,
        patient: action.payload.patient,
        status: "view",
        canSubmit: true,
        canCancel: false,
        isReadOnly: true,
        submitButtonText: "Bearbeiten",
      };
    case EDIT_ACTION:
      return {
        ...state,
        status: "edit",
        canCancel: true,
        isReadOnly: false,
        submitButtonText: "Speichern",
      };
    case CANCELLED_ACTION:
      return {
        ...state,
        status: "view",
        canSubmit: true,
        canCancel: false,
        isReadOnly: true,
        submitButtonText: "Bearbeiten",
      };
    case RESET_ACTION:
      return init({ configuration: state.configuration });
    default:
      throw new Error(`Unhandled action type: ${JSON.stringify(action)}`);
  }
}

type FluxStandardAction<T extends string = string, P = undefined> = {
  type: T;
  payload: P;
};

const PATIENT_AKTUALISIERT_ACTION = "patientAktualisiert";

type PatientAktualisiertPayload = {
  feld: keyof Patient;
  wert: string | number | string[] | undefined;
};

export function patientAktualisiert(
  payload: PatientAktualisiertPayload,
): FluxStandardAction<
  typeof PATIENT_AKTUALISIERT_ACTION,
  PatientAktualisiertPayload
> {
  return { type: PATIENT_AKTUALISIERT_ACTION, payload };
}

const SUBMITTING_ACTION = "submitting";

export function submitting(): FluxStandardAction<typeof SUBMITTING_ACTION> {
  return { type: SUBMITTING_ACTION, payload: undefined };
}

const SUBMITTED_ACTION = "submitted";

export function submitted(): FluxStandardAction<typeof SUBMITTED_ACTION> {
  return { type: SUBMITTED_ACTION, payload: undefined };
}

const VIEW_ACTION = "view";

type ViewPayload = { patient: Patient };

export function view(
  payload: ViewPayload,
): FluxStandardAction<typeof VIEW_ACTION, ViewPayload> {
  return { type: VIEW_ACTION, payload };
}

const EDIT_ACTION = "edit";

export function edit(): FluxStandardAction<typeof EDIT_ACTION> {
  return { type: EDIT_ACTION, payload: undefined };
}

const CANCELLED_ACTION = "cancelled";

export function cancelled(): FluxStandardAction<typeof CANCELLED_ACTION> {
  return { type: CANCELLED_ACTION, payload: undefined };
}

const RESET_ACTION = "reset";

export function reset(): FluxStandardAction<typeof RESET_ACTION> {
  return { type: RESET_ACTION, payload: undefined };
}
