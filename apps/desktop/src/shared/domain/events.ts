// Copyright (c) 2026 Falko Schumann. MIT license.

import type {
  PraxisAngelegtEvent,
  PraxisdatenGeaendertEvent,
} from "./praxisverwaltung.ts";

export type DomainEvent = PraxisAngelegtEvent | PraxisdatenGeaendertEvent;

export type DomainEventType = DomainEvent["type"];

// Selects the events a consistency boundary consults: an event matches if it
// has one of the types and at least one of the tags.
export type EventQuery = Readonly<{
  types: readonly DomainEventType[];
  tags: readonly string[];
}>;

// The tags identify the things an event is about, so that a consistency
// boundary can consult the events by the identity of these things.
export function tagsOf(event: DomainEvent): string[] {
  switch (event.type) {
    case "praxis-angelegt":
    case "praxisdaten-geaendert":
      return [praxisTag(event.data.praxiskuerzel)];
  }
}

export function praxisTag(praxiskuerzel: string): string {
  return `praxis:${praxiskuerzel}`;
}
