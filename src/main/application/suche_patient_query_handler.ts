// Copyright (c) 2026 Falko Schumann. All rights reserved. MIT license.

import type { EventStore } from "../domain/event_store";
import { Query } from "../domain/event_store";
import {
  type SuchePatientQuery,
  SuchePatientQueryResult,
} from "../../shared/domain/suche_patient_query";
import { projectPatienten } from "../domain/patienten_projection";
import { PatientAufgenommenV1Event } from "../domain/patient_events";

export async function suchePatient(
  query: SuchePatientQuery,
  eventStore: EventStore,
) {
  const events = eventStore.replay<PatientAufgenommenV1Event>(
    Query.fromItems([{ types: [PatientAufgenommenV1Event.TYPE] }]),
  );
  const patienten = await projectPatienten(events);
  for await (const patient of patienten) {
    if (patient.nummer === query.nummer) {
      return SuchePatientQueryResult.create({ patient });
    }
  }

  return SuchePatientQueryResult.create();
}
