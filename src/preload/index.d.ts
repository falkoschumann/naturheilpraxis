// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

import type {
  NimmPatientAufCommand,
  NimmPatientAufCommand,
} from "../main/domain/naturheilpraxis";

declare global {
  interface Window {
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
