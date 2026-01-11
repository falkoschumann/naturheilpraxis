// Copyright (c) 2026 Falko Schumann. All rights reserved. MIT license.

import type { CloudEventV1 } from "cloudevents";

import { projectPatienten } from "./patienten_projection";

export async function projectNextPatientennummer(
  replay: AsyncGenerator<CloudEventV1<unknown>>,
): Promise<number> {
  const patienten = await projectPatienten(replay);
  const maxNummer = patienten
    .map((p) => p.nummer)
    .reduce((max, nummer) => (nummer > max ? nummer : max), 0);
  return maxNummer + 1;
}
