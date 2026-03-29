// Copyright (c) 2026 Falko Schumann. All rights reserved. MIT license.

import { createCommandStatus } from "@muspellheim/shared";

import { Einstellungen } from "../shared/domain/einstellungen";
import { type NimmPatientAufCommand } from "../shared/domain/nimm_patient_auf_command";
import {
  type PatientQuery,
  PatientQueryResult,
} from "../shared/domain/suche_patient_query";
import {
  type PatientenQuery,
  PatientenQueryResult,
} from "../shared/domain/suche_patienten_query";
import type { MessageHandler } from "./ui/components/message_handler";

export const messageHandler: MessageHandler = {
  async nimmPatientAuf(command: NimmPatientAufCommand) {
    let json = JSON.stringify(command);
    json = await window.naturheilpraxis.nimmPatientAuf(json);
    const dto = JSON.parse(json);
    return createCommandStatus(dto);
  },

  async suchePatient(query: PatientQuery) {
    let json = JSON.stringify(query);
    json = await window.naturheilpraxis.suchePatient(json);
    const dto = JSON.parse(json);
    return PatientQueryResult.create(dto);
  },

  async suchePatienten(query: PatientenQuery) {
    let json = JSON.stringify(query);
    json = await window.naturheilpraxis.suchePatienten(json);
    const dto = JSON.parse(json);
    return PatientenQueryResult.create(dto);
  },

  async ladeEinstellungen() {
    const json = await window.naturheilpraxis.ladeEinstellungen();
    const dto = JSON.parse(json);
    return Einstellungen.create(dto);
  },

  async sichereEinstellungen(einstellungen: Einstellungen) {
    const json = JSON.stringify(einstellungen);
    await window.naturheilpraxis.sichereEinstellungen(json);
  },
};
