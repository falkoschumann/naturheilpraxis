// Copyright (c) 2026 Falko Schumann. All rights reserved. MIT license.

import { Patient } from "../../shared/domain/patient";
import { PatientAufgenommenV1Event } from "./patient_events";

export async function projectPatienten(
  events: AsyncGenerator<PatientAufgenommenV1Event>,
) {
  const patienten: Patient[] = [];
  for await (const event of events) {
    const patient = Patient.create(event.data!);
    patienten.push(patient);
  }
  return patienten.sort((a, b) => b.nummer - a.nummer);
}
