// Copyright (c) 2026 Falko Schumann. All rights reserved. MIT license.

import {
  type SuchePatientenQuery,
  SuchePatientenQueryResult,
} from "../../shared/domain/suche_patienten_query";
import { projectPatienten } from "../domain/patienten_projection";
import type { NdjsonEventStore } from "../infrastructure/ndjson_event_store";

export async function suchePatienten(
  _query: SuchePatientenQuery,
  eventStore: NdjsonEventStore,
) {
  const patienten = await projectPatienten(eventStore.replay());
  return SuchePatientenQueryResult.create({ patienten });
}
