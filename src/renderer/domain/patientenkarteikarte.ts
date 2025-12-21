// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

import { Temporal } from "@js-temporal/polyfill";
import type { FluxStandardActionAuto } from "flux-standard-action";

import { Patient } from "../../shared/domain/naturheilpraxis";
import type { Einstellungen } from "../../shared/domain/einstellungen";

// region Actions and Action Creators

const INITIALISIERE_FORMULAR_ACTION = "initialisiereFormular";

type InitialisiereFormularPayload = {
  einstellungen: Einstellungen;
};

export function initialisiereFormular(
  payload: InitialisiereFormularPayload,
): FluxStandardActionAuto<
  typeof INITIALISIERE_FORMULAR_ACTION,
  InitialisiereFormularPayload
> {
  return { type: INITIALISIERE_FORMULAR_ACTION, payload };
}

const FELD_AKTUALISIERT_ACTION = "feldAktualisiert";

type FeldAktualisiertPayload = {
  feld: keyof Patient;
  wert?: unknown;
};

export function feldAktualisiert(
  payload: FeldAktualisiertPayload,
): FluxStandardActionAuto<
  typeof FELD_AKTUALISIERT_ACTION,
  FeldAktualisiertPayload
> {
  return { type: FELD_AKTUALISIERT_ACTION, payload };
}

const SENDE_FORMULAR_ACTION = "sendeFormular";

export function sendeFormular(): FluxStandardActionAuto<
  typeof SENDE_FORMULAR_ACTION
> {
  return { type: SENDE_FORMULAR_ACTION, payload: undefined };
}

const VERARBEITUNG_ABGESCHLOSSEN_ACTION = "verarbeitungAbgeschlossen";

type VerarbeitungAbgeschlossenPayload = {
  nummer?: number;
};

export function verarbeitungAbgeschlossen({
  nummer,
}: VerarbeitungAbgeschlossenPayload): FluxStandardActionAuto<
  typeof VERARBEITUNG_ABGESCHLOSSEN_ACTION,
  VerarbeitungAbgeschlossenPayload
> {
  return { type: VERARBEITUNG_ABGESCHLOSSEN_ACTION, payload: { nummer } };
}

const ABGEBROCHEN_ACTION = "abgebrochen";

export function abgebrochen(): FluxStandardActionAuto<
  typeof ABGEBROCHEN_ACTION
> {
  return { type: ABGEBROCHEN_ACTION, payload: undefined };
}

const PATIENT_GEFUNDEN_ACTION = "patientGefunden";

type PatientGefundenPayload = { patient?: Patient };

export function patientGefunden(
  payload: PatientGefundenPayload,
): FluxStandardActionAuto<
  typeof PATIENT_GEFUNDEN_ACTION,
  PatientGefundenPayload
> {
  return { type: PATIENT_GEFUNDEN_ACTION, payload };
}

export type Action =
  | ReturnType<typeof initialisiereFormular>
  | ReturnType<typeof feldAktualisiert>
  | ReturnType<typeof sendeFormular>
  | ReturnType<typeof verarbeitungAbgeschlossen>
  | ReturnType<typeof abgebrochen>
  | ReturnType<typeof patientGefunden>;

// endregion
// region State

export const FormularZustand = Object.freeze({
  AUFNEHMEN: "Aufnehmen",
  ANZEIGEN: "Anzeigen",
  BEARBEITEN: "Bearbeiten",
  VERARBEITEN: "Verarbeiten",
});

export type FormularZustandType =
  (typeof FormularZustand)[keyof typeof FormularZustand];

export const SendenText = Object.freeze({
  AUFNEHMEN: "Aufnehmen",
  BEARBEITEN: "Bearbeiten",
  SPEICHERN: "Speichern",
});

export type SendenTextType = (typeof SendenText)[keyof typeof SendenText];

export interface State {
  patient: Partial<Patient>;
  formularZustand: FormularZustandType;
  kannAbschicken: boolean;
  kannAbbrechen: boolean;
  istSchreibgeschuetzt: boolean;
  sendenText: SendenTextType;
  praxis: string[];
  anrede: string[];
  familienstand: string[];
  schluesselworte: string[];
  standardSchluesselworte: string[];
}

export const initialState: State = {
  patient: {},
  formularZustand: FormularZustand.AUFNEHMEN,
  kannAbschicken: false,
  kannAbbrechen: false,
  istSchreibgeschuetzt: false,
  sendenText: SendenText.AUFNEHMEN,
  praxis: [],
  anrede: [],
  familienstand: [],
  schluesselworte: [],
  standardSchluesselworte: [],
};

// endregion
// region Reducer

export function reducer(state: State, action: Action): State {
  switch (action.type) {
    case INITIALISIERE_FORMULAR_ACTION:
      return {
        patient: {
          annahmejahr: Temporal.Now.plainDateISO().year,
          praxis: action.payload.einstellungen.praxis[0],
          schluesselworte: action.payload.einstellungen.standardSchluesselworte,
        },
        formularZustand: FormularZustand.AUFNEHMEN,
        kannAbschicken: false,
        kannAbbrechen: false,
        istSchreibgeschuetzt: false,
        sendenText: "Aufnehmen",
        praxis: action.payload.einstellungen.praxis,
        anrede: action.payload.einstellungen.anrede,
        familienstand: action.payload.einstellungen.familienstand,
        schluesselworte: action.payload.einstellungen.schluesselworte,
        standardSchluesselworte:
          action.payload.einstellungen.standardSchluesselworte,
      };
    case FELD_AKTUALISIERT_ACTION: {
      const patient = {
        ...state.patient,
        [action.payload.feld]: action.payload.wert,
      };
      const canSubmit =
        patient.nachname != null &&
        patient.nachname.trim().length > 0 &&
        patient.vorname != null &&
        patient.vorname.trim().length > 0 &&
        patient.geburtsdatum != null &&
        Temporal.PlainDate.compare(patient.geburtsdatum, "0001-01-01") >= 0 &&
        Number.isInteger(patient.annahmejahr) &&
        patient.praxis != null &&
        patient.praxis.trim().length > 0;
      const canCancel = true;
      return {
        ...state,
        patient,
        kannAbschicken: canSubmit,
        kannAbbrechen: canCancel,
      };
    }
    case SENDE_FORMULAR_ACTION:
      switch (state.formularZustand) {
        case FormularZustand.AUFNEHMEN:
        case FormularZustand.BEARBEITEN:
          return {
            ...state,
            formularZustand: FormularZustand.VERARBEITEN,
            kannAbschicken: false,
            kannAbbrechen: false,
            istSchreibgeschuetzt: true,
          };
        case FormularZustand.ANZEIGEN:
          return {
            ...state,
            formularZustand: FormularZustand.BEARBEITEN,
            kannAbschicken: false,
            kannAbbrechen: true,
            istSchreibgeschuetzt: false,
            sendenText: "Speichern",
          };
        default:
          throw new Error(
            `Unexpected status in patientenkarteikarte reducer: ${state.formularZustand}`,
          );
      }
    case VERARBEITUNG_ABGESCHLOSSEN_ACTION:
      return {
        ...state,
        patient: {
          ...state.patient,
          nummer: action.payload?.nummer || state.patient.nummer,
        },
        formularZustand: FormularZustand.ANZEIGEN,
        kannAbschicken: true,
        istSchreibgeschuetzt: true,
        sendenText: SendenText.BEARBEITEN,
      };
    case ABGEBROCHEN_ACTION:
      if (state.formularZustand === FormularZustand.AUFNEHMEN) {
        return {
          ...state,
          patient: {
            annahmejahr: new Date().getFullYear(),
            praxis: state.praxis[0],
            schluesselworte: state.standardSchluesselworte,
          },
          kannAbschicken: false,
          kannAbbrechen: false,
        };
      } else {
        return {
          ...state,
          formularZustand: FormularZustand.ANZEIGEN,
          kannAbschicken: true,
          kannAbbrechen: false,
          istSchreibgeschuetzt: true,
          sendenText: SendenText.BEARBEITEN,
        };
      }
    case PATIENT_GEFUNDEN_ACTION:
      if (action.payload.patient != null) {
        return {
          ...state,
          patient: action.payload.patient,
          formularZustand: FormularZustand.ANZEIGEN,
          kannAbschicken: true,
          kannAbbrechen: false,
          istSchreibgeschuetzt: true,
          sendenText: SendenText.BEARBEITEN,
        };
      } else {
        return {
          ...state,
          patient: {
            annahmejahr: Temporal.Now.plainDateISO().year,
            praxis: state.praxis[0],
            schluesselworte: state.standardSchluesselworte,
          },
          formularZustand: FormularZustand.AUFNEHMEN,
          kannAbschicken: false,
          kannAbbrechen: false,
          istSchreibgeschuetzt: false,
          sendenText: SendenText.AUFNEHMEN,
        };
      }
    default:
      throw new Error(
        `Unhandled action in patientenkarteikarte reducer: ${JSON.stringify(action)}.`,
      );
  }
}

// endregion
