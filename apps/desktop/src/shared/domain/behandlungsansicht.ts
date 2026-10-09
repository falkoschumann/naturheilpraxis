// Copyright (c) 2026 Falko Schumann. MIT license.

import type { Diagnose } from "./entities.ts";
import type { DomainEvent } from "./events.ts";
import type { Patientennummer } from "./value-objects.ts";

// The Diagnosen by their ID.
export type Behandlungsansicht = Readonly<{
  diagnosen: Readonly<Record<string, Diagnose>>;
}>;

export const initialReadModel: Behandlungsansicht = { diagnosen: {} };

export type Behandlung = Readonly<{ art: "diagnose"; eintrag: Diagnose }>;

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

export function project(
  readModel: Behandlungsansicht,
  event: DomainEvent,
): Behandlungsansicht {
  switch (event.type) {
    case "diagnose-gestellt":
    case "diagnose-geaendert":
      return {
        ...readModel,
        diagnosen: {
          ...readModel.diagnosen,
          [event.data.diagnoseId]: event.data,
        },
      };
    case "diagnose-geloescht":
      return {
        ...readModel,
        diagnosen: Object.fromEntries(
          Object.entries(readModel.diagnosen).filter(
            ([diagnoseId]) => diagnoseId !== event.data.diagnoseId,
          ),
        ),
      };
    default:
      return readModel;
  }
}

export function projectAll(
  readModel: Behandlungsansicht,
  events: readonly DomainEvent[],
): Behandlungsansicht {
  return events.reduce(project, readModel);
}

// The newest first; on the same date the Diagnose comes before the Leistungen.
export function behandlungenErmitteln(
  readModel: Behandlungsansicht,
  query: BehandlungenErmittelnQuery,
): BehandlungenErmittelnQueryResult {
  return diagnosenDes(readModel, query.parameters.patientennummer).map(
    (diagnose) => ({
      art: "diagnose",
      eintrag: diagnose,
    }),
  );
}

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
