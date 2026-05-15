// Copyright (c) 2026 Falko Schumann. All rights reserved. MIT license.

import { createContext, useContext } from "react";

import {
  type DiagnosenQuery,
  DiagnosenQueryResult,
} from "../../../shared/domain/diagnosen_query";
import type {
  LeistungenQuery,
  LeistungenQueryResult,
} from "../../../shared/domain/leistungen_query";
import type {
  NimmPatientAufCommand,
  NimmPatientAufCommandStatus,
} from "../../../shared/domain/nimm_patient_auf_command";
import {
  type PatientQuery,
  PatientQueryResult,
} from "../../../shared/domain/patient_query";
import {
  type PatientenQuery,
  PatientenQueryResult,
} from "../../../shared/domain/patienten_query";
import {
  type RechnungenQuery,
  RechnungenQueryResult,
} from "../../../shared/domain/rechnungen_query";

export interface MessageHandler {
  nimmPatientAuf(
    command: NimmPatientAufCommand,
  ): Promise<NimmPatientAufCommandStatus>;

  suchePatient(query: PatientQuery): Promise<PatientQueryResult>;

  suchePatienten(query: PatientenQuery): Promise<PatientenQueryResult>;

  sucheDiagnosen(query: DiagnosenQuery): Promise<DiagnosenQueryResult>;

  sucheLeistungen(query: LeistungenQuery): Promise<LeistungenQueryResult>;

  sucheRechnungen(query: RechnungenQuery): Promise<RechnungenQueryResult>;
}

export const MessageHandlerContext = createContext<MessageHandler | null>(null);

export function useMessageHandler() {
  const messageHandler = useContext(MessageHandlerContext);
  if (messageHandler == null) {
    throw new Error("Context has not a MessageHandler.");
  }

  return messageHandler;
}
