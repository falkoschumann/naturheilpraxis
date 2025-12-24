// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

import { EinstellungenGateway } from "../../src/main/infrastructure/einstellungen_gateway";
import {
  type EventStore,
  NdjsonEventStore,
} from "../../src/main/infrastructure/event_store";
import { EinstellungenDto } from "../../src/shared/infrastructure/einstellungen";

import { DatabaseProvider } from "./database_provider";
import { createEinstellungen } from "./einstellungen";
import { createEventsForCustomers } from "./events";

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

  async createEinstellungen() {
    let einstellungen: EinstellungenDto | undefined;
    try {
      const agencies = this.#legacyDatabase.queryAgencies();
      const titles = this.#legacyDatabase.queryTitles();
      const familyStatus = this.#legacyDatabase.queryFamilyStatus();
      const handling = this.#legacyDatabase.queryHandling();
      const standardHandling = this.#legacyDatabase.queryStandardHandling();
      const einstellungen = createEinstellungen(
        agencies,
        titles,
        familyStatus,
        handling,
        standardHandling,
      );
      await this.#einstellungenGateway.sichere(einstellungen);
    } catch (error) {
      console.error(error, einstellungen);
    }
  }

  async createEventLog() {
    const customers = this.#legacyDatabase.queryCustomers();
    const events = createEventsForCustomers(customers);
    for (const event of events) {
      await this.#eventStore.record(event);
    }
  }

  close() {
    this.#legacyDatabase.close();
  }
}
