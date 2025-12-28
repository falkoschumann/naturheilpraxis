// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

import Ajv from "ajv";
import addFormats from "ajv-formats";
import { CloudEvent, type CloudEventV1, V1 } from "cloudevents";

const ajv = new Ajv({ allErrors: true });
addFormats(ajv);

const PATIENT_AUFGENOMMEN_V1_DATA_SCHEMA = {
  type: "object",
  properties: {
    nummer: { type: "number" },
    nachname: { type: "string" },
    vorname: { type: "string" },
    geburtsdatum: { type: "string", format: "date" },
    annahmejahr: { type: "integer" },
    praxis: { type: "string" },
    anrede: { type: "string" },
    strasse: { type: "string" },
    wohnort: { type: "string" },
    postleitzahl: { type: "string" },
    staat: { type: "string" },
    staatsangehoerigkeit: { type: "string" },
    titel: { type: "string" },
    beruf: { type: "string" },
    telefon: { type: "string" },
    mobil: { type: "string" },
    eMail: { type: "string", pattern: "^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$" },
    familienstand: { type: "string" },
    partner: { type: "string" },
    eltern: { type: "string" },
    kinder: { type: "string" },
    geschwister: { type: "string" },
    notizen: { type: "string" },
    schluesselworte: { type: "array", items: { type: "string" } },
  },
  required: [
    "nummer",
    "nachname",
    "vorname",
    "geburtsdatum",
    "annahmejahr",
    "praxis",
  ],
  additionalProperties: false,
};

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

export class PatientAufgenommenV1Event extends CloudEvent<PatientAufgenommenV1Data> {
  static readonly SOURCE = "/naturheilpraxis/patient";

  static readonly TYPE =
    "de.muspellheim.naturheilpraxis.patient-aufgenommen.v1";

  static create(data: PatientAufgenommenV1Data): PatientAufgenommenV1Event {
    return new PatientAufgenommenV1Event({
      id: crypto.randomUUID(),
      source: PatientAufgenommenV1Event.SOURCE,
      type: PatientAufgenommenV1Event.TYPE,
      specversion: V1,
      data,
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

  static fromJson(json: unknown): PatientAufgenommenV1Event {
    return new PatientAufgenommenV1Event(
      json as Partial<CloudEventV1<PatientAufgenommenV1Data>>,
    );
  }

  static isSource(
    event: CloudEventV1<unknown>,
  ): event is PatientAufgenommenV1Event {
    return event.source === PatientAufgenommenV1Event.SOURCE;
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

    const valid = ajv.validate(PATIENT_AUFGENOMMEN_V1_DATA_SCHEMA, event.data);
    if (!valid) {
      throw new TypeError(
        'Ungültige Daten für Ereignis "Patient aufgenommen" in Version 1.',
        { cause: ajv.errors },
      );
    }
  }
}
