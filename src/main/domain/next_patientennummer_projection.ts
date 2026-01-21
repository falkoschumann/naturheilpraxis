// Copyright (c) 2026 Falko Schumann. All rights reserved. MIT license.

import type { PatientAufgenommenV1Event } from "./patient_events";

export async function projectNextPatientennummer(
  events: AsyncGenerator<PatientAufgenommenV1Event>,
) {
  let letzteNummer = 0;
  for await (const event of events) {
    if (event.data.nummer > letzteNummer) {
      letzteNummer = event.data.nummer;
    }
  }
  return letzteNummer + 1;
}
