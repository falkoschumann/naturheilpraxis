// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

import { EinstellungenGateway } from "../../src/main/infrastructure/einstellungen_gateway";
import {
  EventStore,
  NdjsonEventStore,
} from "../../src/main/infrastructure/event_store.ts";
import { PatientAufgenommenV1Event } from "../../src/main/infrastructure/events.ts";
import { EinstellungenDto } from "../../src/shared/infrastructure/einstellungen.ts";

import { DatabaseProvider } from "./database_provider";

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
    let einstellungen: EinstellungenDto;
    try {
      const praxis = this.#legacyDatabase.queryAgencies();
      const anrede = this.#legacyDatabase.queryTitles();
      const familienstand = this.#legacyDatabase.queryFamilyStatus();
      const schluesselworte = this.#legacyDatabase.queryHandling();
      const standardSchluesselworte =
        this.#legacyDatabase.queryStandardHandling();
      einstellungen = EinstellungenDto.create({
        praxis,
        anrede,
        familienstand,
        schluesselworte,
        standardSchluesselworte,
      });
      EinstellungenDto.fromJson(einstellungen);
      await this.#einstellungenGateway.sichere(einstellungen);
    } catch (error) {
      console.error(error, einstellungen);
    }
  }

  async createEventLog() {
    const customers = this.#legacyDatabase.queryCustomers();
    for (const customer of customers) {
      const event = PatientAufgenommenV1Event.create({
        nummer: customer.id,
        nachname: customer.surname,
        vorname: customer.forename,
        geburtsdatum: customer.dayOfBirth,
        annahmejahr: customer.acceptance,
        praxis: customer.agency,
        anrede: customer.title,
        strasse: customer.street,
        wohnort: customer.city,
        postleitzahl: customer.postalCode,
        staat: customer.country,
        staatsangehoerigkeit: customer.citizenship,
        titel: customer.academicTitle,
        beruf: customer.occupation,
        telefon: customer.callNumber,
        mobil: customer.mobilePhone,
        eMail: customer.email,
        familienstand: customer.familyStatus,
        partner: customer.partnerFrom,
        eltern: customer.childFrom,
        // TODO kinder: customer.,
        // TODO geschwister: customer.,
        notizen: customer.memorandum,
        schluesselworte: customer.handlings?.split(",").map((s) => s.trim()),
      });
      await this.#eventStore.record(event);
    }
  }

  close() {
    this.#legacyDatabase.close();
  }
}
