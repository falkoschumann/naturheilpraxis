// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

import { CloudEvent, type CloudEventV1, V1 } from "cloudevents";

export const PATIENT_SOURCE = "/naturheilpraxis/patient";

export const PATIENT_AUFGENOMMEN_V1_EVENT_TYPE =
  "de.muspellheim.naturheilpraxis.patient-aufgenommen.v1";

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
  static isType(
    event: CloudEventV1<unknown>,
  ): event is PatientAufgenommenV1Event {
    return (
      event.type === PATIENT_AUFGENOMMEN_V1_EVENT_TYPE &&
      event.source === PATIENT_SOURCE
    );
  }

  constructor(data: PatientAufgenommenDataV1) {
    super({
      id: crypto.randomUUID(),
      type: PATIENT_AUFGENOMMEN_V1_EVENT_TYPE,
      source: PATIENT_SOURCE,
      specversion: V1,
      data,
    });
  }
}
