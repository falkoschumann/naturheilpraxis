// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

import { createPatient, type Patient } from "../../main/domain/naturheilpraxis";
import type { Configuration } from "../../main/domain/configuration";
import type { FluxStandardAction } from "./reducer";

//
// Actions and Action Creators
//

const UPDATED_ACTION = "updated";

type UpdatedPayload = {
  feld: keyof Patient;
  wert: string | number | string[] | undefined;
};

export function updated(
  payload: UpdatedPayload,
): FluxStandardAction<typeof UPDATED_ACTION, UpdatedPayload> {
  return { type: UPDATED_ACTION, payload };
}

const SUBMIT_ACTION = "submit";

export function submit(): FluxStandardAction<typeof SUBMIT_ACTION> {
  return { type: SUBMIT_ACTION, payload: undefined };
}

const DONE_ACTION = "done";

type DonePayload = {
  nummer?: number;
};

export function done({
  nummer,
}: DonePayload): FluxStandardAction<typeof DONE_ACTION, DonePayload> {
  return { type: DONE_ACTION, payload: { nummer } };
}

const CANCELLED_ACTION = "cancelled";

export function cancelled(): FluxStandardAction<typeof CANCELLED_ACTION> {
  return { type: CANCELLED_ACTION, payload: undefined };
}

const FOUND_ACTION = "found";

type FoundPayload = { patient?: Patient };

export function found(
  payload: FoundPayload,
): FluxStandardAction<typeof FOUND_ACTION, FoundPayload> {
  return { type: FOUND_ACTION, payload };
}

//
// State and Reducer
//

export type FormState = "new" | "view" | "edit" | "working";

export type SubmitText = "Aufnehmen" | "Bearbeiten" | "Speichern";

export interface State {
  patient: Patient;
  state: FormState;
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
  configuration = window.naturheilpraxis.configuration,
}: {
  configuration?: Configuration;
} = {}): State {
  return {
    patient: createPatient({
      annahmejahr: new Date().getFullYear(),
      praxis: configuration.praxis[0],
      anrede: configuration.anrede[0],
      familienstand: configuration.familienstand[0],
      schluesselworte: configuration.defaultSchluesselworte,
    }),
    state: "new",
    canSubmit: false,
    canCancel: false,
    isReadOnly: false,
    submitButtonText: "Aufnehmen",
    configuration,
  };
}

export type Action =
  | ReturnType<typeof updated>
  | ReturnType<typeof submit>
  | ReturnType<typeof done>
  | ReturnType<typeof cancelled>
  | ReturnType<typeof found>;

export function reducer(state: State, action: Action): State {
  switch (action.type) {
    case UPDATED_ACTION: {
      const patient = {
        ...state.patient,
        [action.payload.feld]: action.payload.wert,
      };
      const canSubmit =
        patient.nachname.trim().length > 0 &&
        patient.vorname.trim().length > 0 &&
        patient.geburtsdatum.trim().length > 0 &&
        Number.isInteger(patient.annahmejahr) &&
        patient.praxis.trim().length > 0;
      const canCancel = true;
      return { ...state, patient, canSubmit, canCancel };
    }
    case SUBMIT_ACTION:
      switch (state.state) {
        case "new":
        case "edit":
          return {
            ...state,
            state: "working",
            canSubmit: false,
            canCancel: false,
            isReadOnly: true,
          };
        case "view":
          return {
            ...state,
            state: "edit",
            canSubmit: false,
            canCancel: true,
            isReadOnly: false,
            submitButtonText: "Speichern",
          };
        default:
          throw new Error(
            `Unexpected status in patientenkarteikarte reducer: ${state.state}`,
          );
      }
    case DONE_ACTION:
      return {
        ...state,
        patient: {
          ...state.patient,
          nummer: action.payload?.nummer || state.patient.nummer,
        },
        state: "view",
        canSubmit: true,
        isReadOnly: true,
        submitButtonText: "Bearbeiten",
      };
    case CANCELLED_ACTION:
      if (state.state === "new") {
        return init({ configuration: state.configuration });
      } else {
        return {
          ...state,
          state: "view",
          canSubmit: true,
          canCancel: false,
          isReadOnly: true,
          submitButtonText: "Bearbeiten",
        };
      }
    case FOUND_ACTION:
      if (action.payload.patient != null) {
        return {
          ...state,
          patient: action.payload.patient,
          state: "view",
          canSubmit: true,
          canCancel: false,
          isReadOnly: true,
          submitButtonText: "Bearbeiten",
        };
      } else {
        return init({ configuration: state.configuration });
      }
    default:
      throw new Error(
        `Unhandled action in patientenkarteikarte reducer: ${JSON.stringify(action)}`,
      );
  }
}
