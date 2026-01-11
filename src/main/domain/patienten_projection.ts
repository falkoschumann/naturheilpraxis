// Copyright (c) 2026 Falko Schumann. All rights reserved. MIT license.

import type { CloudEventV1 } from "cloudevents";

import { Patient } from "../../shared/domain/patient";
import { PATIENT_SOURCE, PatientAufgenommenV1Event } from "./patient_events";

export async function projectPatienten(
  replay: AsyncGenerator<CloudEventV1<unknown>>,
): Promise<Patient[]> {
  const patienten: Patient[] = [];
  for await (const event of replay) {
    if (event.source !== PATIENT_SOURCE) {
      continue;
    }

    if (PatientAufgenommenV1Event.isType(event)) {
      const patient = Patient.create(event.data!);
      patienten.push(patient);
    }
  }
  return patienten.sort((a, b) => b.nummer - a.nummer);
}
