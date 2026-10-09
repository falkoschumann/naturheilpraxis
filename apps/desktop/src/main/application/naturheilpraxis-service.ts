// Copyright (c) 2026 Falko Schumann. MIT license.

import type {
  CommandStatus,
  NaturheilpraxisApi,
  PatientAufnehmenStatus,
} from "../../shared/application/naturheilpraxis-api.ts";
import type { ConsistencyBoundary } from "../../shared/domain/consistency-boundary.ts";
import type { DomainEvent } from "../../shared/domain/events.ts";
import * as abrechnung from "../../shared/domain/abrechnung.ts";
import * as abrechnungsansicht from "../../shared/domain/abrechnungsansicht.ts";
import * as behandlungsansicht from "../../shared/domain/behandlungsansicht.ts";
import * as diagnosestellung from "../../shared/domain/diagnosestellung.ts";
import * as gebuehrenansicht from "../../shared/domain/gebuehrenansicht.ts";
import * as leistungserbringung from "../../shared/domain/leistungserbringung.ts";
import * as gebuehrenverzeichnis from "../../shared/domain/gebuehrenverzeichnis.ts";
import * as patientenansicht from "../../shared/domain/patientenansicht.ts";
import * as patientenaufnahme from "../../shared/domain/patientenaufnahme.ts";
import * as patientenkartei from "../../shared/domain/patientenkartei.ts";
import * as praxenansicht from "../../shared/domain/praxenansicht.ts";
import * as praxisverwaltung from "../../shared/domain/praxisverwaltung.ts";
import * as rechnungsansicht from "../../shared/domain/rechnungsansicht.ts";
import type { Rejection, Result } from "../../shared/domain/result.ts";
import type { EventStore } from "../infrastructure/event-store.ts";

// Executes the commands with the consistency boundaries of the domain and
// answers the queries from the read models, which it keeps in memory.
export class NaturheilpraxisService implements NaturheilpraxisApi {
  readonly #eventStore: EventStore;
  #praxenansicht = praxenansicht.initialReadModel;
  #gebuehrenansicht = gebuehrenansicht.initialReadModel;
  #patientenansicht = patientenansicht.initialReadModel;
  #behandlungsansicht = behandlungsansicht.initialReadModel;
  #abrechnungsansicht = abrechnungsansicht.initialReadModel;
  #rechnungsansicht = rechnungsansicht.initialReadModel;

  constructor(eventStore: EventStore) {
    this.#eventStore = eventStore;
    this.#project(eventStore.query());
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
    return gebuehrenansicht.gebuehrenErmitteln(this.#gebuehrenansicht, query);
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
    if (aufgenommen === undefined) {
      throw new Error("The Patientenaufnahme decided no admission.");
    }
    return { success: true, patientennummer: aufgenommen.data.patientennummer };
  }

  async patientendatenAendern(
    command: patientenkartei.PatientendatenAendernCommand,
  ): Promise<CommandStatus> {
    return statusOf(this.#execute(patientenkartei, command));
  }

  async patientenErmitteln(
    query: patientenansicht.PatientenErmittelnQuery,
  ): Promise<patientenansicht.PatientenErmittelnQueryResult> {
    return patientenansicht.patientenErmitteln(this.#patientenansicht, query);
  }

  async patientErmitteln(
    query: patientenansicht.PatientErmittelnQuery,
  ): Promise<patientenansicht.PatientErmittelnQueryResult> {
    return patientenansicht.patientErmitteln(this.#patientenansicht, query);
  }

  // Decides the command on the consulted events and publishes the decided
  // events.
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
      this.#behandlungsansicht,
      query,
    );
  }

  async diagnosenErmitteln(
    query: behandlungsansicht.DiagnosenErmittelnQuery,
  ): Promise<behandlungsansicht.DiagnosenErmittelnQueryResult> {
    return behandlungsansicht.diagnosenErmitteln(
      this.#behandlungsansicht,
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
      this.#abrechnungsansicht,
      query,
    );
  }

  async rechnungenErmitteln(
    query: abrechnungsansicht.RechnungenErmittelnQuery,
  ): Promise<abrechnungsansicht.RechnungenErmittelnQueryResult> {
    return abrechnungsansicht.rechnungenErmitteln(
      this.#abrechnungsansicht,
      query,
    );
  }

  async rechnungErmitteln(
    query: rechnungsansicht.RechnungErmittelnQuery,
  ): Promise<rechnungsansicht.RechnungErmittelnQueryResult> {
    return rechnungsansicht.rechnungErmitteln(this.#rechnungsansicht, query);
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

  async zahlungErfassen(
    command: abrechnung.ZahlungErfassenCommand,
  ): Promise<CommandStatus> {
    return statusOf(this.#execute(abrechnung, command));
  }

  #execute<State, Command, Event extends DomainEvent>(
    boundary: ConsistencyBoundary<State, Command, Event>,
    command: Command,
  ): Result<Event[], Rejection> {
    // The event store returns only events of the consulted types, which are
    // the events of this boundary.
    const events = this.#eventStore.query(
      boundary.consults(command),
    ) as Event[];
    const state = boundary.evolveAll(boundary.initialState, events);
    const result = boundary.decide(state, command);
    if (result.ok && result.value.length > 0) {
      this.#eventStore.append(
        result.value,
        (event) => boundary.tags?.(state, event as Event) ?? [],
      );
      this.#project(result.value);
    }
    return result;
  }

  #project(events: readonly DomainEvent[]): void {
    this.#praxenansicht = praxenansicht.projectAll(this.#praxenansicht, events);
    this.#gebuehrenansicht = gebuehrenansicht.projectAll(
      this.#gebuehrenansicht,
      events,
    );
    this.#patientenansicht = patientenansicht.projectAll(
      this.#patientenansicht,
      events,
    );
    this.#behandlungsansicht = behandlungsansicht.projectAll(
      this.#behandlungsansicht,
      events,
    );
    this.#abrechnungsansicht = abrechnungsansicht.projectAll(
      this.#abrechnungsansicht,
      events,
    );
    this.#rechnungsansicht = rechnungsansicht.projectAll(
      this.#rechnungsansicht,
      events,
    );
  }
}

function statusOf(result: Result<unknown, Rejection>): CommandStatus {
  return result.ok
    ? { success: true }
    : { success: false, errorMessage: result.error.message };
}
