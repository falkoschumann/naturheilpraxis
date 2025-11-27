// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

import { EinstellungenGateway } from "../infrastructure/einstellungen-gateway";
import { Einstellungen } from "../../shared/domain/einstellungen";

export class EinstellungenService {
  static create() {
    return new EinstellungenService(EinstellungenGateway.create());
  }

  readonly einstellungenGateway: EinstellungenGateway;

  constructor(einstellungenGateway: EinstellungenGateway) {
    this.einstellungenGateway = einstellungenGateway;
  }

  async ladeEinstellungen(): Promise<Einstellungen> {
    const einstellungen = await this.einstellungenGateway.lade();
    return einstellungen ?? Einstellungen.createDefault();
  }

  async sichereEinstellungen(einstellungen: Einstellungen): Promise<void> {
    await this.einstellungenGateway.sichere(einstellungen);
  }
}
