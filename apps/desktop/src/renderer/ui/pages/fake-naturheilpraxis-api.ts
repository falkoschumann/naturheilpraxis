// Copyright (c) 2026 Falko Schumann. MIT license.

import type {
  CommandStatus,
  NaturheilpraxisApi,
  PatientAufnehmenStatus,
} from "../../../shared/application/naturheilpraxis-api.ts";
import type { ConsistencyBoundary } from "../../../shared/domain/consistency-boundary.ts";
import {
  matches,
  tagsOf,
  type DomainEvent,
} from "../../../shared/domain/events.ts";
import * as abrechnung from "../../../shared/domain/abrechnung.ts";
import * as abrechnungsansicht from "../../../shared/domain/abrechnungsansicht.ts";
import * as behandlungsansicht from "../../../shared/domain/behandlungsansicht.ts";
import * as diagnosestellung from "../../../shared/domain/diagnosestellung.ts";
import * as gebuehrenansicht from "../../../shared/domain/gebuehrenansicht.ts";
import * as leistungserbringung from "../../../shared/domain/leistungserbringung.ts";
import * as gebuehrenverzeichnis from "../../../shared/domain/gebuehrenverzeichnis.ts";
import * as patientenansicht from "../../../shared/domain/patientenansicht.ts";
import * as patientenaufnahme from "../../../shared/domain/patientenaufnahme.ts";
import * as patientenkartei from "../../../shared/domain/patientenkartei.ts";
import * as praxenansicht from "../../../shared/domain/praxenansicht.ts";
import * as praxisverwaltung from "../../../shared/domain/praxisverwaltung.ts";
import * as rechnungsansicht from "../../../shared/domain/rechnungsansicht.ts";
import {
  fail,
  type Rejection,
  type Result,
} from "../../../shared/domain/result.ts";

type Command =
  | praxisverwaltung.PraxisverwaltungCommand
  | gebuehrenverzeichnis.GebuehrenverzeichnisCommand
  | patientenaufnahme.PatientAufnehmenCommand
  | patientenkartei.PatientendatenAendernCommand
  | diagnosestellung.DiagnosestellungCommand
  | leistungserbringung.LeistungserbringungCommand
  | abrechnung.AbrechnungCommand;

// Executes the commands with the domain in memory and records them, so the
// tests of the user interface need no main process. A given rejection replaces
// the result of every command.
export class FakeNaturheilpraxisApi implements NaturheilpraxisApi {
  readonly commands: Command[] = [];

  readonly #events: DomainEvent[];
  // The tags of each event, as the event store keeps them.
  readonly #tags: (readonly string[])[];
  readonly #rejection?: Rejection;

  constructor({
    events = [],
    rejection,
  }: { events?: DomainEvent[]; rejection?: Rejection } = {}) {
    this.#events = [...events];
    this.#tags = events.map((event) => tagsOf(event));
    this.#rejection = rejection;
  }

  async praxisAnlegen(
    command: praxisverwaltung.PraxisAnlegenCommand,
  ): Promise<CommandStatus> {
    return statusOf(this.#execute(praxisverwaltung, command));
  }

  async praxisdatenAendern(
    command: praxisverwaltung.PraxisdatenAendernCommand,
  ): Promise<CommandStatus> {
    return statusOf(this.#execute(praxisverwaltung, command));
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
    return statusOf(this.#execute(gebuehrenverzeichnis, command));
  }

  async gebuehrAendern(
    command: gebuehrenverzeichnis.GebuehrAendernCommand,
  ): Promise<CommandStatus> {
    return statusOf(this.#execute(gebuehrenverzeichnis, command));
  }

  async gebuehrEntfernen(
    command: gebuehrenverzeichnis.GebuehrEntfernenCommand,
  ): Promise<CommandStatus> {
    return statusOf(this.#execute(gebuehrenverzeichnis, command));
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

  async patientAufnehmen(
    command: patientenaufnahme.PatientAufnehmenCommand,
  ): Promise<PatientAufnehmenStatus> {
    const result = this.#execute(patientenaufnahme, command);
    if (!result.ok) {
      return { success: false, errorMessage: result.error.message };
    }
    const aufgenommen = result.value.find(
      (event) => event.type === "patient-aufgenommen",
    );
    return {
      success: true,
      patientennummer: aufgenommen?.data.patientennummer ?? 0,
    };
  }

  async patientendatenAendern(
    command: patientenkartei.PatientendatenAendernCommand,
  ): Promise<CommandStatus> {
    return statusOf(this.#execute(patientenkartei, command));
  }

  async patientenErmitteln(
    query: patientenansicht.PatientenErmittelnQuery,
  ): Promise<patientenansicht.PatientenErmittelnQueryResult> {
    return patientenansicht.patientenErmitteln(
      patientenansicht.projectAll(
        patientenansicht.initialReadModel,
        this.#events,
      ),
      query,
    );
  }

  async patientErmitteln(
    query: patientenansicht.PatientErmittelnQuery,
  ): Promise<patientenansicht.PatientErmittelnQueryResult> {
    return patientenansicht.patientErmitteln(
      patientenansicht.projectAll(
        patientenansicht.initialReadModel,
        this.#events,
      ),
      query,
    );
  }

  async diagnoseStellen(
    command: diagnosestellung.DiagnoseStellenCommand,
  ): Promise<CommandStatus> {
    return statusOf(this.#execute(diagnosestellung, command));
  }

  async diagnoseAendern(
    command: diagnosestellung.DiagnoseAendernCommand,
  ): Promise<CommandStatus> {
    return statusOf(this.#execute(diagnosestellung, command));
  }

  async diagnoseLoeschen(
    command: diagnosestellung.DiagnoseLoeschenCommand,
  ): Promise<CommandStatus> {
    return statusOf(this.#execute(diagnosestellung, command));
  }

  async behandlungenErmitteln(
    query: behandlungsansicht.BehandlungenErmittelnQuery,
  ): Promise<behandlungsansicht.BehandlungenErmittelnQueryResult> {
    return behandlungsansicht.behandlungenErmitteln(
      behandlungsansicht.projectAll(
        behandlungsansicht.initialReadModel,
        this.#events,
      ),
      query,
    );
  }

  async diagnosenErmitteln(
    query: behandlungsansicht.DiagnosenErmittelnQuery,
  ): Promise<behandlungsansicht.DiagnosenErmittelnQueryResult> {
    return behandlungsansicht.diagnosenErmitteln(
      behandlungsansicht.projectAll(
        behandlungsansicht.initialReadModel,
        this.#events,
      ),
      query,
    );
  }

  async leistungErbringen(
    command: leistungserbringung.LeistungErbringenCommand,
  ): Promise<CommandStatus> {
    return statusOf(this.#execute(leistungserbringung, command));
  }

  async leistungAendern(
    command: leistungserbringung.LeistungAendernCommand,
  ): Promise<CommandStatus> {
    return statusOf(this.#execute(leistungserbringung, command));
  }

  async leistungLoeschen(
    command: leistungserbringung.LeistungLoeschenCommand,
  ): Promise<CommandStatus> {
    return statusOf(this.#execute(leistungserbringung, command));
  }

  async rechnungErstellen(
    command: abrechnung.RechnungErstellenCommand,
  ): Promise<CommandStatus> {
    return statusOf(this.#execute(abrechnung, command));
  }

  async rechnungAendern(
    command: abrechnung.RechnungAendernCommand,
  ): Promise<CommandStatus> {
    return statusOf(this.#execute(abrechnung, command));
  }

  async entwurfLoeschen(
    command: abrechnung.EntwurfLoeschenCommand,
  ): Promise<CommandStatus> {
    return statusOf(this.#execute(abrechnung, command));
  }

  async nichtAbgerechneteLeistungenErmitteln(
    query: abrechnungsansicht.NichtAbgerechneteLeistungenErmittelnQuery,
  ): Promise<abrechnungsansicht.NichtAbgerechneteLeistungenErmittelnQueryResult> {
    return abrechnungsansicht.nichtAbgerechneteLeistungenErmitteln(
      abrechnungsansicht.projectAll(
        abrechnungsansicht.initialReadModel,
        this.#events,
      ),
      query,
    );
  }

  async rechnungenErmitteln(
    query: abrechnungsansicht.RechnungenErmittelnQuery,
  ): Promise<abrechnungsansicht.RechnungenErmittelnQueryResult> {
    return abrechnungsansicht.rechnungenErmitteln(
      abrechnungsansicht.projectAll(
        abrechnungsansicht.initialReadModel,
        this.#events,
      ),
      query,
    );
  }

  async rechnungErmitteln(
    query: rechnungsansicht.RechnungErmittelnQuery,
  ): Promise<rechnungsansicht.RechnungErmittelnQueryResult> {
    return rechnungsansicht.rechnungErmitteln(
      rechnungsansicht.projectAll(
        rechnungsansicht.initialReadModel,
        this.#events,
      ),
      query,
    );
  }

  async rechnungVersenden(
    command: abrechnung.RechnungVersendenCommand,
  ): Promise<CommandStatus> {
    return statusOf(this.#execute(abrechnung, command));
  }

  async rechnungZurueckstufen(
    command: abrechnung.RechnungZurueckstufenCommand,
  ): Promise<CommandStatus> {
    return statusOf(this.#execute(abrechnung, command));
  }

  #execute<State, C extends Command, Event extends DomainEvent>(
    boundary: ConsistencyBoundary<State, C, Event>,
    command: C,
  ): Result<Event[], Rejection> {
    this.commands.push(command);
    if (this.#rejection !== undefined) {
      return fail(this.#rejection);
    }

    const query = boundary.consults(command);
    const events = this.#events.filter((event, index) =>
      matches(event, query, this.#tags[index]),
    ) as Event[];
    const state = boundary.evolveAll(boundary.initialState, events);
    const result = boundary.decide(state, command);
    if (result.ok) {
      for (const event of result.value) {
        this.#events.push(event);
        this.#tags.push([
          ...tagsOf(event),
          ...(boundary.tags?.(state, event) ?? []),
        ]);
      }
    }
    return result;
  }
}

function statusOf(result: Result<unknown, Rejection>): CommandStatus {
  return result.ok
    ? { success: true }
    : { success: false, errorMessage: result.error.message };
}
