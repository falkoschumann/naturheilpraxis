// Copyright (c) 2026 Falko Schumann. MIT license.

import type {
  CommandStatus,
  NaturheilpraxisApi,
} from "../../shared/application/naturheilpraxis-api.ts";
import type { DomainEvent } from "../../shared/domain/events.ts";
import * as praxenansicht from "../../shared/domain/praxenansicht.ts";
import * as praxisverwaltung from "../../shared/domain/praxisverwaltung.ts";
import type { EventStore } from "../infrastructure/event-store.ts";

// Executes the commands with the consistency boundaries of the domain and
// answers the queries from the read models, which it keeps in memory.
export class NaturheilpraxisService implements NaturheilpraxisApi {
  readonly #eventStore: EventStore;
  #praxenansicht: praxenansicht.Praxenansicht;

  constructor(eventStore: EventStore) {
    this.#eventStore = eventStore;
    this.#praxenansicht = praxenansicht.projectAll(
      praxenansicht.initialReadModel,
      eventStore.query(),
    );
  }

  async praxisAnlegen(
    command: praxisverwaltung.PraxisAnlegenCommand,
  ): Promise<CommandStatus> {
    return this.#praxisverwaltung(command);
  }

  async praxisdatenAendern(
    command: praxisverwaltung.PraxisdatenAendernCommand,
  ): Promise<CommandStatus> {
    return this.#praxisverwaltung(command);
  }

  async praxenErmitteln(
    query: praxenansicht.PraxenErmittelnQuery,
  ): Promise<praxenansicht.PraxenErmittelnQueryResult> {
    return praxenansicht.praxenErmitteln(this.#praxenansicht, query);
  }

  async praxisErmitteln(
    query: praxenansicht.PraxisErmittelnQuery,
  ): Promise<praxenansicht.PraxisErmittelnQueryResult> {
    return praxenansicht.praxisErmitteln(this.#praxenansicht, query);
  }

  #praxisverwaltung(
    command: praxisverwaltung.PraxisverwaltungCommand,
  ): CommandStatus {
    const events = this.#eventStore.query(praxisverwaltung.consults(command));
    const state = praxisverwaltung.evolveAll(
      praxisverwaltung.initialState,
      events as praxisverwaltung.PraxisverwaltungEvent[],
    );
    const result = praxisverwaltung.decide(state, command);
    if (!result.ok) {
      return { success: false, errorMessage: result.error.message };
    }

    this.#publish(result.value);
    return { success: true };
  }

  #publish(events: readonly DomainEvent[]): void {
    this.#eventStore.append(events);
    this.#praxenansicht = praxenansicht.projectAll(this.#praxenansicht, events);
  }
}
