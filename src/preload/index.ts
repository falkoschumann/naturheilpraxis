// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

import { contextBridge, ipcRenderer } from "electron/renderer";

import {
  LOAD_SETTINGS_CHANNEL,
  NIMM_PATIENT_AUF_CHANNEL,
  STORE_SETTINGS_CHANNEL,
  SUCHE_PATIENT_CHANNEL,
  SUCHE_PATIENTEN_CHANNEL,
} from "../shared/infrastructure/channels";
import type {
  NimmPatientAufCommandDto,
  NimmPatientAufCommandStatusDto,
} from "../shared/infrastructure/nimm_patient_auf_command_dto";
import {
  PatientQueryDto,
  type PatientQueryResultDto,
} from "../shared/infrastructure/suche_patient_query_dto";
import {
  type PatientenQueryDto,
  PatientenQueryResultDto,
} from "../shared/infrastructure/suche_patienten_query_dto";
import type { SettingsDto } from "../shared/infrastructure/settings_dto";

contextBridge.exposeInMainWorld("naturheilpraxisIpc", {
  nimmPatientAuf: (
    command: NimmPatientAufCommandDto,
  ): Promise<NimmPatientAufCommandStatusDto> =>
    ipcRenderer.invoke(NIMM_PATIENT_AUF_CHANNEL, command),

  suchePatient: (query: PatientQueryDto): Promise<PatientQueryResultDto> =>
    ipcRenderer.invoke(SUCHE_PATIENT_CHANNEL, query),

  suchePatienten: (
    query: PatientenQueryDto,
  ): Promise<PatientenQueryResultDto> =>
    ipcRenderer.invoke(SUCHE_PATIENTEN_CHANNEL, query),

  loadSettings: (): Promise<SettingsDto> =>
    ipcRenderer.invoke(LOAD_SETTINGS_CHANNEL),

  storeSettings: (settings: SettingsDto) =>
    ipcRenderer.invoke(STORE_SETTINGS_CHANNEL, settings),
});
