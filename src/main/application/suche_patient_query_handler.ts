// Copyright (c) 2026 Falko Schumann. All rights reserved. MIT license.

import {
  type SuchePatientQuery,
  SuchePatientQueryResult,
} from "../../shared/domain/suche_patient_query";
import type { EventStore } from "../infrastructure/event_store";
import { projectPatienten } from "../domain/patienten_projection";

export async function suchePatient(
  query: SuchePatientQuery,
  eventStore: EventStore,
) {
  const patienten = await projectPatienten(eventStore.replay());
  for await (const patient of patienten) {
    if (patient.nummer === query.nummer) {
      return SuchePatientQueryResult.create({ patient });
    }
  }

  return SuchePatientQueryResult.create();
}
