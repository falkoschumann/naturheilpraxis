// Copyright (c) 2026 Falko Schumann. MIT license.

import type {
  GebuehrenErmittelnQuery,
  GebuehrenErmittelnQueryResult,
} from "../domain/gebuehrenansicht.ts";
import type {
  GebuehrAendernCommand,
  GebuehrAnlegenCommand,
  GebuehrEntfernenCommand,
} from "../domain/gebuehrenverzeichnis.ts";
import type {
  PraxenErmittelnQuery,
  PraxenErmittelnQueryResult,
  PraxisErmittelnQuery,
  PraxisErmittelnQueryResult,
} from "../domain/praxenansicht.ts";
import type {
  PraxisAnlegenCommand,
  PraxisdatenAendernCommand,
} from "../domain/praxisverwaltung.ts";

import type {
  PatientenErmittelnQuery,
  PatientenErmittelnQueryResult,
  PatientErmittelnQuery,
  PatientErmittelnQueryResult,
} from "../domain/patientenansicht.ts";
import type { PatientAufnehmenCommand } from "../domain/patientenaufnahme.ts";
import type { PatientendatenAendernCommand } from "../domain/patientenkartei.ts";
import type { Patientennummer } from "../domain/value-objects.ts";

import type {
  BehandlungenErmittelnQuery,
  BehandlungenErmittelnQueryResult,
  DiagnosenErmittelnQuery,
  DiagnosenErmittelnQueryResult,
} from "../domain/behandlungsansicht.ts";
import type {
  DiagnoseAendernCommand,
  DiagnoseLoeschenCommand,
  DiagnoseStellenCommand,
} from "../domain/diagnosestellung.ts";

import type {
  LeistungAendernCommand,
  LeistungErbringenCommand,
  LeistungLoeschenCommand,
} from "../domain/leistungserbringung.ts";

import type {
  EntwurfLoeschenCommand,
  RechnungAendernCommand,
  RechnungErstellenCommand,
  RechnungVersendenCommand,
  RechnungZurueckstufenCommand,
} from "../domain/abrechnung.ts";
import type {
  NichtAbgerechneteLeistungenErmittelnQuery,
  NichtAbgerechneteLeistungenErmittelnQueryResult,
  RechnungenErmittelnQuery,
  RechnungenErmittelnQueryResult,
} from "../domain/abrechnungsansicht.ts";
import type {
  RechnungErmittelnQuery,
  RechnungErmittelnQueryResult,
} from "../domain/rechnungsansicht.ts";

export type CommandStatus =
  | Readonly<{ success: true; errorMessage?: never }>
  | Readonly<{ success: false; errorMessage: string }>;

// The admission tells the assigned Patientennummer.
export type PatientAufnehmenStatus =
  | Readonly<{
      success: true;
      patientennummer: Patientennummer;
      errorMessage?: never;
    }>
  | Readonly<{ success: false; errorMessage: string; patientennummer?: never }>;

// The commands and queries the main process offers the renderer. Each message
// is sent on the channel named after its type.
export interface NaturheilpraxisApi {
  praxisAnlegen(command: PraxisAnlegenCommand): Promise<CommandStatus>;

  praxisdatenAendern(
    command: PraxisdatenAendernCommand,
  ): Promise<CommandStatus>;

  praxenErmitteln(
    query: PraxenErmittelnQuery,
  ): Promise<PraxenErmittelnQueryResult>;

  praxisErmitteln(
    query: PraxisErmittelnQuery,
  ): Promise<PraxisErmittelnQueryResult>;

  gebuehrAnlegen(command: GebuehrAnlegenCommand): Promise<CommandStatus>;

  gebuehrAendern(command: GebuehrAendernCommand): Promise<CommandStatus>;

  gebuehrEntfernen(command: GebuehrEntfernenCommand): Promise<CommandStatus>;

  gebuehrenErmitteln(
    query: GebuehrenErmittelnQuery,
  ): Promise<GebuehrenErmittelnQueryResult>;

  patientAufnehmen(
    command: PatientAufnehmenCommand,
  ): Promise<PatientAufnehmenStatus>;

  patientendatenAendern(
    command: PatientendatenAendernCommand,
  ): Promise<CommandStatus>;

  patientenErmitteln(
    query: PatientenErmittelnQuery,
  ): Promise<PatientenErmittelnQueryResult>;

  patientErmitteln(
    query: PatientErmittelnQuery,
  ): Promise<PatientErmittelnQueryResult>;

  diagnoseStellen(command: DiagnoseStellenCommand): Promise<CommandStatus>;

  diagnoseAendern(command: DiagnoseAendernCommand): Promise<CommandStatus>;

  diagnoseLoeschen(command: DiagnoseLoeschenCommand): Promise<CommandStatus>;

  behandlungenErmitteln(
    query: BehandlungenErmittelnQuery,
  ): Promise<BehandlungenErmittelnQueryResult>;

  diagnosenErmitteln(
    query: DiagnosenErmittelnQuery,
  ): Promise<DiagnosenErmittelnQueryResult>;

  leistungErbringen(command: LeistungErbringenCommand): Promise<CommandStatus>;

  leistungAendern(command: LeistungAendernCommand): Promise<CommandStatus>;

  leistungLoeschen(command: LeistungLoeschenCommand): Promise<CommandStatus>;

  rechnungErstellen(command: RechnungErstellenCommand): Promise<CommandStatus>;

  rechnungAendern(command: RechnungAendernCommand): Promise<CommandStatus>;

  entwurfLoeschen(command: EntwurfLoeschenCommand): Promise<CommandStatus>;

  nichtAbgerechneteLeistungenErmitteln(
    query: NichtAbgerechneteLeistungenErmittelnQuery,
  ): Promise<NichtAbgerechneteLeistungenErmittelnQueryResult>;

  rechnungenErmitteln(
    query: RechnungenErmittelnQuery,
  ): Promise<RechnungenErmittelnQueryResult>;

  rechnungErmitteln(
    query: RechnungErmittelnQuery,
  ): Promise<RechnungErmittelnQueryResult>;

  rechnungVersenden(command: RechnungVersendenCommand): Promise<CommandStatus>;

  rechnungZurueckstufen(
    command: RechnungZurueckstufenCommand,
  ): Promise<CommandStatus>;
}
