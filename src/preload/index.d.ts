// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

export interface Naturheilpraxis {
  nimmPatientAuf(
    command: NimmPatientAufCommandDto,
  ): Promise<NimmPatientAufCommandStatusDto>;

  suchePatient(query: PatientQueryDto): Promise<PatientQueryResultDto>;

  suchePatienten(query: PatientenQueryDto): Promise<PatientenQueryResultDto>;

  ladeEinstellungen(): Promise<einstellungenDto>;

  sichereEinstellungen(einstellungen: einstellungenDto): Promise<void>;
}

declare global {
  interface Window {
    naturheilpraxis: Naturheilpraxis;
  }
}
