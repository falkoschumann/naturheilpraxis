// Copyright (c) 2026 Falko Schumann. MIT license.

import type {
  EntwurfGeloeschtEvent,
  RechnungErstelltEvent,
  RechnungGeaendertEvent,
  RechnungsversandZurueckgenommenEvent,
  RechnungVersendetEvent,
} from "./abrechnung.ts";
import type { Leistung } from "./entities.ts";
import {
  leistungTag,
  patientTag,
  praxisTag,
  type EventQuery,
} from "./events.ts";
import type { PatientAufgenommenEvent } from "./patientenaufnahme.ts";
import { patientExistiert, praxisExistiert } from "./patientenregeln.ts";
import type { PraxisAngelegtEvent } from "./praxisverwaltung.ts";
import { fail, ok, type Rejection, type Result } from "./result.ts";
import { pruefeEuro } from "./value-objects.ts";

export type LeistungErbringenCommand = Readonly<{
  type: "leistung-erbringen";
  data: Leistung;
}>;

// The Patient of a Leistung cannot be changed.
export type LeistungAendernCommand = Readonly<{
  type: "leistung-aendern";
  data: Omit<Leistung, "patientennummer">;
}>;

export type LeistungLoeschenCommand = Readonly<{
  type: "leistung-loeschen";
  data: Readonly<{ leistungId: string }>;
}>;

export type LeistungserbringungCommand =
  LeistungErbringenCommand | LeistungAendernCommand | LeistungLoeschenCommand;

export type LeistungErbrachtEvent = Readonly<{
  type: "leistung-erbracht";
  data: Leistung;
}>;

export type LeistungGeaendertEvent = Readonly<{
  type: "leistung-geaendert";
  data: Leistung;
}>;

export type LeistungGeloeschtEvent = Readonly<{
  type: "leistung-geloescht";
  data: Readonly<{ leistungId: string }>;
}>;

export type LeistungserbringungEvent =
  | LeistungErbrachtEvent
  | LeistungGeaendertEvent
  | LeistungGeloeschtEvent
  | RechnungErstelltEvent
  | RechnungGeaendertEvent
  | EntwurfGeloeschtEvent
  | RechnungVersendetEvent
  | RechnungsversandZurueckgenommenEvent
  | PraxisAngelegtEvent
  | PatientAufgenommenEvent;

type Rechnung = Readonly<{
  leistungen: readonly string[];
  versendet: boolean;
}>;

// The consulted events are about the Leistung of the command, the Rechnungen
// that contain or contained it, its Praxis and its Patient.
export type LeistungserbringungState = Readonly<{
  leistung?: Leistung;
  rechnungen: Readonly<Record<string, Rechnung>>;
  praxisAngelegt: boolean;
  patientAufgenommen: boolean;
}>;

export const initialState: LeistungserbringungState = {
  rechnungen: {},
  praxisAngelegt: false,
  patientAufgenommen: false,
};

// The Abrechnung tags all events of a Rechnung with the Leistungen the
// Rechnung contains or contained.
export function consults(command: LeistungserbringungCommand): EventQuery {
  const leistungUndRechnungen = {
    types: [
      "leistung-erbracht",
      "leistung-geaendert",
      "leistung-geloescht",
      "rechnung-erstellt",
      "rechnung-geaendert",
      "entwurf-geloescht",
      "rechnung-versendet",
      "rechnungsversand-zurueckgenommen",
    ] as const,
    tags: [leistungTag(command.data.leistungId)],
  };
  const praxis = (praxiskuerzel: string) => ({
    types: ["praxis-angelegt"] as const,
    tags: [praxisTag(praxiskuerzel)],
  });
  switch (command.type) {
    case "leistung-erbringen":
      return [
        leistungUndRechnungen,
        praxis(command.data.praxiskuerzel),
        {
          types: ["patient-aufgenommen"],
          tags: [patientTag(command.data.patientennummer)],
        },
      ];
    case "leistung-aendern":
      return [leistungUndRechnungen, praxis(command.data.praxiskuerzel)];
    case "leistung-loeschen":
      return [leistungUndRechnungen];
  }
}

export function decide(
  state: LeistungserbringungState,
  command: LeistungserbringungCommand,
): Result<LeistungserbringungEvent[], Rejection> {
  switch (command.type) {
    case "leistung-erbringen": {
      if (state.leistung !== undefined) {
        return fail({ message: "Die Leistung ist bereits erbracht." });
      }
      const rejection =
        praxisExistiert(command.data.praxiskuerzel, state.praxisAngelegt) ??
        patientExistiert(
          command.data.patientennummer,
          state.patientAufgenommen,
        ) ??
        einzelbetragIstNichtNegativ(command.data);
      if (rejection !== undefined) {
        return fail(rejection);
      }
      return ok([{ type: "leistung-erbracht", data: command.data }]);
    }
    case "leistung-aendern": {
      if (state.leistung === undefined) {
        return fail({
          message:
            "Die Leistung ist nicht vorhanden. Möglicherweise wurde sie inzwischen gelöscht.",
        });
      }
      const rejection =
        nurImEntwurfAendern(state, command.data.leistungId) ??
        praxisExistiert(command.data.praxiskuerzel, state.praxisAngelegt) ??
        einzelbetragIstNichtNegativ(command.data);
      if (rejection !== undefined) {
        return fail(rejection);
      }
      return ok([
        {
          type: "leistung-geaendert",
          data: {
            ...command.data,
            patientennummer: state.leistung.patientennummer,
          },
        },
      ]);
    }
    case "leistung-loeschen": {
      // Deleting is idempotent.
      if (state.leistung === undefined) {
        return ok([]);
      }
      const rejection = nurOhneRechnungLoeschen(state, command.data.leistungId);
      if (rejection !== undefined) {
        return fail(rejection);
      }
      return ok([
        {
          type: "leistung-geloescht",
          data: { leistungId: command.data.leistungId },
        },
      ]);
    }
  }
}

export function evolve(
  state: LeistungserbringungState,
  event: LeistungserbringungEvent,
): LeistungserbringungState {
  switch (event.type) {
    case "leistung-erbracht":
    case "leistung-geaendert":
      return { ...state, leistung: event.data };
    case "leistung-geloescht":
      return {
        rechnungen: state.rechnungen,
        praxisAngelegt: state.praxisAngelegt,
        patientAufgenommen: state.patientAufgenommen,
      };
    case "rechnung-erstellt":
      return {
        ...state,
        rechnungen: {
          ...state.rechnungen,
          [event.data.rechnungId]: {
            leistungen: event.data.leistungen,
            versendet: false,
          },
        },
      };
    case "rechnung-geaendert":
      return aendereRechnung(state, event.data.rechnungId, {
        leistungen: event.data.leistungen,
      });
    case "entwurf-geloescht":
      return {
        ...state,
        rechnungen: Object.fromEntries(
          Object.entries(state.rechnungen).filter(
            ([rechnungId]) => rechnungId !== event.data.rechnungId,
          ),
        ),
      };
    case "rechnung-versendet":
      return aendereRechnung(state, event.data.rechnungId, { versendet: true });
    case "rechnungsversand-zurueckgenommen":
      return aendereRechnung(state, event.data.rechnungId, {
        versendet: false,
      });
    case "praxis-angelegt":
      return { ...state, praxisAngelegt: true };
    case "patient-aufgenommen":
      return { ...state, patientAufgenommen: true };
  }
}

export function evolveAll(
  state: LeistungserbringungState,
  events: readonly LeistungserbringungEvent[],
): LeistungserbringungState {
  return events.reduce(evolve, state);
}

function aendereRechnung(
  state: LeistungserbringungState,
  rechnungId: string,
  aenderung: Partial<Rechnung>,
): LeistungserbringungState {
  const rechnung = state.rechnungen[rechnungId];
  if (rechnung === undefined) {
    return state;
  }
  return {
    ...state,
    rechnungen: {
      ...state.rechnungen,
      [rechnungId]: { ...rechnung, ...aenderung },
    },
  };
}

function rechnungenMit(
  state: LeistungserbringungState,
  leistungId: string,
): Rechnung[] {
  return Object.values(state.rechnungen).filter((rechnung) =>
    rechnung.leistungen.includes(leistungId),
  );
}

function nurImEntwurfAendern(
  state: LeistungserbringungState,
  leistungId: string,
): Rejection | undefined {
  if (
    !rechnungenMit(state, leistungId).some((rechnung) => rechnung.versendet)
  ) {
    return undefined;
  }
  return {
    invariant: "nur-im-entwurf-aendern",
    message:
      "Die Leistung ist in einer versendeten oder bezahlten Rechnung enthalten und kann nicht mehr geändert werden.",
  };
}

function nurOhneRechnungLoeschen(
  state: LeistungserbringungState,
  leistungId: string,
): Rejection | undefined {
  if (rechnungenMit(state, leistungId).length === 0) {
    return undefined;
  }
  return {
    invariant: "nur-ohne-rechnung-loeschen",
    message:
      "Die Leistung ist in einer Rechnung enthalten und kann nicht gelöscht werden. Entfernen Sie die Leistung zuerst aus dem Rechnungsentwurf.",
  };
}

function einzelbetragIstNichtNegativ(
  leistung: Pick<Leistung, "einzelbetrag">,
): Rejection | undefined {
  const einzelbetrag = pruefeEuro(leistung.einzelbetrag);
  return einzelbetrag.ok ? undefined : einzelbetrag.error;
}
