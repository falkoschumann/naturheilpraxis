// Copyright (c) 2026 Falko Schumann. MIT license.

import type { GebuehrenverzeichnisEvent } from "./gebuehrenverzeichnis.ts";
import type { PraxisverwaltungEvent } from "./praxisverwaltung.ts";

export type DomainEvent = PraxisverwaltungEvent | GebuehrenverzeichnisEvent;

export type DomainEventType = DomainEvent["type"];

// Selects the events a consistency boundary consults: an event matches if it
// has one of the types and at least one of the tags.
export type EventQuery = Readonly<{
  types: readonly DomainEventType[];
  tags: readonly string[];
}>;

export function matches(event: DomainEvent, query: EventQuery): boolean {
  return (
    query.types.includes(event.type) &&
    tagsOf(event).some((tag) => query.tags.includes(tag))
  );
}

// The tags identify the things an event is about, so that a consistency
// boundary can consult the events by the identity of these things.
export function tagsOf(event: DomainEvent): string[] {
  switch (event.type) {
    case "praxis-angelegt":
    case "praxisdaten-geaendert":
      return [praxisTag(event.data.praxiskuerzel)];
    case "gebuehr-angelegt":
    case "gebuehr-geaendert":
    case "gebuehr-entfernt":
      return [gebuehrTag(event.data.ziffer)];
  }
}

export function praxisTag(praxiskuerzel: string): string {
  return `praxis:${praxiskuerzel}`;
}

export function gebuehrTag(ziffer: string): string {
  return `gebuehr:${ziffer}`;
}
