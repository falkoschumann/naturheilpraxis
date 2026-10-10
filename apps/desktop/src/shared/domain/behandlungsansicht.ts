// Copyright (c) 2026 Falko Schumann. MIT license.

import type { Diagnose, Leistung, Rechnungsstatus } from "./entities.ts";
import type { DomainEvent } from "./events.ts";
import type { Patientennummer, Rechnungsnummer } from "./value-objects.ts";

type Abrechnung = Readonly<{
  rechnungsnummer?: Rechnungsnummer;
  status: Rechnungsstatus;
  leistungen: readonly string[];
}>;

// The Diagnosen, Leistungen and Rechnungen by their ID and the Rechnung of each
// abgerechnete Leistung.
export type Behandlungsansicht = Readonly<{
  diagnosen: Readonly<Record<string, Diagnose>>;
  leistungen: Readonly<Record<string, Leistung>>;
  rechnungen: Readonly<Record<string, Abrechnung>>;
  rechnungDerLeistung: Readonly<Record<string, string>>;
}>;

export const initialReadModel: Behandlungsansicht = {
  diagnosen: {},
  leistungen: {},
  rechnungen: {},
  rechnungDerLeistung: {},
};

// The Rechnung a Leistung is contained in.
export type Leistungsrechnung = Readonly<{
  rechnungId: string;
  rechnungsnummer?: Rechnungsnummer;
  status: Rechnungsstatus;
}>;

export type Behandlung =
  | Readonly<{ art: "diagnose"; eintrag: Diagnose; rechnung?: never }>
  | Readonly<{
      art: "leistung";
      eintrag: Leistung;
      rechnung?: Leistungsrechnung;
    }>;

export type BehandlungenErmittelnQuery = Readonly<{
  type: "behandlungen-ermitteln";
  parameters: Readonly<{ patientennummer: Patientennummer }>;
}>;

export type BehandlungenErmittelnQueryResult = readonly Behandlung[];

export type DiagnosenErmittelnQuery = Readonly<{
  type: "diagnosen-ermitteln";
  parameters: Readonly<{ patientennummer: Patientennummer }>;
}>;

export type DiagnosenErmittelnQueryResult = readonly Diagnose[];

// Projecting one event is projecting all events of the list.
export function project(
  readModel: Behandlungsansicht,
  event: DomainEvent,
): Behandlungsansicht {
  return projectAll(readModel, [event]);
}

// The events are applied to a private copy of the read model, so that the
// records are copied once and not for each event.
export function projectAll(
  readModel: Behandlungsansicht,
  events: readonly DomainEvent[],
): Behandlungsansicht {
  const entwurf: Entwurf = {
    diagnosen: { ...readModel.diagnosen },
    leistungen: { ...readModel.leistungen },
    rechnungen: { ...readModel.rechnungen },
    rechnungDerLeistung: { ...readModel.rechnungDerLeistung },
  };
  for (const event of events) {
    anwenden(entwurf, event);
  }
  return entwurf;
}

type Entwurf = {
  diagnosen: Record<string, Diagnose>;
  leistungen: Record<string, Leistung>;
  rechnungen: Record<string, Abrechnung>;
  rechnungDerLeistung: Record<string, string>;
};

function anwenden(entwurf: Entwurf, event: DomainEvent): void {
  switch (event.type) {
    case "diagnose-gestellt":
    case "diagnose-geaendert":
      entwurf.diagnosen[event.data.diagnoseId] = event.data;
      break;
    case "diagnose-geloescht":
      delete entwurf.diagnosen[event.data.diagnoseId];
      break;
    case "leistung-erbracht":
    case "leistung-geaendert":
      entwurf.leistungen[event.data.leistungId] = event.data;
      break;
    case "leistung-geloescht":
      delete entwurf.leistungen[event.data.leistungId];
      break;
    case "rechnung-erstellt":
    case "rechnung-geaendert":
      setzeLeistungen(entwurf, event.data.rechnungId, event.data.leistungen);
      break;
    case "entwurf-geloescht":
      setzeLeistungen(entwurf, event.data.rechnungId, []);
      delete entwurf.rechnungen[event.data.rechnungId];
      break;
    case "rechnung-versendet":
      aendereRechnung(entwurf, event.data.rechnungId, (rechnung) => ({
        ...rechnung,
        rechnungsnummer: event.data.rechnungsnummer,
        status: "versendet",
      }));
      break;
    case "rechnungsversand-zurueckgenommen":
      aendereRechnung(entwurf, event.data.rechnungId, ({ leistungen }) => ({
        status: "entwurf",
        leistungen,
      }));
      break;
    case "rechnung-bezahlt":
      aendereRechnung(entwurf, event.data.rechnungId, (rechnung) => ({
        ...rechnung,
        status: "bezahlt",
      }));
      break;
    case "rechnungszahlung-zurueckgenommen":
      aendereRechnung(entwurf, event.data.rechnungId, (rechnung) => ({
        ...rechnung,
        status: "versendet",
      }));
      break;
  }
}

// Leistungen no longer in the Rechnung are not abgerechnet any more.
function setzeLeistungen(
  entwurf: Entwurf,
  rechnungId: string,
  leistungen: readonly string[],
): void {
  const bisher = entwurf.rechnungen[rechnungId];
  for (const leistungId of bisher?.leistungen ?? []) {
    if (entwurf.rechnungDerLeistung[leistungId] === rechnungId) {
      delete entwurf.rechnungDerLeistung[leistungId];
    }
  }
  for (const leistungId of leistungen) {
    entwurf.rechnungDerLeistung[leistungId] = rechnungId;
  }
  entwurf.rechnungen[rechnungId] = {
    ...(bisher ?? { status: "entwurf" }),
    leistungen,
  };
}

function aendereRechnung(
  entwurf: Entwurf,
  rechnungId: string,
  aenderung: (rechnung: Abrechnung) => Abrechnung,
): void {
  const rechnung = entwurf.rechnungen[rechnungId];
  if (rechnung !== undefined) {
    entwurf.rechnungen[rechnungId] = aenderung(rechnung);
  }
}

// The newest first; on the same date the Diagnose comes before the Leistungen.
export function behandlungenErmitteln(
  readModel: Behandlungsansicht,
  query: BehandlungenErmittelnQuery,
): BehandlungenErmittelnQueryResult {
  const { patientennummer } = query.parameters;
  const behandlungen: Behandlung[] = [
    ...diagnosenDes(readModel, patientennummer).map((diagnose) => ({
      art: "diagnose" as const,
      eintrag: diagnose,
    })),
    ...Object.values(readModel.leistungen)
      .filter((leistung) => leistung.patientennummer === patientennummer)
      .map((leistung) => {
        const rechnung = leistungsrechnung(readModel, leistung.leistungId);
        return rechnung === undefined
          ? { art: "leistung" as const, eintrag: leistung }
          : { art: "leistung" as const, eintrag: leistung, rechnung };
      }),
  ];
  return behandlungen.toSorted(
    (a, b) =>
      b.eintrag.datum.localeCompare(a.eintrag.datum) ||
      reihenfolge[a.art] - reihenfolge[b.art],
  );
}

const reihenfolge = { diagnose: 0, leistung: 1 } as const;

export function diagnosenErmitteln(
  readModel: Behandlungsansicht,
  query: DiagnosenErmittelnQuery,
): DiagnosenErmittelnQueryResult {
  return diagnosenDes(readModel, query.parameters.patientennummer);
}

function diagnosenDes(
  readModel: Behandlungsansicht,
  patientennummer: Patientennummer,
): Diagnose[] {
  return Object.values(readModel.diagnosen)
    .filter((diagnose) => diagnose.patientennummer === patientennummer)
    .toSorted((a, b) => b.datum.localeCompare(a.datum));
}

function leistungsrechnung(
  readModel: Behandlungsansicht,
  leistungId: string,
): Leistungsrechnung | undefined {
  const rechnungId = readModel.rechnungDerLeistung[leistungId];
  const rechnung =
    rechnungId === undefined ? undefined : readModel.rechnungen[rechnungId];
  if (rechnungId === undefined || rechnung === undefined) {
    return undefined;
  }
  const { rechnungsnummer, status } = rechnung;
  return rechnungsnummer === undefined
    ? { rechnungId, status }
    : { rechnungId, rechnungsnummer, status };
}
