// Copyright (c) 2026 Falko Schumann. MIT license.

import type { Patient } from "./entities.ts";
import { praxisTag, type EventQuery } from "./events.ts";
import { angehoerigeExistieren, praxisExistiert } from "./patientenregeln.ts";
import type { PraxisAngelegtEvent } from "./praxisverwaltung.ts";
import { fail, ok, type Rejection, type Result } from "./result.ts";
import type { Patientennummer } from "./value-objects.ts";

// The Patientennummer is assigned on admission, so the command lacks it.
export type PatientAufnehmenCommand = Readonly<{
  type: "patient-aufnehmen";
  data: Omit<Patient, "patientennummer">;
}>;

export type PatientAufgenommenEvent = Readonly<{
  type: "patient-aufgenommen";
  data: Patient;
}>;

export type PatientenaufnahmeEvent =
  PatientAufgenommenEvent | PraxisAngelegtEvent;

// The consulted Praxis events all have the Praxiskürzel of the command.
export type PatientenaufnahmeState = Readonly<{
  praxisAngelegt: boolean;
  aufgenommen: ReadonlySet<Patientennummer>;
  hoechstePatientennummer: Patientennummer;
}>;

export const initialState: PatientenaufnahmeState = {
  praxisAngelegt: false,
  aufgenommen: new Set(),
  hoechstePatientennummer: 0,
};

export function consults(command: PatientAufnehmenCommand): EventQuery {
  return [
    { types: ["patient-aufgenommen"] },
    {
      types: ["praxis-angelegt"],
      tags: [praxisTag(command.data.praxiskuerzel)],
    },
  ];
}

export function decide(
  state: PatientenaufnahmeState,
  command: PatientAufnehmenCommand,
): Result<PatientAufgenommenEvent[], Rejection> {
  const rejection =
    praxisExistiert(command.data.praxiskuerzel, state.praxisAngelegt) ??
    angehoerigeExistieren(command.data, state.aufgenommen);
  if (rejection !== undefined) {
    return fail(rejection);
  }

  return ok([
    {
      type: "patient-aufgenommen",
      data: {
        patientennummer: state.hoechstePatientennummer + 1,
        ...command.data,
      },
    },
  ]);
}

export function evolve(
  state: PatientenaufnahmeState,
  event: PatientenaufnahmeEvent,
): PatientenaufnahmeState {
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
        hoechstePatientennummer: Math.max(
          state.hoechstePatientennummer,
          event.data.patientennummer,
        ),
      };
  }
}

export function evolveAll(
  state: PatientenaufnahmeState,
  events: readonly PatientenaufnahmeEvent[],
): PatientenaufnahmeState {
  return events.reduce(evolve, state);
}
