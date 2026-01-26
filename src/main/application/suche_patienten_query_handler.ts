// Copyright (c) 2026 Falko Schumann. All rights reserved. MIT license.

import type { EventStore } from "../infrastructure/event_store";
import { Query } from "../infrastructure/event_store";
import {
  type SuchePatientenQuery,
  SuchePatientenQueryResult,
} from "../../shared/domain/suche_patienten_query";
import { projectPatienten } from "../domain/patienten_projection";
import { PatientAufgenommenV1Event } from "../domain/patient_events";

export type SuchePatientenQueryHandlerOptions = {
  eventStore: EventStore;
};

export async function suchePatienten(
  _query: SuchePatientenQuery,
  { eventStore }: SuchePatientenQueryHandlerOptions,
) {
  const events = eventStore.replay<PatientAufgenommenV1Event>(
    Query.fromItems([{ types: [PatientAufgenommenV1Event.TYPE] }]),
  );
  const patienten = await projectPatienten(events);
  return SuchePatientenQueryResult.create({ patienten });
}
