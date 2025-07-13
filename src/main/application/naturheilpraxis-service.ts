// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

import { type CommandStatus, Success } from "../common/messages";
import type {
  NimmPatientAufCommand,
  Patient,
  PatientenkarteiQuery,
  PatientenkarteiQueryResult,
} from "../domain/naturheilpraxis";
import type { EventStore } from "../integration/event-store";
import {
  PATIENT_SOURCE,
  PatientAufgenommenV1Event,
} from "../integration/events";

export class NaturheilpraxisService {
  #eventStore: EventStore;

  constructor(eventStore: EventStore) {
    this.#eventStore = eventStore;
  }

  async nimmPatientAuf(command: NimmPatientAufCommand): Promise<CommandStatus> {
    const nummer = await this.#nextPatientennummer();
    const event = new PatientAufgenommenV1Event({ ...command, nummer });
    await this.#eventStore.record(event);
    return new Success();
  }

  async patientenkartei(
    _query: PatientenkarteiQuery,
  ): Promise<PatientenkarteiQueryResult> {
    const patienten = await this.#projectPatienten();
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
      if (event.source !== PATIENT_SOURCE) {
        continue;
      }

      if (PatientAufgenommenV1Event.isType(event)) {
        const patient = event.data!;
        patienten.push(patient);
      }
    }
    return patienten;
  }
}
