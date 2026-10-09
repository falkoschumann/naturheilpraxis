// Copyright (c) 2026 Falko Schumann. MIT license.

import type {
  CommandStatus,
  NaturheilpraxisApi,
} from "../../../shared/application/naturheilpraxis-api.ts";
import type { ConsistencyBoundary } from "../../../shared/domain/consistency-boundary.ts";
import { matches, type DomainEvent } from "../../../shared/domain/events.ts";
import * as gebuehrenansicht from "../../../shared/domain/gebuehrenansicht.ts";
import * as gebuehrenverzeichnis from "../../../shared/domain/gebuehrenverzeichnis.ts";
import * as praxenansicht from "../../../shared/domain/praxenansicht.ts";
import * as praxisverwaltung from "../../../shared/domain/praxisverwaltung.ts";

type Command =
  | praxisverwaltung.PraxisverwaltungCommand
  | gebuehrenverzeichnis.GebuehrenverzeichnisCommand;

// Executes the commands with the domain in memory and records them, so the
// tests of the user interface need no main process. A given status replaces
// the result of every command, e.g. to simulate a rejection.
export class FakeNaturheilpraxisApi implements NaturheilpraxisApi {
  readonly commands: Command[] = [];

  readonly #events: DomainEvent[];
  readonly #status?: CommandStatus;

  constructor({
    events = [],
    status,
  }: { events?: DomainEvent[]; status?: CommandStatus } = {}) {
    this.#events = [...events];
    this.#status = status;
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
    return praxenansicht.praxenErmitteln(
      praxenansicht.projectAll(praxenansicht.initialReadModel, this.#events),
      query,
    );
  }

  async praxisErmitteln(
    query: praxenansicht.PraxisErmittelnQuery,
  ): Promise<praxenansicht.PraxisErmittelnQueryResult> {
    return praxenansicht.praxisErmitteln(
      praxenansicht.projectAll(praxenansicht.initialReadModel, this.#events),
      query,
    );
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
    return gebuehrenansicht.gebuehrenErmitteln(
      gebuehrenansicht.projectAll(
        gebuehrenansicht.initialReadModel,
        this.#events,
      ),
      query,
    );
  }

  #execute<State, C extends Command, Event extends DomainEvent>(
    boundary: ConsistencyBoundary<State, C, Event>,
    command: C,
  ): CommandStatus {
    this.commands.push(command);
    if (this.#status !== undefined) {
      return this.#status;
    }

    const query = boundary.consults(command);
    const events = this.#events.filter((event) =>
      matches(event, query),
    ) as Event[];
    const result = boundary.decide(
      boundary.evolveAll(boundary.initialState, events),
      command,
    );
    if (!result.ok) {
      return { success: false, errorMessage: result.error.message };
    }

    this.#events.push(...result.value);
    return { success: true };
  }
}
