// Copyright (c) 2026 Falko Schumann. MIT license.

import type { GebuehrenverzeichnisEvent } from "./gebuehrenverzeichnis.ts";
import type { PatientAufgenommenEvent } from "./patientenaufnahme.ts";
import type { PatientendatenGeaendertEvent } from "./patientenkartei.ts";
import type { PraxisverwaltungEvent } from "./praxisverwaltung.ts";

export type DomainEvent =
  | PraxisverwaltungEvent
  | GebuehrenverzeichnisEvent
  | PatientAufgenommenEvent
  | PatientendatenGeaendertEvent;

export type DomainEventType = DomainEvent["type"];

// Selects the events a consistency boundary consults: an event matches if it
// matches one of the items. It matches an item if it has one of the types and
// all of the tags.
export type EventQuery = readonly EventQueryItem[];

export type EventQueryItem = Readonly<{
  types: readonly DomainEventType[];
  tags?: readonly string[];
}>;

export function matches(event: DomainEvent, query: EventQuery): boolean {
  const tags = tagsOf(event);
  return query.some(
    (item) =>
      item.types.includes(event.type) &&
      (item.tags ?? []).every((tag) => tags.includes(tag)),
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
    case "patient-aufgenommen":
    case "patientendaten-geaendert":
      return [patientTag(event.data.patientennummer)];
  }
}

export function praxisTag(praxiskuerzel: string): string {
  return `praxis:${praxiskuerzel}`;
}

export function gebuehrTag(ziffer: string): string {
  return `gebuehr:${ziffer}`;
}

export function patientTag(patientennummer: number): string {
  return `patient:${patientennummer}`;
}
