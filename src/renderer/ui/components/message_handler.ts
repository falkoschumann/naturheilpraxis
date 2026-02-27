// Copyright (c) 2026 Falko Schumann. All rights reserved. MIT license.

import type {
  NimmPatientAufCommand,
  NimmPatientAufCommandStatus,
} from "../../../shared/domain/nimm_patient_auf_command";
import {
  type PatientQuery,
  PatientQueryResult,
} from "../../../shared/domain/suche_patient_query";
import {
  type PatientenQuery,
  PatientenQueryResult,
} from "../../../shared/domain/suche_patienten_query";
import type { Einstellungen } from "../../../shared/domain/einstellungen";

export interface MessageHandler {
  nimmPatientAuf(
    command: NimmPatientAufCommand,
  ): Promise<NimmPatientAufCommandStatus>;

  suchePatient(query: PatientQuery): Promise<PatientQueryResult>;

  suchePatienten(query: PatientenQuery): Promise<PatientenQueryResult>;

  ladeEinstellungen(): Promise<Einstellungen>;

  sichereEinstellungen(einstellungen: Einstellungen): Promise<void>;
}
