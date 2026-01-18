// Copyright (c) 2026 Falko Schumann. All rights reserved. MIT license.

import type { SequencedEvent } from "./event_store";
import type { CloudEventV1WithData } from "./cloud_event_store";
import { Patient } from "../../shared/domain/patient";
import { PATIENT_SOURCE, PatientAufgenommenV1Event } from "./patient_events";

export async function projectPatienten(
  events: AsyncGenerator<SequencedEvent<CloudEventV1WithData>>,
) {
  const patienten: Patient[] = [];
  for await (const event of events) {
    if (event.event.source !== PATIENT_SOURCE) {
      continue;
    }

    if (PatientAufgenommenV1Event.isType(event.event)) {
      try {
        const patient = Patient.create(event.event.data!);
        patienten.push(patient);
      } catch (error) {
        console.error(
          "Could not create patient from:",
          event.event.data,
          error,
        );
      }
    }
  }
  return patienten.sort((a, b) => b.nummer - a.nummer);
}
