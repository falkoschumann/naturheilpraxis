// Copyright (c) 2026 Falko Schumann. All rights reserved. MIT license.

import {
  type SuchePatientenQuery,
  SuchePatientenQueryResult,
} from "../../shared/domain/suche_patienten_query";
import { projectPatienten } from "../domain/patienten_projection";
import { Query } from "../infrastructure/event_store";
import type { CloudEventStore } from "../infrastructure/cloud_event_store";

export async function suchePatienten(
  _query: SuchePatientenQuery,
  eventStore: CloudEventStore,
) {
  const events = eventStore.read(Query.all());
  const patienten = await projectPatienten(events);
  return SuchePatientenQueryResult.create({ patienten });
}
