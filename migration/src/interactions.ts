// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

import type { Einstellungen } from "../../src/shared/domain/einstellungen";
import { EinstellungenGateway } from "../../src/main/infrastructure/einstellungen_gateway";
import {
  type EventStore,
  NdjsonEventStore,
} from "../../src/main/infrastructure/event_store";

import { DatabaseProvider } from "./database_provider";
import { createEinstellungen } from "./einstellungen";
import { erzeugeEventsFuerPatienten } from "./events";

export class Interactions {
  #legacyDatabase: DatabaseProvider;
  #einstellungenGateway: EinstellungenGateway;
  #eventStore: EventStore;

  constructor(
    legacyDatabaseFile: string,
    configurationFile: string,
    eventLogFile: string,
  ) {
    this.#legacyDatabase = new DatabaseProvider(legacyDatabaseFile);
    this.#einstellungenGateway = EinstellungenGateway.create({
      fileName: configurationFile,
    });
    this.#eventStore = NdjsonEventStore.create({ fileName: eventLogFile });
  }

  async erstelleEinstellungen(): Promise<Einstellungen> {
    let agencies;
    let titles;
    let familyStatus;
    let handling;
    let standardHandling;
    try {
      agencies = this.#legacyDatabase.queryAgencies();
      titles = this.#legacyDatabase.queryTitles();
      familyStatus = this.#legacyDatabase.queryFamilyStatus();
      handling = this.#legacyDatabase.queryHandling();
      standardHandling = this.#legacyDatabase.queryStandardHandling();
      const einstellungen = createEinstellungen({
        agencies,
        titles,
        familyStatus,
        handling,
        standardHandling,
      });
      await this.#einstellungenGateway.sichere(einstellungen);
      return einstellungen;
    } catch (error) {
      console.error(
        "Fehler beim Migrieren der Einstellungen.",
        {
          agencies,
          titles,
          familyStatus,
          handling,
          standardHandling,
        },
        error,
      );
      throw Error("Fehler beim Migrieren der Einstellungen.", { cause: error });
    }
  }

  async erstelleEventLog(einstellungen: Einstellungen): Promise<void> {
    const customers = this.#legacyDatabase.queryCustomers();
    const events = erzeugeEventsFuerPatienten(customers, einstellungen);
    for (const event of events) {
      await this.#eventStore.record(event);
    }
  }

  dispose() {
    this.#legacyDatabase.close();
  }
}
