// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

import type { NimmPatientAufCommand } from "../main/domain/naturheilpraxis";
import type { CommandStatus } from "../main/common/messages";

declare global {
  interface Window {
    naturheilpraxis: {
      nimmPatientAuf: (
        command: NimmPatientAufCommand,
      ) => Promise<CommandStatus>;
      patientenkartei: (
        query: PatientenkarteiQuery,
      ) => Promise<PatientenkarteiResult>;
    };
  }
}

export {};
