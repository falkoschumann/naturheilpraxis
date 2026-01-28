// Copyright (c) 2026 Falko Schumann. All rights reserved. MIT license.

import { NimmPatientAufCommand } from "../../shared/domain/nimm_patient_auf_command";
import type { PatientQuery } from "../../shared/domain/suche_patient_query";
import type { PatientenQuery } from "../../shared/domain/suche_patienten_query";
import { Settings } from "../../shared/domain/settings";
import {
  NimmPatientAufCommandDto,
  NimmPatientAufCommandStatusDto,
} from "../../shared/infrastructure/nimm_patient_auf_command_dto";
import {
  PatientQueryDto,
  PatientQueryResultDto,
} from "../../shared/infrastructure/suche_patient_query_dto";
import {
  PatientenQueryDto,
  PatientenQueryResultDto,
} from "../../shared/infrastructure/suche_patienten_query_dto";
import { SettingsDto } from "../../shared/infrastructure/settings_dto";

export class MessageGateway {
  static create() {
    return new MessageGateway();
  }

  private constructor() {}

  async nimmPatientAuf(command: NimmPatientAufCommand) {
    const statusDto = await window.naturheilpraxisIpc.nimmPatientAuf(
      NimmPatientAufCommandDto.fromModel(command),
    );
    return NimmPatientAufCommandStatusDto.create(statusDto).validate();
  }

  async suchePatient(query: PatientQuery) {
    const resultDto = await window.naturheilpraxisIpc.suchePatient(
      PatientQueryDto.fromModel(query),
    );
    return PatientQueryResultDto.create(resultDto).validate();
  }

  async suchePatienten(query: PatientenQuery) {
    const resultDto = await window.naturheilpraxisIpc.suchePatienten(
      PatientenQueryDto.fromModel(query),
    );
    return PatientenQueryResultDto.create(resultDto).validate();
  }

  async loadSettings() {
    const settingsDto = await window.naturheilpraxisIpc.loadSettings();
    return SettingsDto.create(settingsDto).validate();
  }

  async storeSettings(Settings: Settings) {
    await window.naturheilpraxisIpc.storeSettings(
      SettingsDto.fromModel(Settings),
    );
  }
}
