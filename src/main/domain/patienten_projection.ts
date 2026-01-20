// Copyright (c) 2026 Falko Schumann. All rights reserved. MIT license.

import type { Event } from "./event_store";
import { Patient } from "../../shared/domain/patient";
import { PATIENT_SOURCE, PatientAufgenommenV1Event } from "./patient_events";

export async function projectPatienten(events: AsyncGenerator<Event>) {
  const patienten: Patient[] = [];
  for await (const event of events) {
    if (event.source !== PATIENT_SOURCE) {
      continue;
    }

    if (PatientAufgenommenV1Event.isType(event)) {
      try {
        const patient = Patient.create(event.data!);
        patienten.push(patient);
      } catch (error) {
        console.error("Could not create patient from:", event.data, error);
      }
    }
  }
  return patienten.sort((a, b) => b.nummer - a.nummer);
}
