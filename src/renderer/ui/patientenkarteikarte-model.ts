// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

import type { Patient } from "../../main/domain/naturheilpraxis";
import type { Configuration } from "../../main/domain/configuration";

export type Status = "new" | "view" | "edit" | "working";

export type SubmitText = "Aufnehmen" | "Bearbeiten" | "Speichern";

export interface State {
  patient: Partial<Patient>;
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
  patient,
  configuration,
}: {
  patient?: Patient;
  configuration: Configuration;
}): State {
  return {
    patient: {
      ...patient,
      annahmejahr: patient?.annahmejahr ?? new Date().getFullYear(),
      praxis: patient?.praxis ?? configuration.praxis[0],
      schluesselworte:
        patient?.schluesselworte ?? configuration.defaultSchluesselworte,
    },
    status: patient ? "view" : "new",
    canSubmit: patient != null,
    canCancel: false,
    isReadOnly: patient != null,
    submitButtonText: patient ? "Bearbeiten" : "Aufnehmen",
    configuration,
  };
}

type FluxStandardAction<T extends string = string, P = undefined> = {
  type: T;
  payload: P;
};

export type Action =
  | ReturnType<typeof patientAktualisiert>
  | ReturnType<typeof submitting>
  | ReturnType<typeof submitted>
  | ReturnType<typeof editing>
  | ReturnType<typeof cancelled>;

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
    case EDITING_ACTION:
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
    default:
      console.warn("Unhandled action type:", action);
      return state;
  }
}

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

const EDITING_ACTION = "editing";

export function editing(): FluxStandardAction<typeof EDITING_ACTION> {
  return { type: EDITING_ACTION, payload: undefined };
}

const CANCELLED_ACTION = "cancelled";

export function cancelled(): FluxStandardAction<typeof CANCELLED_ACTION> {
  return { type: CANCELLED_ACTION, payload: undefined };
}
