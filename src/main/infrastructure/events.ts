// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

import { CloudEvent, type CloudEventV1, V1 } from "cloudevents";

export const PATIENT_SOURCE = "/naturheilpraxis/patient";

export const PATIENT_AUFGENOMMEN_V1_EVENT_TYPE =
  "de.muspellheim.naturheilpraxis.patient-aufgenommen.v1";

export interface PatientAufgenommenV1Data {
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

export class PatientAufgenommenV1Event extends CloudEvent<PatientAufgenommenV1Data> {
  static create(data: PatientAufgenommenV1Data): PatientAufgenommenV1Event {
    return new PatientAufgenommenV1Event(data);
  }

  static createTestInstance({
    nummer = 1,
    nachname = "Mustermann",
    vorname = "Max",
    geburtsdatum = "1980-01-01",
    annahmejahr = 2025,
    praxis = "Naturheilpraxis",
    anrede,
    strasse,
    wohnort,
    postleitzahl,
    staat,
    staatsangehoerigkeit,
    titel,
    beruf,
    telefon,
    mobil,
    eMail,
    familienstand,
    partnerVon,
    kindVon,
    memo,
    schluesselworte,
  }: Partial<PatientAufgenommenV1Data> = {}): PatientAufgenommenV1Event {
    return PatientAufgenommenV1Event.create({
      nummer,
      nachname,
      vorname,
      geburtsdatum,
      annahmejahr,
      praxis,
      anrede,
      strasse,
      wohnort,
      postleitzahl,
      staat,
      staatsangehoerigkeit,
      titel,
      beruf,
      telefon,
      mobil,
      eMail,
      familienstand,
      partnerVon,
      kindVon,
      memo,
      schluesselworte,
    });
  }

  static isType(
    event: CloudEventV1<unknown>,
  ): event is PatientAufgenommenV1Event {
    return (
      event.type === PATIENT_AUFGENOMMEN_V1_EVENT_TYPE &&
      event.source === PATIENT_SOURCE
    );
  }

  constructor(data: PatientAufgenommenV1Data) {
    super({
      id: crypto.randomUUID(),
      type: PATIENT_AUFGENOMMEN_V1_EVENT_TYPE,
      source: PATIENT_SOURCE,
      specversion: V1,
      data,
    });
  }
}
