// Copyright (c) 2026 Falko Schumann. All rights reserved. MIT license.

import {
  type SuchePatientenQuery,
  SuchePatientenQueryResult,
} from "../../shared/domain/suche_patienten_query";
import type { EventStore } from "../infrastructure/event_store";
import { projectPatienten } from "../domain/patienten_projection";

export async function suchePatienten(
  _query: SuchePatientenQuery,
  eventStore: EventStore,
) {
  const patienten = await projectPatienten(eventStore.replay());
  return SuchePatientenQueryResult.create({ patienten });
}
