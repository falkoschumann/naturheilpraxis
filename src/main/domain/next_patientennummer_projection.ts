// Copyright (c) 2026 Falko Schumann. All rights reserved. MIT license.

import type { CloudEventV1 } from "cloudevents";

import { projectPatienten } from "./patienten_projection";

export async function projectNextPatientennummer(
  replay: AsyncGenerator<CloudEventV1<unknown>>,
) {
  const patienten = await projectPatienten(replay);
  const maxNummer = patienten[patienten.length - 1]?.nummer ?? 0;
  return maxNummer + 1;
}
