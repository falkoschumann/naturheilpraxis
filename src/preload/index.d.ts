// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

import type { Configuration } from "../main/domain/configuration";
import type {
  NimmPatientAufCommand,
  NimmPatientAufCommandStatus,
  PatientenkarteiQuery,
  PatientenkarteiResult,
} from "../main/domain/naturheilpraxis";

declare global {
  interface Window {
    naturheilpraxis: {
      configuration: Configuration;
      nimmPatientAuf: (
        command: NimmPatientAufCommand,
      ) => Promise<NimmPatientAufCommandStatus>;
      patientenkartei: (
        query: PatientenkarteiQuery,
      ) => Promise<PatientenkarteiResult>;
    };
  }
}

export {};
