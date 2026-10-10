// Copyright (c) 2026 Falko Schumann. MIT license.

import type { Diagnose, Leistung } from "./entities.ts";
import type { DomainEvent } from "./events.ts";
import type { Patientennummer } from "./value-objects.ts";

// The Diagnosen and Leistungen by their ID.
export type Behandlungsansicht = Readonly<{
  diagnosen: Readonly<Record<string, Diagnose>>;
  leistungen: Readonly<Record<string, Leistung>>;
}>;

export const initialReadModel: Behandlungsansicht = {
  diagnosen: {},
  leistungen: {},
};

export type Behandlung =
  | Readonly<{ art: "diagnose"; eintrag: Diagnose }>
  | Readonly<{ art: "leistung"; eintrag: Leistung }>;

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
  };
  for (const event of events) {
    anwenden(entwurf, event);
  }
  return entwurf;
}

type Entwurf = {
  diagnosen: Record<string, Diagnose>;
  leistungen: Record<string, Leistung>;
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
      .map((leistung) => ({ art: "leistung" as const, eintrag: leistung })),
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
