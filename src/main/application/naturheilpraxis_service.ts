// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

import { nimmPatientAuf } from "./nimm_patient_auf_command_handler";
import {
  type NimmPatientAufCommand,
  type NimmPatientAufCommandStatus,
} from "../../shared/domain/nimm_patient_auf_command";
import { Patient } from "../../shared/domain/patient";
import {
  type PatientenkarteiQuery,
  type PatientenkarteiQueryResult,
} from "../../shared/domain/naturheilpraxis";
import {
  PATIENT_SOURCE,
  PatientAufgenommenV1Event,
} from "../domain/patient_events";
import { EventStore } from "../infrastructure/event_store";

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
    return nimmPatientAuf(command, this.#eventStore);
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

  async #projectPatienten(): Promise<Patient[]> {
    const patienten: Patient[] = [];
    const events = this.#eventStore.replay();
    for await (const event of events) {
      if (event.source !== PATIENT_SOURCE) {
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
