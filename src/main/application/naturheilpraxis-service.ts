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
  type PatientAufgenommenDataV1,
  PatientAufgenommenV1Event,
} from "../integration/events";

export class NaturheilpraxisService {
  #eventStore: EventStore;

  constructor(eventStore: EventStore) {
    this.#eventStore = eventStore;
  }

  async nimmPatientAuf(command: NimmPatientAufCommand): Promise<CommandStatus> {
    const nummer = await this.#nextPatientennummer();
    const data: PatientAufgenommenDataV1 = { nummer, ...command };
    const event = new PatientAufgenommenV1Event(crypto.randomUUID(), data);
    await this.#eventStore.record(event);
    return new Success();
  }

  async patientenkartei(
    _query: PatientenkarteiQuery,
  ): Promise<PatientenkarteiQueryResult> {
    const patienten: Patient[] = [];
    for await (const event of this.#eventStore.replay()) {
      if (event.source !== PATIENT_SOURCE) {
        continue;
      }

      if (event.type === PatientAufgenommenV1Event.TYPE) {
        const data = event.data as PatientAufgenommenDataV1;
        patienten.push(data);
      }
    }
    return { patienten };
  }

  async #nextPatientennummer() {
    let nummer = 1;
    for await (const event of this.#eventStore.replay()) {
      if (
        event.type === "de.muspellheim.naturheilpraxis.patient-aufgenommen.v1"
      ) {
        const data = event.data as { nummer: number };
        if (data.nummer >= nummer) {
          nummer = data.nummer + 1;
        }
      }
    }
    return nummer;
  }
}
