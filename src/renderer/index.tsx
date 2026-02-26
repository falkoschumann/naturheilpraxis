// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "bootstrap";

import type { NimmPatientAufCommand } from "../shared/domain/nimm_patient_auf_command";
import type { PatientQuery } from "../shared/domain/suche_patient_query";
import type { PatientenQuery } from "../shared/domain/suche_patienten_query";
import type { Settings } from "../shared/domain/settings";
import { MessageGateway } from "./infrastructure/message_gateway";
import "./ui/assets/style.scss";
import type { MessageHandler } from "./ui/components/message_handler";
import { MessageHandlerContext } from "./ui/components/message_handler_context";
import App from "./ui";

const messageGateway = MessageGateway.create();

const messageHandler: MessageHandler = {
  async nimmPatientAuf(command: NimmPatientAufCommand) {
    return messageGateway.nimmPatientAuf(command);
  },

  async suchePatient(query: PatientQuery) {
    return messageGateway.suchePatient(query);
  },

  async suchePatienten(query: PatientenQuery) {
    return messageGateway.suchePatienten(query);
  },

  async loadSettings() {
    return messageGateway.loadSettings();
  },

  async storeSettings(settings: Settings) {
    await messageGateway.storeSettings(settings);
  },
};

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <MessageHandlerContext value={messageHandler}>
      <App />
    </MessageHandlerContext>
  </StrictMode>,
);
