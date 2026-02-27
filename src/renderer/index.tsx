// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "bootstrap";

import type { NimmPatientAufCommand } from "../shared/domain/nimm_patient_auf_command";
import type { PatientQuery } from "../shared/domain/suche_patient_query";
import type { PatientenQuery } from "../shared/domain/suche_patienten_query";
import type { Einstellungen } from "../shared/domain/einstellungen";
import {
  NimmPatientAufCommandDto,
  NimmPatientAufCommandStatusDto,
} from "../shared/infrastructure/nimm_patient_auf_command_dto";
import { PatientQueryDto, PatientQueryResultDto } from "../shared/infrastructure/suche_patient_query_dto";
import { PatientenQueryDto, PatientenQueryResultDto } from "../shared/infrastructure/suche_patienten_query_dto";
import { EinstellungenDto } from "../shared/infrastructure/einstellungen_dto";
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

  async ladeEinstellungen() {
    const einstellungenDto = await window.naturheilpraxis.ladeEinstellungen();
    return EinstellungenDto.create(einstellungenDto).validate();
  },

  async sichereEinstellungen(einstellungen: Einstellungen) {
    await window.naturheilpraxis.sichereEinstellungen(EinstellungenDto.fromModel(einstellungen));
  },
};

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <MessageHandlerContext value={messageHandler}>
      <App />
    </MessageHandlerContext>
  </StrictMode>,
);
