// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

import { contextBridge, ipcRenderer } from "electron/renderer";

import type {
  NimmPatientAufCommandDto,
  NimmPatientAufCommandStatusDto,
  PatientenkarteiQueryDto,
  PatientenkarteiQueryResultDto,
} from "../shared/infrastructure/naturheilpraxis";
import type { EinstellungenDto } from "../shared/infrastructure/einstellungen";
import {
  LADE_EINSTELLUNGEN_CHANNEL,
  NIMM_PATIENT_AUF_CHANNEL,
  QUERY_PATIENTENKARTEI_CHANNEL,
  SICHERE_EINSTELLUNGEN_CHANNEL,
} from "../shared/infrastructure/channels";

contextBridge.exposeInMainWorld("naturheilpraxis", {
  nimmPatientAuf: (
    command: NimmPatientAufCommandDto,
  ): Promise<NimmPatientAufCommandStatusDto> =>
    ipcRenderer.invoke(NIMM_PATIENT_AUF_CHANNEL, command),

  queryPatientenkartei: (
    query: PatientenkarteiQueryDto,
  ): Promise<PatientenkarteiQueryResultDto> =>
    ipcRenderer.invoke(QUERY_PATIENTENKARTEI_CHANNEL, query),

  ladeEinstellungen: (): Promise<EinstellungenDto> =>
    ipcRenderer.invoke(LADE_EINSTELLUNGEN_CHANNEL),

  sichereEinstellungen: (einstellungen: EinstellungenDto) =>
    ipcRenderer.invoke(SICHERE_EINSTELLUNGEN_CHANNEL, einstellungen),
});
