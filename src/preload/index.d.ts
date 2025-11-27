// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

import type {
  NimmPatientAufCommandDto,
  NimmPatientAufCommandStatusDto,
  PatientenkarteiQueryDto,
  PatientenkarteiQueryResultDto,
} from "../shared/infrastructure/naturheilpraxis";
import type { EinstellungenDto } from "../shared/infrastructure/einstellungen";

export interface Naturheilpraxis {
  nimmPatientAuf(
    command: NimmPatientAufCommandDto,
  ): Promise<NimmPatientAufCommandStatusDto>;

  queryPatientenkartei(
    query: PatientenkarteiQueryDto,
  ): Promise<PatientenkarteiQueryResultDto>;

  ladeEinstellungen(): Promise<EinstellungenDto>;
}

declare global {
  interface Window {
    naturheilpraxis: Naturheilpraxis;
  }
}
