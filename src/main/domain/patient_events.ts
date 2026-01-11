// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

import { CloudEvent, type CloudEventV1, V1 } from "cloudevents";

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
  readonly partner?: string; // TODO link to patient ID
  readonly eltern?: string; // TODO link to patient ID
  readonly kinder?: string; // TODO link to patient ID
  readonly geschwister?: string; // TODO link to patient ID
  readonly notizen?: string;
  readonly schluesselworte?: string[];
}

export const PATIENT_SOURCE = "/naturheilpraxis/patient";

// TODO add to CloudEvent tags=[patient:nummer]

export class PatientAufgenommenV1Event extends CloudEvent<PatientAufgenommenV1Data> {
  static readonly TYPE =
    "de.muspellheim.naturheilpraxis.patient-aufgenommen.v1";

  static create(data: PatientAufgenommenV1Data): PatientAufgenommenV1Event {
    return new PatientAufgenommenV1Event({
      id: crypto.randomUUID(),
      source: PATIENT_SOURCE,
      type: PatientAufgenommenV1Event.TYPE,
      specversion: V1,
      data: {
        nummer: data.nummer,
        nachname: data.nachname,
        vorname: data.vorname,
        geburtsdatum: data.geburtsdatum,
        annahmejahr: data.annahmejahr,
        praxis: data.praxis,
        anrede: data.anrede || undefined,
        strasse: data.strasse || undefined,
        wohnort: data.wohnort || undefined,
        postleitzahl: data.postleitzahl || undefined,
        staat: data.staat || undefined,
        staatsangehoerigkeit: data.staatsangehoerigkeit || undefined,
        titel: data.titel || undefined,
        beruf: data.beruf || undefined,
        telefon: data.telefon || undefined,
        mobil: data.mobil || undefined,
        eMail: data.eMail || undefined,
        familienstand: data.familienstand || undefined,
        partner: data.partner || undefined,
        eltern: data.eltern || undefined,
        kinder: data.kinder || undefined,
        geschwister: data.geschwister || undefined,
        notizen: data.notizen || undefined,
        schluesselworte:
          data.schluesselworte && data.schluesselworte.length > 0
            ? data.schluesselworte
            : undefined,
      },
    });
  }

  static createTestInstance({
    nummer = 1,
    nachname = "Mustermann",
    vorname = "Max",
    geburtsdatum = "1980-01-01",
    annahmejahr = 2025,
    praxis = "Naturheilpraxis",
    anrede,
    strasse = "Musterstraße 1",
    wohnort = "Musterstadt",
    postleitzahl = "12345",
    staat,
    staatsangehoerigkeit,
    titel,
    beruf,
    telefon,
    mobil = "0123 4567890",
    eMail = "mail@example.com",
    familienstand,
    partner,
    eltern,
    kinder,
    geschwister,
    notizen,
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
      partner,
      eltern,
      kinder,
      geschwister,
      notizen,
      schluesselworte,
    });
  }

  static isType(
    event: CloudEventV1<unknown>,
  ): event is PatientAufgenommenV1Event {
    return event.type === PatientAufgenommenV1Event.TYPE;
  }

  private constructor(
    event: Partial<CloudEventV1<PatientAufgenommenV1Data>>,
    strict?: boolean,
  ) {
    super(event, strict);
  }
}
