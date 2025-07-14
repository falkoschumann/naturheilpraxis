// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

import type { Configuration } from "../main/domain/configuration";
import type {
  NimmPatientAufCommand,
  PatientenkarteiResult,
} from "../main/domain/naturheilpraxis";

declare global {
  interface Window {
    app: {
      getConfiguration: () => Configuration;
    };
    naturheilpraxis: {
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
