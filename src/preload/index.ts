// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts

import { contextBridge, ipcRenderer } from "electron";

import type {
  NimmPatientAufCommand,
  PatientenkarteiQuery,
} from "../main/domain/naturheilpraxis";

contextBridge.exposeInMainWorld("app", {
  getConfiguration: () => ipcRenderer.sendSync("getConfiguration"),
});

contextBridge.exposeInMainWorld("naturheilpraxis", {
  nimmPatientAuf: (command: NimmPatientAufCommand) =>
    ipcRenderer.invoke("nimmPatientAuf", command),
  patientenkartei: (query: PatientenkarteiQuery) =>
    ipcRenderer.invoke("patientenkartei", query),
});
