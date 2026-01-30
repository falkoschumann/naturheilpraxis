// Copyright (c) 2026 Falko Schumann. All rights reserved. MIT license.

import type { Settings } from "../../shared/domain/settings";
import type { NimmPatientAufCommand } from "../../shared/domain/nimm_patient_auf_command";
import type { PatientQuery } from "../../shared/domain/suche_patient_query";
import type { PatientenQuery } from "../../shared/domain/suche_patienten_query";
import { MessageGateway } from "../infrastructure/message_gateway";

export class MessageHandler {
  static create() {
    return new MessageHandler(MessageGateway.create());
  }

  static createNull() {
    return new MessageHandler(MessageGateway.createNull());
  }

  #messageGateway: MessageGateway;

  private constructor(message: MessageGateway) {
    this.#messageGateway = message;
  }

  async nimmPatientAuf(command: NimmPatientAufCommand) {
    return this.#messageGateway.nimmPatientAuf(command);
  }

  async suchePatient(query: PatientQuery) {
    return this.#messageGateway.suchePatient(query);
  }

  async suchePatienten(query: PatientenQuery) {
    return this.#messageGateway.suchePatienten(query);
  }

  async loadSettings() {
    return this.#messageGateway.loadSettings();
  }

  async storeSettings(settings: Settings) {
    await this.#messageGateway.storeSettings(settings);
  }
}
