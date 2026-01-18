// Copyright (c) 2026 Falko Schumann. All rights reserved. MIT license.

import { projectPatienten } from "./patienten_projection";
import type { SequencedEvent } from "../infrastructure/event_store";
import type { CloudEventV1WithData } from "../infrastructure/cloud_event_store";

export async function projectNextPatientennummer(
  events: AsyncGenerator<SequencedEvent<CloudEventV1WithData>>,
) {
  const patienten = await projectPatienten(events);
  const maxNummer = patienten[patienten.length - 1]?.nummer ?? 0;
  return maxNummer + 1;
}
