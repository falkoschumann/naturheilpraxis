// Copyright (c) 2026 Falko Schumann. MIT license.

import type {
  CommandStatus,
  NaturheilpraxisApi,
} from "../../shared/application/naturheilpraxis-api.ts";
import type { ConsistencyBoundary } from "../../shared/domain/consistency-boundary.ts";
import type { DomainEvent } from "../../shared/domain/events.ts";
import * as gebuehrenansicht from "../../shared/domain/gebuehrenansicht.ts";
import * as gebuehrenverzeichnis from "../../shared/domain/gebuehrenverzeichnis.ts";
import * as praxenansicht from "../../shared/domain/praxenansicht.ts";
import * as praxisverwaltung from "../../shared/domain/praxisverwaltung.ts";
import type { EventStore } from "../infrastructure/event-store.ts";

// Executes the commands with the consistency boundaries of the domain and
// answers the queries from the read models, which it keeps in memory.
export class NaturheilpraxisService implements NaturheilpraxisApi {
  readonly #eventStore: EventStore;
  #praxenansicht: praxenansicht.Praxenansicht;
  #gebuehrenansicht: gebuehrenansicht.Gebuehrenansicht;

  constructor(eventStore: EventStore) {
    this.#eventStore = eventStore;
    const events = eventStore.query();
    this.#praxenansicht = praxenansicht.projectAll(
      praxenansicht.initialReadModel,
      events,
    );
    this.#gebuehrenansicht = gebuehrenansicht.projectAll(
      gebuehrenansicht.initialReadModel,
      events,
    );
  }

  async praxisAnlegen(
    command: praxisverwaltung.PraxisAnlegenCommand,
  ): Promise<CommandStatus> {
    return this.#execute(praxisverwaltung, command);
  }

  async praxisdatenAendern(
    command: praxisverwaltung.PraxisdatenAendernCommand,
  ): Promise<CommandStatus> {
    return this.#execute(praxisverwaltung, command);
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

  async gebuehrAnlegen(
    command: gebuehrenverzeichnis.GebuehrAnlegenCommand,
  ): Promise<CommandStatus> {
    return this.#execute(gebuehrenverzeichnis, command);
  }

  async gebuehrAendern(
    command: gebuehrenverzeichnis.GebuehrAendernCommand,
  ): Promise<CommandStatus> {
    return this.#execute(gebuehrenverzeichnis, command);
  }

  async gebuehrEntfernen(
    command: gebuehrenverzeichnis.GebuehrEntfernenCommand,
  ): Promise<CommandStatus> {
    return this.#execute(gebuehrenverzeichnis, command);
  }

  async gebuehrenErmitteln(
    query: gebuehrenansicht.GebuehrenErmittelnQuery,
  ): Promise<gebuehrenansicht.GebuehrenErmittelnQueryResult> {
    return gebuehrenansicht.gebuehrenErmitteln(this.#gebuehrenansicht, query);
  }

  #execute<State, Command, Event extends DomainEvent>(
    boundary: ConsistencyBoundary<State, Command, Event>,
    command: Command,
  ): CommandStatus {
    // The event store returns only events of the consulted types, which are
    // the events of this boundary.
    const events = this.#eventStore.query(
      boundary.consults(command),
    ) as Event[];
    const state = boundary.evolveAll(boundary.initialState, events);
    const result = boundary.decide(state, command);
    if (!result.ok) {
      return { success: false, errorMessage: result.error.message };
    }

    this.#publish(result.value);
    return { success: true };
  }

  #publish(events: readonly DomainEvent[]): void {
    if (events.length === 0) {
      return;
    }

    this.#eventStore.append(events);
    this.#praxenansicht = praxenansicht.projectAll(this.#praxenansicht, events);
    this.#gebuehrenansicht = gebuehrenansicht.projectAll(
      this.#gebuehrenansicht,
      events,
    );
  }
}
