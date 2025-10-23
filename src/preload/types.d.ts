// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

import type { Configuration } from "../shared/domain/configuration";
import type {
  NimmPatientAufCommand,
  NimmPatientAufCommandStatus,
  PatientenkarteiQuery,
  PatientenkarteiQueryResult,
} from "../shared/domain/naturheilpraxis";

export interface Naturheilpraxis {
  configuration: Configuration;

  nimmPatientAuf: (
    command: NimmPatientAufCommand,
  ) => Promise<NimmPatientAufCommandStatus>;

  patientenkartei: (
    query: PatientenkarteiQuery,
  ) => Promise<PatientenkarteiQueryResult>;
}

declare global {
  interface Window {
    naturheilpraxis: Naturheilpraxis;
  }
}
