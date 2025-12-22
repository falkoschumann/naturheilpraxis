// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

import { EinstellungenGateway } from "../../src/main/infrastructure/einstellungen_gateway";
import { DatabaseProvider } from "./database_provider";

export class Interactions {
  #legacyDatabase: DatabaseProvider;
  #einstellungenGateway: EinstellungenGateway;

  constructor(legacyDatabaseFile: string, configurationFile: string) {
    this.#legacyDatabase = new DatabaseProvider(legacyDatabaseFile);
    this.#einstellungenGateway = EinstellungenGateway.create({
      fileName: configurationFile,
    });
  }

  async createConfiguration() {
    const praxis = this.#legacyDatabase.queryAgencies();
    const anrede = this.#legacyDatabase.queryTitles();
    const familienstand = this.#legacyDatabase.queryFamilyStatus();
    const schluesselworte = this.#legacyDatabase.queryHandling();
    const standardSchluesselworte =
      this.#legacyDatabase.queryStandardHandling();
    const einstellungen = {
      praxis,
      anrede,
      familienstand,
      schluesselworte,
      standardSchluesselworte,
    };
    await this.#einstellungenGateway.sichere(einstellungen);
  }

  createEventLog() {}

  close() {
    this.#legacyDatabase.close();
  }
}
