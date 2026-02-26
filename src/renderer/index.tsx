// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "bootstrap";

import type { NimmPatientAufCommand } from "../shared/domain/nimm_patient_auf_command";
import type { PatientQuery } from "../shared/domain/suche_patient_query";
import type { PatientenQuery } from "../shared/domain/suche_patienten_query";
import type { Settings } from "../shared/domain/settings";
import {
  NimmPatientAufCommandDto,
  NimmPatientAufCommandStatusDto,
} from "../shared/infrastructure/nimm_patient_auf_command_dto";
import { PatientQueryDto, PatientQueryResultDto } from "../shared/infrastructure/suche_patient_query_dto";
import { PatientenQueryDto, PatientenQueryResultDto } from "../shared/infrastructure/suche_patienten_query_dto";
import { SettingsDto } from "../shared/infrastructure/settings_dto";
import "./ui/assets/style.scss";
import { MessageHandlerContext } from "./ui/components/message_handler_context";
import App from "./ui";

const messageHandler = {
  async nimmPatientAuf(command: NimmPatientAufCommand) {
    const statusDto = await window.naturheilpraxis.nimmPatientAuf(NimmPatientAufCommandDto.fromModel(command));
    return NimmPatientAufCommandStatusDto.create(statusDto).validate();
  },

  async suchePatient(query: PatientQuery) {
    const resultDto = await window.naturheilpraxis.suchePatient(PatientQueryDto.fromModel(query));
    return PatientQueryResultDto.create(resultDto).validate();
  },

  async suchePatienten(query: PatientenQuery) {
    const resultDto = await window.naturheilpraxis.suchePatienten(PatientenQueryDto.fromModel(query));
    return PatientenQueryResultDto.create(resultDto).validate();
  },

  async loadSettings() {
    const settingsDto = await window.naturheilpraxis.loadSettings();
    return SettingsDto.create(settingsDto).validate();
  },

  async storeSettings(settings: Settings) {
    await window.naturheilpraxis.storeSettings(SettingsDto.fromModel(settings));
  },
};

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <MessageHandlerContext value={messageHandler}>
      <App />
    </MessageHandlerContext>
  </StrictMode>,
);
