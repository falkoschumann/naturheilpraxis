// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

import { CloudEvent } from "cloudevents";

export const PATIENT_SOURCE = "/naturheilpraxis/patient";

export interface PatientAufgenommenDataV1 {
  readonly nummer: number;
  readonly nachname: string;
  readonly vorname: string;
  readonly geburtsdatum: string;
  readonly annahmejahr: number;
  readonly praxis: string;
  readonly anrede?: string;
  readonly strasse?: string;
  readonly wohnort?: string;
  readonly postleitzahl?: string;
  readonly staat?: string;
  readonly staatsangehoerigkeit?: string;
  readonly titel?: string;
  readonly beruf?: string;
  readonly telefon?: string;
  readonly mobil?: string;
  readonly eMail?: string;
  readonly familienstand?: string;
  readonly partnerVon?: string;
  readonly kindVon?: string;
  readonly memo?: string;
  readonly schluesselworte?: string[];
}

export class PatientAufgenommenV1Event extends CloudEvent<PatientAufgenommenDataV1> {
  static readonly TYPE =
    "de.muspellheim.naturheilpraxis.patient-aufgenommen.v1";

  constructor(id: string, data: PatientAufgenommenDataV1) {
    super({
      id,
      type: PatientAufgenommenV1Event.TYPE,
      source: PATIENT_SOURCE,
      specversion: "1.0",
      data,
    });
  }
}
