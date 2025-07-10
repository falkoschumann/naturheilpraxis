// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

import { CloudEvent } from "cloudevents";

export interface PatientAufgenommenData {
  readonly nummer: number;
  readonly nachname: string;
  readonly vorname: string;
  readonly geburtsdatum: string;
  readonly annahmejahr: number;
  readonly praxis: string;
  readonly anrede?: string;
  readonly strasse?: string;
  readonly hausnummer?: string;
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

export class PatientAufgenommenEvent extends CloudEvent<PatientAufgenommenData> {
  constructor(id: string, data: PatientAufgenommenData) {
    super({
      id,
      type: "de.muspellheim.naturheilpraxis.patient-aufgenommen.v1",
      source: "/naturheilpraxis/patient",
      specversion: "1.0",
      data,
    });
  }
}
