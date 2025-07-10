// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

import { type CommandStatus, Failure, Success } from "../common/messages";
import type { NimmPatientAufCommand } from "../domain/naturheilpraxis";
import type { EventStore } from "../integration/event-store";
import {
  type PatientAufgenommenData,
  PatientAufgenommenEvent,
} from "../integration/events";

export class NaturheilpraxisService {
  #eventStore: EventStore;

  constructor(eventStore: EventStore) {
    this.#eventStore = eventStore;
  }

  async nimmPatientAuf(command: NimmPatientAufCommand): Promise<CommandStatus> {
    try {
      const nummer = await this.#nextPatientennummer();
      const data: PatientAufgenommenData = { nummer, ...command };
      const event = new PatientAufgenommenEvent(crypto.randomUUID(), data);
      await this.#eventStore.record(event);
      return new Success();
    } catch (error) {
      return new Failure("Fehler beim Aufnehmen des Patienten. " + error);
    }
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
