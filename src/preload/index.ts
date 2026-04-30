// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

import { contextBridge, ipcRenderer } from "electron/renderer";

import {
  DIAGNOSEN_CHANNEL,
  LEISTUNGEN_CHANNEL,
  NIMM_PATIENT_AUF_CHANNEL,
  PATIENT_CHANNEL,
  PATIENTEN_CHANNEL,
  RECHNUNGEN_CHANNEL,
} from "../shared/infrastructure/channels";

contextBridge.exposeInMainWorld("naturheilpraxis", {
  nimmPatientAuf: (command: string): Promise<string> =>
    ipcRenderer.invoke(NIMM_PATIENT_AUF_CHANNEL, command),

  suchePatient: (query: string): Promise<string> =>
    ipcRenderer.invoke(PATIENT_CHANNEL, query),

  suchePatienten: (query: string): Promise<string> =>
    ipcRenderer.invoke(PATIENTEN_CHANNEL, query),

  sucheDiagnosen: (query: string): Promise<string> =>
    ipcRenderer.invoke(DIAGNOSEN_CHANNEL, query),

  sucheLeistungen: (query: string): Promise<string> =>
    ipcRenderer.invoke(LEISTUNGEN_CHANNEL, query),

  sucheRechnungen: (query: string): Promise<string> =>
    ipcRenderer.invoke(RECHNUNGEN_CHANNEL, query),
});
