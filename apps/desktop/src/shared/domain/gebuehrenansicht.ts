// Copyright (c) 2026 Falko Schumann. MIT license.

import type { Gebuehr } from "./entities.ts";
import type { DomainEvent } from "./events.ts";

// The Gebühren by their Ziffer.
export type Gebuehrenansicht = Readonly<Record<string, Gebuehr>>;

export const initialReadModel: Gebuehrenansicht = {};

export type GebuehrenErmittelnQuery = Readonly<{
  type: "gebuehren-ermitteln";
  parameters: Readonly<Record<string, never>>;
}>;

export type GebuehrenErmittelnQueryResult = readonly Gebuehr[];

export function project(
  readModel: Gebuehrenansicht,
  event: DomainEvent,
): Gebuehrenansicht {
  switch (event.type) {
    case "gebuehr-angelegt":
    case "gebuehr-geaendert":
      return { ...readModel, [event.data.ziffer]: event.data };
    case "gebuehr-entfernt":
      return Object.fromEntries(
        Object.entries(readModel).filter(
          ([ziffer]) => ziffer !== event.data.ziffer,
        ),
      );
    default:
      return readModel;
  }
}

export function projectAll(
  readModel: Gebuehrenansicht,
  events: readonly DomainEvent[],
): Gebuehrenansicht {
  return events.reduce(project, readModel);
}

// Numbers in a Ziffer compare numerically, so 3 comes before 20.1.
const natuerlicheReihenfolge = new Intl.Collator("de", { numeric: true });

export function gebuehrenErmitteln(
  readModel: Gebuehrenansicht,
  _query: GebuehrenErmittelnQuery,
): GebuehrenErmittelnQueryResult {
  return Object.values(readModel).toSorted((a, b) =>
    natuerlicheReihenfolge.compare(a.ziffer, b.ziffer),
  );
}
