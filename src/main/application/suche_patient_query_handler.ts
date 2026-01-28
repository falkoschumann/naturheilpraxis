// Copyright (c) 2026 Falko Schumann. All rights reserved. MIT license.

import type { EventStore } from "../infrastructure/event_store";
import { Query } from "../infrastructure/event_store";
import {
  type PatientQuery,
  PatientQueryResult,
} from "../../shared/domain/suche_patient_query";
import { projectPatienten } from "../domain/patienten_projection";
import { PatientAufgenommenV1Event } from "../domain/patient_events";

export type SuchePatientQueryHandlerOptions = {
  eventStore: EventStore;
};

export async function suchePatient(
  query: PatientQuery,
  { eventStore }: SuchePatientQueryHandlerOptions,
) {
  const events = eventStore.replay<PatientAufgenommenV1Event>(
    Query.fromItems([{ types: [PatientAufgenommenV1Event.TYPE] }]),
  );
  const patienten = await projectPatienten(events);
  for await (const patient of patienten) {
    if (patient.nummer === query.nummer) {
      return PatientQueryResult.create({ patient });
    }
  }

  return PatientQueryResult.create();
}
