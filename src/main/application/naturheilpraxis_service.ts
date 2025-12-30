// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

import {
  type NimmPatientAufCommand,
  type NimmPatientAufCommandStatus,
  NimmPatientAufSuccess,
  Patient,
  type PatientenkarteiQuery,
  type PatientenkarteiQueryResult,
} from "../../shared/domain/naturheilpraxis";
import { EventStore } from "../infrastructure/event_store";
import { PatientAufgenommenV1Event } from "../infrastructure/events"; // TODO handle technical errors, e.g. when the event store is not available

// TODO handle technical errors, e.g. when the event store is not available
//   That is not a failure as command status

export class NaturheilpraxisService {
  static create({
    eventStore = EventStore.create({ fileName: "data/events.ndjson" }),
  }: {
    eventStore?: EventStore;
  } = {}): NaturheilpraxisService {
    return new NaturheilpraxisService(eventStore);
  }

  #eventStore: EventStore;

  constructor(eventStore: EventStore) {
    this.#eventStore = eventStore;
  }

  async nimmPatientAuf(
    command: NimmPatientAufCommand,
  ): Promise<NimmPatientAufCommandStatus> {
    const nummer = await this.#nextPatientennummer();
    const event = PatientAufgenommenV1Event.create({
      nummer,
      nachname: command.nachname,
      vorname: command.vorname,
      geburtsdatum: command.geburtsdatum.toString(),
      annahmejahr: command.annahmejahr,
      praxis: command.praxis,
      anrede: command.anrede || undefined,
      strasse: command.strasse || undefined,
      wohnort: command.wohnort || undefined,
      postleitzahl: command.postleitzahl || undefined,
      staat: command.staat || undefined,
      staatsangehoerigkeit: command.staatsangehoerigkeit || undefined,
      titel: command.titel || undefined,
      beruf: command.beruf || undefined,
      telefon: command.telefon || undefined,
      mobil: command.mobil || undefined,
      eMail: command.eMail || undefined,
      familienstand: command.familienstand || undefined,
      partner: command.partner || undefined,
      eltern: command.eltern || undefined,
      kinder: command.kinder || undefined,
      geschwister: command.geschwister || undefined,
      notizen: command.notizen || undefined,
      schluesselworte:
        command.schluesselworte && command.schluesselworte.length > 0
          ? command.schluesselworte
          : undefined,
    });
    await this.#eventStore.record(event);
    return NimmPatientAufSuccess.create({ nummer });
  }

  async queryPatientenkartei(
    query: PatientenkarteiQuery,
  ): Promise<PatientenkarteiQueryResult> {
    let patienten = await this.#projectPatienten();
    if (query.nummer != null) {
      patienten = patienten.filter((p) => p.nummer === query.nummer);
    }
    return { patienten };
  }

  async #nextPatientennummer() {
    const patienten = await this.#projectPatienten();
    const maxNummer = patienten
      .map((p) => p.nummer)
      .reduce((max, nummer) => (nummer > max ? nummer : max), 0);
    return maxNummer + 1;
  }

  async #projectPatienten(): Promise<Patient[]> {
    const patienten: Patient[] = [];
    const events = this.#eventStore.replay();
    for await (const event of events) {
      if (event.source !== PatientAufgenommenV1Event.SOURCE) {
        continue;
      }

      if (PatientAufgenommenV1Event.isType(event)) {
        const patient = Patient.create(event.data!);
        patienten.push(patient);
      }
    }
    return patienten.sort((a, b) => b.nummer - a.nummer);
  }
}
