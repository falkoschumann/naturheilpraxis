// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

import { contextBridge, ipcRenderer } from "electron/renderer";

import {
  LADE_EINSTELLUNGEN_CHANNEL,
  NIMM_PATIENT_AUF_CHANNEL,
  SICHERE_EINSTELLUNGEN_CHANNEL,
  SUCHE_PATIENT_CHANNEL,
  SUCHE_PATIENTEN_CHANNEL,
} from "../shared/channels";
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
import type { EinstellungenDto } from "../shared/infrastructure/einstellungen_dto";

contextBridge.exposeInMainWorld("naturheilpraxis", {
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

  ladeEinstellungen: (): Promise<EinstellungenDto> =>
    ipcRenderer.invoke(LADE_EINSTELLUNGEN_CHANNEL),

  sichereEinstellungen: (settings: EinstellungenDto) =>
    ipcRenderer.invoke(SICHERE_EINSTELLUNGEN_CHANNEL, settings),
});
