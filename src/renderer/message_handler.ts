// Copyright (c) 2026 Falko Schumann. All rights reserved. MIT license.

import { createCommandStatus } from "@muspellheim/shared";

import {
  type DiagnosenQuery,
  DiagnosenQueryResult,
} from "../shared/domain/diagnosen_query";
import {
  type LeistungenQuery,
  LeistungenQueryResult,
} from "../shared/domain/leistungen_query";
import { type NimmPatientAufCommand } from "../shared/domain/nimm_patient_auf_command";
import {
  type PatientQuery,
  PatientQueryResult,
} from "../shared/domain/patient_query";
import {
  type PatientenQuery,
  PatientenQueryResult,
} from "../shared/domain/patienten_query";
import {
  type RechnungenQuery,
  RechnungenQueryResult,
} from "../shared/domain/rechnungen_query";
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

  async sucheDiagnosen(query: DiagnosenQuery) {
    let json = JSON.stringify(query);
    json = await window.naturheilpraxis.sucheDiagnosen(json);
    const dto = JSON.parse(json);
    return DiagnosenQueryResult.create(dto);
  },

  async sucheLeistungen(query: LeistungenQuery) {
    let json = JSON.stringify(query);
    json = await window.naturheilpraxis.sucheLeistungen(json);
    const dto = JSON.parse(json);
    return LeistungenQueryResult.create(dto);
  },

  async sucheRechnungen(query: RechnungenQuery) {
    let json = JSON.stringify(query);
    json = await window.naturheilpraxis.sucheRechnungen(json);
    const dto = JSON.parse(json);
    return RechnungenQueryResult.create(dto);
  },
};
