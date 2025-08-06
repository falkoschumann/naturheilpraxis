// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

import {
  createPatient,
  type NimmPatientAufCommandStatus,
  type Patient,
  type PatientenkarteiQuery,
} from "../../main/domain/naturheilpraxis";
import type { Configuration } from "../../main/domain/configuration";
import {
  type FluxStandardAction,
  type ThunkAction,
  useThunkReducer,
} from "./reducer";

//
// Hooks
//

export function usePatientenkarteikarte() {
  return useThunkReducer(reducer, {}, init);
}

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

const SUBMITTING_ACTION = "submitting";

function submitting(): FluxStandardAction<typeof SUBMITTING_ACTION> {
  return { type: SUBMITTING_ACTION, payload: undefined };
}

const SUBMITTED_ACTION = "submitted";

type SubmittedPayload = {
  nummer?: number;
  success: boolean;
  errorMessage?: string;
};

function submitted({
  nummer,
  success,
  errorMessage,
}: SubmittedPayload): FluxStandardAction<
  typeof SUBMITTED_ACTION,
  SubmittedPayload
> {
  return { type: SUBMITTED_ACTION, payload: { nummer, success, errorMessage } };
}

const VIEW_ACTION = "view";

type ViewPayload = { patient: Patient };

function view(
  payload: ViewPayload,
): FluxStandardAction<typeof VIEW_ACTION, ViewPayload> {
  return { type: VIEW_ACTION, payload };
}

const EDIT_ACTION = "edit";

function edit(): FluxStandardAction<typeof EDIT_ACTION> {
  return { type: EDIT_ACTION, payload: undefined };
}

const RESET_ACTION = "reset";

function reset(): FluxStandardAction<typeof RESET_ACTION> {
  return { type: RESET_ACTION, payload: undefined };
}

//
// Thunks
//

export function findePatient(
  query: PatientenkarteiQuery,
): ThunkAction<Promise<void>, State, Action> {
  return async (dispatch, _getState) => {
    const result = await window.naturheilpraxis.patientenkartei(query);
    if (result.patienten.length > 0) {
      const patient = result.patienten[0];
      dispatch(view({ patient }));
    } else {
      dispatch(reset());
    }
  };
}

export function submit(): ThunkAction<
  Promise<NimmPatientAufCommandStatus | void>,
  State,
  Action
> {
  return async (dispatch, getState) => {
    const state = getState();
    if (state.status == "new") {
      dispatch(submitting());
      const result = await window.naturheilpraxis.nimmPatientAuf(state.patient);
      dispatch(submitted(result));
      return result;
    } else if (state.status == "view") {
      dispatch(edit());
    } else if (state.status == "edit") {
      dispatch(submitting());
      // TODO update patient
      dispatch(submitted({ success: true }));
    }
    return;
  };
}

export function cancel(): ThunkAction<Promise<void>, State, Action> {
  return async (dispatch, getState) => {
    const state = getState();
    if (state.patient.nummer != null) {
      const result = await window.naturheilpraxis.patientenkartei({
        nummer: state.patient.nummer,
      });
      // If the patient is found, view it
      if (result.patienten.length > 0) {
        const patient = result.patienten[0];
        dispatch(view({ patient }));
        return;
      }
    }

    dispatch(reset());
  };
}

//
// State and Reducer
//

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
    status: "new",
    canSubmit: false,
    canCancel: false,
    isReadOnly: false,
    submitButtonText: "Aufnehmen",
    configuration,
  };
}

export type Action =
  | ReturnType<typeof updated>
  | ReturnType<typeof submitting>
  | ReturnType<typeof submitted>
  | ReturnType<typeof view>
  | ReturnType<typeof edit>
  | ReturnType<typeof reset>;

export function reducer(state: State, action: Action): State {
  switch (action.type) {
    case UPDATED_ACTION: {
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
      const canCancel = true;
      return { ...state, patient, canSubmit, canCancel };
    }
    case SUBMITTING_ACTION:
      return {
        ...state,
        status: "working",
        canSubmit: false,
        canCancel: false,
      };
    case SUBMITTED_ACTION:
      return {
        ...state,
        patient: {
          ...state.patient,
          nummer: action.payload?.nummer || state.patient.nummer,
        },
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
    case RESET_ACTION:
      return init({ configuration: state.configuration });
    default:
      return state;
  }
}
