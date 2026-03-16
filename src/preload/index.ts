// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

import { contextBridge, ipcRenderer } from "electron/renderer";

import {
  LADE_EINSTELLUNGEN_CHANNEL,
  NIMM_PATIENT_AUF_CHANNEL,
  SICHERE_EINSTELLUNGEN_CHANNEL,
  SUCHE_PATIENT_CHANNEL,
  SUCHE_PATIENTEN_CHANNEL,
} from "../shared/channels";

contextBridge.exposeInMainWorld("naturheilpraxis", {
  nimmPatientAuf: (command: string): Promise<string> =>
    ipcRenderer.invoke(NIMM_PATIENT_AUF_CHANNEL, command),

  suchePatient: (query: string): Promise<string> =>
    ipcRenderer.invoke(SUCHE_PATIENT_CHANNEL, query),

  suchePatienten: (query: string): Promise<string> =>
    ipcRenderer.invoke(SUCHE_PATIENTEN_CHANNEL, query),

  ladeEinstellungen: (): Promise<string> =>
    ipcRenderer.invoke(LADE_EINSTELLUNGEN_CHANNEL),

  sichereEinstellungen: (settings: string): Promise<void> =>
    ipcRenderer.invoke(SICHERE_EINSTELLUNGEN_CHANNEL, settings),
});
