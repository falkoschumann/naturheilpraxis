// Copyright (c) 2026 Falko Schumann. MIT license.

import type { Praxis } from "./entities.ts";
import type { DomainEvent } from "./events.ts";

// The Praxen by their Praxiskürzel.
export type Praxenansicht = Readonly<Record<string, Praxis>>;

export const initialReadModel: Praxenansicht = {};

export type PraxenErmittelnQuery = Readonly<{
  type: "praxen-ermitteln";
  parameters: Readonly<Record<string, never>>;
}>;

export type PraxenErmittelnQueryResultItem = Readonly<{
  praxiskuerzel: string;
  name: string;
  strasse: string;
  zusatz?: string;
  postleitzahl: string;
  ort: string;
  staat?: string;
  telefon?: string;
  mobiltelefon?: string;
  email?: string;
  website?: string;
  rechnungstext?: string;
}>;

export type PraxenErmittelnQueryResult =
  readonly PraxenErmittelnQueryResultItem[];

export type PraxisErmittelnQuery = Readonly<{
  type: "praxis-ermitteln";
  parameters: Readonly<{ praxiskuerzel: string }>;
}>;

export type PraxisErmittelnQueryResult = Praxis | undefined;

export function project(
  readModel: Praxenansicht,
  event: DomainEvent,
): Praxenansicht {
  switch (event.type) {
    case "praxis-angelegt":
    case "praxisdaten-geaendert":
      return { ...readModel, [event.data.praxiskuerzel]: event.data };
  }
}

export function projectAll(
  readModel: Praxenansicht,
  events: readonly DomainEvent[],
): Praxenansicht {
  return events.reduce(project, readModel);
}

export function praxenErmitteln(
  readModel: Praxenansicht,
  _query: PraxenErmittelnQuery,
): PraxenErmittelnQueryResult {
  return Object.values(readModel)
    .toSorted((a, b) => a.praxiskuerzel.localeCompare(b.praxiskuerzel))
    .map(({ anschrift, kontakt, ...praxis }) => ({
      ...praxis,
      ...anschrift,
      ...kontakt,
    }));
}

export function praxisErmitteln(
  readModel: Praxenansicht,
  query: PraxisErmittelnQuery,
): PraxisErmittelnQueryResult {
  return readModel[query.parameters.praxiskuerzel];
}
