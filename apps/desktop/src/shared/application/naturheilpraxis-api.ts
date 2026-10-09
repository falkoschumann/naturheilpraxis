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

export type CommandStatus =
  | Readonly<{ success: true; errorMessage?: never }>
  | Readonly<{ success: false; errorMessage: string }>;

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
}
