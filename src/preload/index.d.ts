// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

import type {
  NimmPatientAufCommand,
  NimmPatientAufCommandStatus,
  PatientenkarteiQuery,
  PatientenkarteiQueryResult,
} from "../shared/domain/naturheilpraxis";
import type { Settings } from "../shared/domain/settings";

export interface Naturheilpraxis {
  nimmPatientAuf(
    command: NimmPatientAufCommand,
  ): Promise<NimmPatientAufCommandStatus>;

  queryPatientenkartei(
    query: PatientenkarteiQuery,
  ): Promise<PatientenkarteiQueryResult>;

  loadSettings(): Promise<Settings>;
}

declare global {
  interface Window {
    naturheilpraxis: Naturheilpraxis;
  }
}
