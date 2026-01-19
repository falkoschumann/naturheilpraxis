// Copyright (c) 2026 Falko Schumann. All rights reserved. MIT license.

import type { EventStore } from "../domain/event_store";
import { Query } from "../domain/event_store";
import {
  type SuchePatientenQuery,
  SuchePatientenQueryResult,
} from "../../shared/domain/suche_patienten_query";
import { projectPatienten } from "../domain/patienten_projection";

export async function suchePatienten(
  _query: SuchePatientenQuery,
  eventStore: EventStore,
) {
  const events = eventStore.replay(Query.all());
  const patienten = await projectPatienten(events);
  return SuchePatientenQueryResult.create({ patienten });
}
