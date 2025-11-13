// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

import { contextBridge, ipcRenderer } from "electron/renderer";

import type {
  NimmPatientAufCommand,
  NimmPatientAufCommandStatus,
  PatientenkarteiQuery,
  PatientenkarteiQueryResult,
} from "../shared/domain/naturheilpraxis";
import type { Einstellungen } from "../shared/domain/einstellungen";
import {
  LOAD_SETTINGS_CHANNEL,
  NIMM_PATIENT_AUF_CHANNEL,
  QUERY_PATIENTENKARTEI_CHANNEL,
} from "../shared/infrastructure/channels";

contextBridge.exposeInMainWorld("naturheilpraxis", {
  nimmPatientAuf: (
    command: NimmPatientAufCommand,
  ): Promise<NimmPatientAufCommandStatus> =>
    ipcRenderer.invoke(NIMM_PATIENT_AUF_CHANNEL, command),

  queryPatientenkartei: (
    query: PatientenkarteiQuery,
  ): Promise<PatientenkarteiQueryResult> =>
    ipcRenderer.invoke(QUERY_PATIENTENKARTEI_CHANNEL, query),

  loadSettings: (): Promise<Einstellungen> =>
    ipcRenderer.invoke(LOAD_SETTINGS_CHANNEL),
});
