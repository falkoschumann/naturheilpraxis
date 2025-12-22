// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

import { DatabaseProvider } from "./database_provider.ts";
import { FileProvider } from "./file_provider.ts";

export class Interactions {
  #legacyDatabase: DatabaseProvider;
  #configurationFile: FileProvider;

  constructor(legacyDatabaseFile: string, configurationFile: string) {
    this.#legacyDatabase = new DatabaseProvider(legacyDatabaseFile);
    this.#configurationFile = new FileProvider(configurationFile);
  }

  createConfiguration() {
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
    this.#configurationFile.writeJson(einstellungen);
  }

  close() {
    this.#legacyDatabase.close();
  }
}
