// Copyright (c) 2026 Falko Schumann. All rights reserved. MIT license.

import { Query } from "../domain/event_store";
import type { CloudEventStore } from "../domain/cloud_event_store";
import {
  type SuchePatientenQuery,
  SuchePatientenQueryResult,
} from "../../shared/domain/suche_patienten_query";
import { projectPatienten } from "../domain/patienten_projection";

export async function suchePatienten(
  _query: SuchePatientenQuery,
  eventStore: CloudEventStore,
) {
  const events = eventStore.read(Query.all());
  const patienten = await projectPatienten(events);
  return SuchePatientenQueryResult.create({ patienten });
}
