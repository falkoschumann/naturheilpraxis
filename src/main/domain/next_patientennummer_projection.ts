// Copyright (c) 2026 Falko Schumann. All rights reserved. MIT license.

import type { SequencedEvent } from "./event_store";
import { projectPatienten } from "./patienten_projection";

export async function projectNextPatientennummer(
  events: AsyncGenerator<SequencedEvent>,
) {
  const patienten = await projectPatienten(events);
  const maxNummer = patienten[patienten.length - 1]?.nummer ?? 0;
  return maxNummer + 1;
}
