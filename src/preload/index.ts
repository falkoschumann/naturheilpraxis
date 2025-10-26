// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

import { contextBridge, ipcRenderer } from "electron/renderer";

import type { Configuration } from "../shared/domain/configuration";
import type {
  NimmPatientAufCommand,
  NimmPatientAufCommandStatus,
  PatientenkarteiQuery,
  PatientenkarteiQueryResult,
} from "../shared/domain/naturheilpraxis";
import {
  CONFIGURATION_CHANNEL,
  NIMM_PATIENT_AUF_CHANNEL,
  QUERY_PATIENTENKARTEI_CHANNEL,
} from "../shared/infrastructur/channels";

contextBridge.exposeInMainWorld("naturheilpraxis", {
  configuration: (): Promise<Configuration> =>
    ipcRenderer.invoke(CONFIGURATION_CHANNEL),

  nimmPatientAuf: (
    command: NimmPatientAufCommand,
  ): Promise<NimmPatientAufCommandStatus> =>
    ipcRenderer.invoke(NIMM_PATIENT_AUF_CHANNEL, command),

  patientenkartei: (
    query: PatientenkarteiQuery,
  ): Promise<PatientenkarteiQueryResult> =>
    ipcRenderer.invoke(QUERY_PATIENTENKARTEI_CHANNEL, query),
});
