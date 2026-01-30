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
    return new MessageGateway(window.naturheilpraxis);
  }

  static createNull() {
    return new MessageGateway(new naturheilpraxisStub());
  }

  #naturheilpraxis: typeof window.naturheilpraxis;

  private constructor(naturheilpraxis: typeof window.naturheilpraxis) {
    this.#naturheilpraxis = naturheilpraxis;
  }

  async nimmPatientAuf(command: NimmPatientAufCommand) {
    const statusDto = await this.#naturheilpraxis.nimmPatientAuf(
      NimmPatientAufCommandDto.fromModel(command),
    );
    return NimmPatientAufCommandStatusDto.create(statusDto).validate();
  }

  async suchePatient(query: PatientQuery) {
    const resultDto = await this.#naturheilpraxis.suchePatient(
      PatientQueryDto.fromModel(query),
    );
    return PatientQueryResultDto.create(resultDto).validate();
  }

  async suchePatienten(query: PatientenQuery) {
    const resultDto = await this.#naturheilpraxis.suchePatienten(
      PatientenQueryDto.fromModel(query),
    );
    return PatientenQueryResultDto.create(resultDto).validate();
  }

  async loadSettings() {
    const settingsDto = await this.#naturheilpraxis.loadSettings();
    return SettingsDto.create(settingsDto).validate();
  }

  async storeSettings(settings: Settings) {
    await this.#naturheilpraxis.storeSettings(SettingsDto.fromModel(settings));
  }
}

class naturheilpraxisStub {
  async nimmPatientAuf() {
    return NimmPatientAufCommandStatusDto.create({
      isSuccess: false,
      errorMessage: "Called nulled command handler.",
    });
  }

  async suchePatient() {
    return PatientQueryResultDto.create();
  }

  async suchePatienten() {
    return PatientenQueryResultDto.create();
  }

  async loadSettings() {
    return SettingsDto.create();
  }

  async storeSettings() {}
}
