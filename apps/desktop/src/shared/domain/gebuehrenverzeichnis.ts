// Copyright (c) 2026 Falko Schumann. MIT license.

import type { Gebuehr } from "./entities.ts";
import { gebuehrTag, type EventQuery } from "./events.ts";
import { fail, ok, type Rejection, type Result } from "./result.ts";
import { pruefeEuro, type Gebuehrenziffer } from "./value-objects.ts";

export type GebuehrAnlegenCommand = Readonly<{
  type: "gebuehr-anlegen";
  data: Gebuehr;
}>;

export type GebuehrAendernCommand = Readonly<{
  type: "gebuehr-aendern";
  data: Gebuehr;
}>;

export type GebuehrEntfernenCommand = Readonly<{
  type: "gebuehr-entfernen";
  data: Readonly<{ ziffer: Gebuehrenziffer }>;
}>;

export type GebuehrenverzeichnisCommand =
  GebuehrAnlegenCommand | GebuehrAendernCommand | GebuehrEntfernenCommand;

export type GebuehrAngelegtEvent = Readonly<{
  type: "gebuehr-angelegt";
  data: Gebuehr;
}>;

export type GebuehrGeaendertEvent = Readonly<{
  type: "gebuehr-geaendert";
  data: Gebuehr;
}>;

export type GebuehrEntferntEvent = Readonly<{
  type: "gebuehr-entfernt";
  data: Readonly<{ ziffer: Gebuehrenziffer }>;
}>;

export type GebuehrenverzeichnisEvent =
  GebuehrAngelegtEvent | GebuehrGeaendertEvent | GebuehrEntferntEvent;

// The consulted events all have the Ziffer of the command, so the state only
// has to know whether the Gebühr is in the Gebührenverzeichnis.
export type GebuehrenverzeichnisState = Readonly<{
  gebuehrEnthalten: boolean;
}>;

export const initialState: GebuehrenverzeichnisState = {
  gebuehrEnthalten: false,
};

export function consults(command: GebuehrenverzeichnisCommand): EventQuery {
  return [
    {
      types: ["gebuehr-angelegt", "gebuehr-geaendert", "gebuehr-entfernt"],
      tags: [gebuehrTag(command.data.ziffer)],
    },
  ];
}

export function decide(
  state: GebuehrenverzeichnisState,
  command: GebuehrenverzeichnisCommand,
): Result<GebuehrenverzeichnisEvent[], Rejection> {
  const { ziffer } = command.data;
  switch (command.type) {
    case "gebuehr-anlegen": {
      if (state.gebuehrEnthalten) {
        return fail({
          message: `Die Ziffer „${ziffer}“ ist bereits im Gebührenverzeichnis enthalten. Bitte wählen Sie eine andere Ziffer.`,
        });
      }
      const betrag = pruefeEuro(command.data.betrag);
      if (!betrag.ok) {
        return betrag;
      }
      return ok([{ type: "gebuehr-angelegt", data: command.data }]);
    }
    case "gebuehr-aendern": {
      if (!state.gebuehrEnthalten) {
        return fail({
          message: `Die Ziffer „${ziffer}“ ist nicht im Gebührenverzeichnis enthalten. Bitte legen Sie die Gebühr zuerst an.`,
        });
      }
      const betrag = pruefeEuro(command.data.betrag);
      if (!betrag.ok) {
        return betrag;
      }
      return ok([{ type: "gebuehr-geaendert", data: command.data }]);
    }
    case "gebuehr-entfernen":
      // Removing is idempotent.
      if (!state.gebuehrEnthalten) {
        return ok([]);
      }
      return ok([{ type: "gebuehr-entfernt", data: { ziffer } }]);
  }
}

export function evolve(
  state: GebuehrenverzeichnisState,
  event: GebuehrenverzeichnisEvent,
): GebuehrenverzeichnisState {
  switch (event.type) {
    case "gebuehr-angelegt":
      return { gebuehrEnthalten: true };
    case "gebuehr-geaendert":
      return state;
    case "gebuehr-entfernt":
      return { gebuehrEnthalten: false };
  }
}

export function evolveAll(
  state: GebuehrenverzeichnisState,
  events: readonly GebuehrenverzeichnisEvent[],
): GebuehrenverzeichnisState {
  return events.reduce(evolve, state);
}
