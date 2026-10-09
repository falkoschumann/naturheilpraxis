// Copyright (c) 2026 Falko Schumann. MIT license.

import type { Patient } from "./entities.ts";
import { patientTag, praxisTag, type EventQuery } from "./events.ts";
import type { PatientAufgenommenEvent } from "./patientenaufnahme.ts";
import { angehoerigeExistieren, praxisExistiert } from "./patientenregeln.ts";
import type { PraxisAngelegtEvent } from "./praxisverwaltung.ts";
import { fail, ok, type Rejection, type Result } from "./result.ts";
import type { Patientennummer } from "./value-objects.ts";

export type PatientendatenAendernCommand = Readonly<{
  type: "patientendaten-aendern";
  data: Patient;
}>;

export type PatientendatenGeaendertEvent = Readonly<{
  type: "patientendaten-geaendert";
  data: Patient;
}>;

export type PatientenkarteiEvent =
  PatientAufgenommenEvent | PatientendatenGeaendertEvent | PraxisAngelegtEvent;

// The consulted events are about the Patient of the command, its Angehörige
// and its Praxis.
export type PatientenkarteiState = Readonly<{
  praxisAngelegt: boolean;
  aufgenommen: ReadonlySet<Patientennummer>;
}>;

export const initialState: PatientenkarteiState = {
  praxisAngelegt: false,
  aufgenommen: new Set(),
};

export function consults(command: PatientendatenAendernCommand): EventQuery {
  const { patientennummer, partnerVon, kindVon, praxiskuerzel } = command.data;
  return [
    {
      types: ["patient-aufgenommen", "patientendaten-geaendert"],
      tags: [patientTag(patientennummer)],
    },
    ...[partnerVon, kindVon]
      .filter((nummer) => nummer !== undefined)
      .map((nummer) => ({
        types: ["patient-aufgenommen" as const],
        tags: [patientTag(nummer)],
      })),
    { types: ["praxis-angelegt"], tags: [praxisTag(praxiskuerzel)] },
  ];
}

export function decide(
  state: PatientenkarteiState,
  command: PatientendatenAendernCommand,
): Result<PatientendatenGeaendertEvent[], Rejection> {
  const patient = command.data;
  if (!state.aufgenommen.has(patient.patientennummer)) {
    return fail({
      message: `Der Patient mit der Nummer ${patient.patientennummer} ist nicht aufgenommen. Bitte nehmen Sie den Patienten zuerst auf.`,
    });
  }

  const rejection =
    patientIstNichtSeinEigenerPartnerOderKind(patient) ??
    praxisExistiert(patient.praxiskuerzel, state.praxisAngelegt) ??
    angehoerigeExistieren(patient, state.aufgenommen);
  if (rejection !== undefined) {
    return fail(rejection);
  }

  return ok([{ type: "patientendaten-geaendert", data: patient }]);
}

export function evolve(
  state: PatientenkarteiState,
  event: PatientenkarteiEvent,
): PatientenkarteiState {
  switch (event.type) {
    case "praxis-angelegt":
      return { ...state, praxisAngelegt: true };
    case "patient-aufgenommen":
      return {
        ...state,
        aufgenommen: new Set([
          ...state.aufgenommen,
          event.data.patientennummer,
        ]),
      };
    case "patientendaten-geaendert":
      return state;
  }
}

export function evolveAll(
  state: PatientenkarteiState,
  events: readonly PatientenkarteiEvent[],
): PatientenkarteiState {
  return events.reduce(evolve, state);
}

// An invariant of the entity Patient.
function patientIstNichtSeinEigenerPartnerOderKind(
  patient: Patient,
): Rejection | undefined {
  if (
    patient.partnerVon !== patient.patientennummer &&
    patient.kindVon !== patient.patientennummer
  ) {
    return undefined;
  }
  return {
    invariant: "patient-ist-nicht-sein-eigener-partner-oder-kind",
    message:
      "Ein Patient kann weder Partner noch Kind von sich selbst sein. Bitte wählen Sie einen anderen Patienten.",
  };
}
