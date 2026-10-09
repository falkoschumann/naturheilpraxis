// Copyright (c) 2026 Falko Schumann. MIT license.

import type {
  DiagnoseGeaendertEvent,
  DiagnoseGeloeschtEvent,
  DiagnoseGestelltEvent,
} from "./diagnosestellung.ts";
import type { AbrechnungEvent } from "./abrechnung.ts";
import type { GebuehrenverzeichnisEvent } from "./gebuehrenverzeichnis.ts";
import type {
  LeistungGeaendertEvent,
  LeistungGeloeschtEvent,
  LeistungErbrachtEvent,
} from "./leistungserbringung.ts";
import type { PatientAufgenommenEvent } from "./patientenaufnahme.ts";
import type { PatientendatenGeaendertEvent } from "./patientenkartei.ts";
import type { PraxisverwaltungEvent } from "./praxisverwaltung.ts";

export type DomainEvent =
  | PraxisverwaltungEvent
  | GebuehrenverzeichnisEvent
  | PatientAufgenommenEvent
  | PatientendatenGeaendertEvent
  | DiagnoseGestelltEvent
  | DiagnoseGeaendertEvent
  | DiagnoseGeloeschtEvent
  | LeistungErbrachtEvent
  | LeistungGeaendertEvent
  | LeistungGeloeschtEvent
  | AbrechnungEvent;

export type DomainEventType = DomainEvent["type"];

// Selects the events a consistency boundary consults: an event matches if it
// matches one of the items. It matches an item if it has one of the types and
// all of the tags.
export type EventQuery = readonly EventQueryItem[];

export type EventQueryItem = Readonly<{
  types: readonly DomainEventType[];
  tags?: readonly string[];
}>;

export function matches(
  event: DomainEvent,
  query: EventQuery,
  tags: readonly string[] = tagsOf(event),
): boolean {
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
    case "diagnose-gestellt":
    case "diagnose-geaendert":
    case "diagnose-geloescht":
      return [diagnoseTag(event.data.diagnoseId)];
    case "leistung-erbracht":
    case "leistung-geaendert":
    case "leistung-geloescht":
      return [leistungTag(event.data.leistungId)];
    // A Rechnung tags its events with its Leistungen as far as they are known
    // from the event.
    case "rechnung-erstellt":
    case "rechnung-geaendert":
      return [
        rechnungTag(event.data.rechnungId),
        ...event.data.leistungen.map(leistungTag),
      ];
    case "entwurf-geloescht":
    case "rechnung-versendet":
    case "rechnung-bezahlt":
    case "rechnungszahlung-zurueckgenommen":
    case "rechnungsversand-zurueckgenommen":
      return [rechnungTag(event.data.rechnungId)];
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

export function diagnoseTag(diagnoseId: string): string {
  return `diagnose:${diagnoseId}`;
}

export function leistungTag(leistungId: string): string {
  return `leistung:${leistungId}`;
}

export function rechnungTag(rechnungId: string): string {
  return `rechnung:${rechnungId}`;
}
