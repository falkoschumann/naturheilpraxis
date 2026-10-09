// Copyright (c) 2026 Falko Schumann. MIT license.

import type { Praxis } from "./entities.ts";
import { praxisTag, type EventQuery } from "./events.ts";
import { fail, ok, type Rejection, type Result } from "./result.ts";

export type PraxisAnlegenCommand = Readonly<{
  type: "praxis-anlegen";
  data: Praxis;
}>;

export type PraxisdatenAendernCommand = Readonly<{
  type: "praxisdaten-aendern";
  data: Praxis;
}>;

export type PraxisverwaltungCommand =
  PraxisAnlegenCommand | PraxisdatenAendernCommand;

export type PraxisAngelegtEvent = Readonly<{
  type: "praxis-angelegt";
  data: Praxis;
}>;

export type PraxisdatenGeaendertEvent = Readonly<{
  type: "praxisdaten-geaendert";
  data: Praxis;
}>;

export type PraxisverwaltungEvent =
  PraxisAngelegtEvent | PraxisdatenGeaendertEvent;

// The consulted events all have the Praxiskürzel of the command, so the state
// only has to know whether this Praxis is angelegt.
export type PraxisverwaltungState = Readonly<{
  praxisAngelegt: boolean;
}>;

export const initialState: PraxisverwaltungState = { praxisAngelegt: false };

export function consults(command: PraxisverwaltungCommand): EventQuery {
  return {
    types: ["praxis-angelegt", "praxisdaten-geaendert"],
    tags: [praxisTag(command.data.praxiskuerzel)],
  };
}

export function decide(
  state: PraxisverwaltungState,
  command: PraxisverwaltungCommand,
): Result<PraxisverwaltungEvent[], Rejection> {
  const { praxiskuerzel } = command.data;
  switch (command.type) {
    case "praxis-anlegen":
      if (state.praxisAngelegt) {
        return fail({
          message: `Eine Praxis mit dem Kürzel „${praxiskuerzel}“ ist bereits angelegt. Bitte wählen Sie ein anderes Kürzel.`,
        });
      }
      return ok([{ type: "praxis-angelegt", data: command.data }]);
    case "praxisdaten-aendern":
      if (!state.praxisAngelegt) {
        return fail({
          message: `Eine Praxis mit dem Kürzel „${praxiskuerzel}“ ist nicht angelegt. Bitte legen Sie die Praxis zuerst an.`,
        });
      }
      return ok([{ type: "praxisdaten-geaendert", data: command.data }]);
  }
}

export function evolve(
  state: PraxisverwaltungState,
  event: PraxisverwaltungEvent,
): PraxisverwaltungState {
  switch (event.type) {
    case "praxis-angelegt":
      return { praxisAngelegt: true };
    case "praxisdaten-geaendert":
      return state;
  }
}

export function evolveAll(
  state: PraxisverwaltungState,
  events: readonly PraxisverwaltungEvent[],
): PraxisverwaltungState {
  return events.reduce(evolve, state);
}
