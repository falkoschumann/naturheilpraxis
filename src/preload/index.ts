// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

import { contextBridge, ipcRenderer } from "electron/renderer";

import type {
  NimmPatientAufCommand,
  NimmPatientAufCommandStatus,
  PatientenkarteiQuery,
  PatientenkarteiQueryResult,
} from "../shared/domain/naturheilpraxis";

contextBridge.exposeInMainWorld("naturheilpraxis", {
  configuration: ipcRenderer.sendSync("configuration"),

  nimmPatientAuf: (
    command: NimmPatientAufCommand,
  ): Promise<NimmPatientAufCommandStatus> =>
    ipcRenderer.invoke("nimmPatientAuf", command),

  patientenkartei: (
    query: PatientenkarteiQuery,
  ): Promise<PatientenkarteiQueryResult> =>
    ipcRenderer.invoke("patientenkartei", query),
});
