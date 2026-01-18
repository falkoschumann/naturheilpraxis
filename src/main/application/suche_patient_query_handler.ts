// Copyright (c) 2026 Falko Schumann. All rights reserved. MIT license.

import {
  type SuchePatientQuery,
  SuchePatientQueryResult,
} from "../../shared/domain/suche_patient_query";
import { projectPatienten } from "../domain/patienten_projection";
import { Query } from "../infrastructure/event_store";
import type { CloudEventStore } from "../infrastructure/cloud_event_store";

export async function suchePatient(
  query: SuchePatientQuery,
  eventStore: CloudEventStore,
) {
  const events = eventStore.read(Query.all());
  const patienten = await projectPatienten(events);
  for await (const patient of patienten) {
    if (patient.nummer === query.nummer) {
      return SuchePatientQueryResult.create({ patient });
    }
  }

  return SuchePatientQueryResult.create();
}
