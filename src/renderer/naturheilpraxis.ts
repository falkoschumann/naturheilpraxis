// Copyright (c) 2026 Falko Schumann. All rights reserved. MIT license.

import {
  NimmPatientAufCommand,
  type NimmPatientAufCommandStatus,
} from "../shared/domain/nimm_patient_auf_command";
import {
  type SuchePatientQuery,
  SuchePatientQueryResult,
} from "../shared/domain/suche_patient_query";
import type {
  SuchePatientenQuery,
  SuchePatientenQueryResult,
} from "../shared/domain/suche_patienten_query";
import { Settings } from "../shared/domain/settings";
import {
  SuchePatientenQueryDto,
  SuchePatientenQueryResultDto,
} from "../shared/infrastructure/suche_patienten_query_dto";
import {
  NimmPatientAufCommandDto,
  NimmPatientAufCommandStatusDto,
} from "../shared/infrastructure/nimm_patient_auf_command_dto";
import {
  SuchePatientQueryDto,
  SuchePatientQueryResultDto,
} from "../shared/infrastructure/suche_patient_query_dto";
import { SettingsDto } from "../shared/infrastructure/settings_dto";

// TODO hold settings in property and use updateSettings method

export interface Naturheilpraxis {
  nimmPatientAuf(
    command: NimmPatientAufCommand,
  ): Promise<NimmPatientAufCommandStatus>;

  suchePatient(query: SuchePatientQuery): Promise<SuchePatientQueryResult>;

  suchePatienten(
    query: SuchePatientenQuery,
  ): Promise<SuchePatientenQueryResult>;

  loadSettings(): Promise<Settings>;

  storeSettings(Settings: Settings): Promise<void>;
}

declare global {
  interface Window {
    naturheilpraxis: Naturheilpraxis;
  }
}

window.naturheilpraxis = {
  nimmPatientAuf: async (command: NimmPatientAufCommand) => {
    const statusDto = await window.naturheilpraxisIpc.nimmPatientAuf(
      NimmPatientAufCommandDto.fromModel(command),
    );
    return NimmPatientAufCommandStatusDto.create(statusDto).validate();
  },

  suchePatient: async (query: SuchePatientQuery) => {
    const resultDto = await window.naturheilpraxisIpc.suchePatient(
      SuchePatientQueryDto.fromModel(query),
    );
    return SuchePatientQueryResultDto.create(resultDto).validate();
  },

  suchePatienten: async (
    query: SuchePatientenQuery,
  ): Promise<SuchePatientenQueryResult> => {
    const resultDto = await window.naturheilpraxisIpc.suchePatienten(
      SuchePatientenQueryDto.fromModel(query),
    );
    return SuchePatientenQueryResultDto.create(resultDto).validate();
  },

  loadSettings: async (): Promise<Settings> => {
    const settingsDto = await window.naturheilpraxisIpc.loadSettings();
    return SettingsDto.create(settingsDto).validate();
  },

  storeSettings: async (Settings: Settings): Promise<void> => {
    await window.naturheilpraxisIpc.storeSettings(
      SettingsDto.fromModel(Settings),
    );
  },
} as Naturheilpraxis;
