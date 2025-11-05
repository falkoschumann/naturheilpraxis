// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

import type { FluxStandardActionAuto } from "flux-standard-action";

import type { Configuration } from "../../shared/domain/configuration";
import { Patient } from "../../shared/domain/naturheilpraxis";
import { Temporal } from "@js-temporal/polyfill";

//
// Actions and Action Creators
//

const CONFIGURE_ACTION = "configure";

type ConfigurePayload = {
  configuration: Configuration;
};

export function configure(
  payload: ConfigurePayload,
): FluxStandardActionAuto<typeof CONFIGURE_ACTION, ConfigurePayload> {
  return { type: CONFIGURE_ACTION, payload };
}

const UPDATED_ACTION = "updated";

type UpdatedPayload = {
  feld: keyof Patient;
  wert?: unknown;
};

export function updated(
  payload: UpdatedPayload,
): FluxStandardActionAuto<typeof UPDATED_ACTION, UpdatedPayload> {
  return { type: UPDATED_ACTION, payload };
}

const SUBMIT_ACTION = "submit";

export function submit(): FluxStandardActionAuto<typeof SUBMIT_ACTION> {
  return { type: SUBMIT_ACTION, payload: undefined };
}

const DONE_ACTION = "done";

type DonePayload = {
  nummer?: number;
};

export function done({
  nummer,
}: DonePayload): FluxStandardActionAuto<typeof DONE_ACTION, DonePayload> {
  return { type: DONE_ACTION, payload: { nummer } };
}

const CANCELLED_ACTION = "cancelled";

export function cancelled(): FluxStandardActionAuto<typeof CANCELLED_ACTION> {
  return { type: CANCELLED_ACTION, payload: undefined };
}

const FOUND_ACTION = "found";

type FoundPayload = { patient?: Patient };

export function found(
  payload: FoundPayload,
): FluxStandardActionAuto<typeof FOUND_ACTION, FoundPayload> {
  return { type: FOUND_ACTION, payload };
}

//
// State and Reducer
//

export const FormState = Object.freeze({
  NEW: "new",
  VIEW: "view",
  EDIT: "edit",
  WORKING: "working",
});

export type FormStateType = (typeof FormState)[keyof typeof FormState];

export const SubmitText = Object.freeze({
  AUFNEHMEN: "Aufnehmen",
  BEARBEITEN: "Bearbeiten",
  SPEICHERN: "Speichern",
});

export type SubmitTextType = (typeof SubmitText)[keyof typeof SubmitText];

export interface State {
  patient: Patient;
  state: FormStateType;
  canSubmit: boolean;
  canCancel: boolean;
  isReadOnly: boolean;
  submitButtonText: SubmitTextType;
  configuration: {
    praxis: string[];
    anrede: string[];
    familienstand: string[];
    schluesselworte: string[];
    defaultSchluesselworte: string[];
  };
}

export const initialState: State = {
  patient: Patient.create(),
  state: FormState.NEW,
  canSubmit: false,
  canCancel: false,
  isReadOnly: false,
  submitButtonText: SubmitText.AUFNEHMEN,
  configuration: {
    praxis: [],
    anrede: [],
    familienstand: [],
    schluesselworte: [],
    defaultSchluesselworte: [],
  },
};

export type Action =
  | ReturnType<typeof configure>
  | ReturnType<typeof updated>
  | ReturnType<typeof submit>
  | ReturnType<typeof done>
  | ReturnType<typeof cancelled>
  | ReturnType<typeof found>;

export function reducer(state: State, action: Action): State {
  switch (action.type) {
    case CONFIGURE_ACTION:
      return {
        patient: Patient.create({
          annahmejahr: new Date().getFullYear(),
          praxis: action.payload.configuration.praxis[0],
          anrede: action.payload.configuration.anrede[0],
          familienstand: action.payload.configuration.familienstand[0],
          schluesselworte: action.payload.configuration.defaultSchluesselworte,
        }),
        state: "new",
        canSubmit: false,
        canCancel: false,
        isReadOnly: false,
        submitButtonText: "Aufnehmen",
        configuration: action.payload.configuration,
      };
    case UPDATED_ACTION: {
      const patient = {
        ...state.patient,
        [action.payload.feld]: action.payload.wert,
      };
      const canSubmit =
        patient.nachname.trim().length > 0 &&
        patient.vorname.trim().length > 0 &&
        Temporal.PlainDate.compare(patient.geburtsdatum, "0001-01-01") >= 0 &&
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
        return {
          patient: Patient.create({
            annahmejahr: new Date().getFullYear(),
            praxis: state.configuration.praxis[0],
            anrede: state.configuration.anrede[0],
            familienstand: state.configuration.familienstand[0],
            schluesselworte: state.configuration.defaultSchluesselworte,
          }),
          state: "new",
          canSubmit: false,
          canCancel: false,
          isReadOnly: false,
          submitButtonText: "Aufnehmen",
          configuration: state.configuration,
        };
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
        return {
          patient: Patient.create({
            annahmejahr: new Date().getFullYear(),
            praxis: state.configuration.praxis[0],
            anrede: state.configuration.anrede[0],
            familienstand: state.configuration.familienstand[0],
            schluesselworte: state.configuration.defaultSchluesselworte,
          }),
          state: "new",
          canSubmit: false,
          canCancel: false,
          isReadOnly: false,
          submitButtonText: "Aufnehmen",
          configuration: state.configuration,
        };
      }
    default:
      throw new Error(
        `Unhandled action in patientenkarteikarte reducer: ${JSON.stringify(action)}.`,
      );
  }
}
