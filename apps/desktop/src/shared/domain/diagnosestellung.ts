// Copyright (c) 2026 Falko Schumann. MIT license.

import type { Diagnose } from "./entities.ts";
import {
  diagnoseTag,
  patientTag,
  praxisTag,
  type EventQuery,
} from "./events.ts";
import type { PatientAufgenommenEvent } from "./patientenaufnahme.ts";
import { patientExistiert, praxisExistiert } from "./patientenregeln.ts";
import type { PraxisAngelegtEvent } from "./praxisverwaltung.ts";
import { fail, ok, type Rejection, type Result } from "./result.ts";

export type DiagnoseStellenCommand = Readonly<{
  type: "diagnose-stellen";
  data: Diagnose;
}>;

// The Patient of a Diagnose cannot be changed.
export type DiagnoseAendernCommand = Readonly<{
  type: "diagnose-aendern";
  data: Omit<Diagnose, "patientennummer">;
}>;

export type DiagnoseLoeschenCommand = Readonly<{
  type: "diagnose-loeschen";
  data: Readonly<{ diagnoseId: string }>;
}>;

export type DiagnosestellungCommand =
  DiagnoseStellenCommand | DiagnoseAendernCommand | DiagnoseLoeschenCommand;

export type DiagnoseGestelltEvent = Readonly<{
  type: "diagnose-gestellt";
  data: Diagnose;
}>;

export type DiagnoseGeaendertEvent = Readonly<{
  type: "diagnose-geaendert";
  data: Diagnose;
}>;

export type DiagnoseGeloeschtEvent = Readonly<{
  type: "diagnose-geloescht";
  data: Readonly<{ diagnoseId: string }>;
}>;

export type DiagnosestellungEvent =
  | DiagnoseGestelltEvent
  | DiagnoseGeaendertEvent
  | DiagnoseGeloeschtEvent
  | PraxisAngelegtEvent
  | PatientAufgenommenEvent;

// The consulted events are about the Diagnose, the Praxis and the Patient of
// the command.
export type DiagnosestellungState = Readonly<{
  diagnose?: Diagnose;
  praxisAngelegt: boolean;
  patientAufgenommen: boolean;
}>;

export const initialState: DiagnosestellungState = {
  praxisAngelegt: false,
  patientAufgenommen: false,
};

export function consults(command: DiagnosestellungCommand): EventQuery {
  const diagnose = {
    types: [
      "diagnose-gestellt",
      "diagnose-geaendert",
      "diagnose-geloescht",
    ] as const,
    tags: [diagnoseTag(command.data.diagnoseId)],
  };
  const praxis = (praxiskuerzel: string) => ({
    types: ["praxis-angelegt"] as const,
    tags: [praxisTag(praxiskuerzel)],
  });
  switch (command.type) {
    case "diagnose-stellen":
      return [
        diagnose,
        praxis(command.data.praxiskuerzel),
        {
          types: ["patient-aufgenommen"],
          tags: [patientTag(command.data.patientennummer)],
        },
      ];
    case "diagnose-aendern":
      return [diagnose, praxis(command.data.praxiskuerzel)];
    case "diagnose-loeschen":
      return [diagnose];
  }
}

export function decide(
  state: DiagnosestellungState,
  command: DiagnosestellungCommand,
): Result<DiagnosestellungEvent[], Rejection> {
  switch (command.type) {
    case "diagnose-stellen": {
      if (state.diagnose !== undefined) {
        return fail({ message: "Die Diagnose ist bereits gestellt." });
      }
      const rejection =
        praxisExistiert(command.data.praxiskuerzel, state.praxisAngelegt) ??
        patientExistiert(
          command.data.patientennummer,
          state.patientAufgenommen,
        );
      if (rejection !== undefined) {
        return fail(rejection);
      }
      return ok([{ type: "diagnose-gestellt", data: command.data }]);
    }
    case "diagnose-aendern": {
      if (state.diagnose === undefined) {
        return fail({
          message:
            "Die Diagnose ist nicht vorhanden. Möglicherweise wurde sie inzwischen gelöscht.",
        });
      }
      const rejection = praxisExistiert(
        command.data.praxiskuerzel,
        state.praxisAngelegt,
      );
      if (rejection !== undefined) {
        return fail(rejection);
      }
      return ok([
        {
          type: "diagnose-geaendert",
          data: {
            ...command.data,
            patientennummer: state.diagnose.patientennummer,
          },
        },
      ]);
    }
    case "diagnose-loeschen":
      // Deleting is idempotent.
      if (state.diagnose === undefined) {
        return ok([]);
      }
      return ok([
        {
          type: "diagnose-geloescht",
          data: { diagnoseId: command.data.diagnoseId },
        },
      ]);
  }
}

export function evolve(
  state: DiagnosestellungState,
  event: DiagnosestellungEvent,
): DiagnosestellungState {
  switch (event.type) {
    case "diagnose-gestellt":
    case "diagnose-geaendert":
      return { ...state, diagnose: event.data };
    case "diagnose-geloescht":
      return {
        praxisAngelegt: state.praxisAngelegt,
        patientAufgenommen: state.patientAufgenommen,
      };
    case "praxis-angelegt":
      return { ...state, praxisAngelegt: true };
    case "patient-aufgenommen":
      return { ...state, patientAufgenommen: true };
  }
}

export function evolveAll(
  state: DiagnosestellungState,
  events: readonly DiagnosestellungEvent[],
): DiagnosestellungState {
  return events.reduce(evolve, state);
}
