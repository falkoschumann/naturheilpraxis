// Copyright (c) 2026 Falko Schumann. All rights reserved. MIT license.

import { Temporal } from "@js-temporal/polyfill";
import Ajv from "ajv";
import addFormats from "ajv-formats";

export class Patient {
  static create({
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
  }: {
    nummer: number;
    nachname: string;
    vorname: string;
    geburtsdatum: Temporal.PlainDate | string;
    annahmejahr: number;
    praxis: string;
    anrede?: string;
    strasse?: string;
    wohnort?: string;
    postleitzahl?: string;
    staat?: string;
    staatsangehoerigkeit?: string;
    titel?: string;
    beruf?: string;
    telefon?: string;
    mobil?: string;
    eMail?: string;
    familienstand?: string;
    partner?: string;
    eltern?: string;
    kinder?: string;
    geschwister?: string;
    notizen?: string;
    schluesselworte?: string[];
  }): Patient {
    return new Patient(
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
    );
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
    schluesselworte = ["Schlüsselwort1", "Schlüsselwort2"],
  }: {
    nummer?: number;
    nachname?: string;
    vorname?: string;
    geburtsdatum?: Temporal.PlainDate | string;
    annahmejahr?: number;
    praxis?: string;
    anrede?: string;
    strasse?: string;
    wohnort?: string;
    postleitzahl?: string;
    staat?: string;
    staatsangehoerigkeit?: string;
    titel?: string;
    beruf?: string;
    telefon?: string;
    mobil?: string;
    eMail?: string;
    familienstand?: string;
    partner?: string;
    eltern?: string;
    kinder?: string;
    geschwister?: string;
    notizen?: string;
    schluesselworte?: string[];
  } = {}): Patient {
    return Patient.create({
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

  readonly nummer: number;
  readonly nachname: string;
  readonly vorname: string; // TODO can be empty
  readonly geburtsdatum: Temporal.PlainDate; // TODO can be empty
  readonly annahmejahr: number;
  readonly praxis: string; // TODO can be empty
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
  readonly schluesselworte?: string[]; // TODO should be undefined if empty

  private constructor(
    nummer: number,
    nachname: string,
    vorname: string,
    geburtsdatum: Temporal.PlainDate | string,
    annahmejahr: number,
    praxis: string,
    anrede?: string,
    strasse?: string,
    wohnort?: string,
    postleitzahl?: string,
    staat?: string,
    staatsangehoerigkeit?: string,
    titel?: string,
    beruf?: string,
    telefon?: string,
    mobil?: string,
    eMail?: string,
    familienstand?: string,
    partner?: string,
    eltern?: string,
    kinder?: string,
    geschwister?: string,
    notizen?: string,
    schluesselworte?: string[],
  ) {
    this.nummer = nummer;
    this.nachname = nachname;
    this.vorname = vorname;
    this.geburtsdatum = Temporal.PlainDate.from(geburtsdatum);
    this.annahmejahr = annahmejahr;
    this.praxis = praxis;
    this.anrede = anrede;
    this.strasse = strasse;
    this.wohnort = wohnort;
    this.postleitzahl = postleitzahl;
    this.staat = staat;
    this.staatsangehoerigkeit = staatsangehoerigkeit;
    this.titel = titel;
    this.beruf = beruf;
    this.telefon = telefon;
    this.mobil = mobil;
    this.eMail = eMail;
    this.familienstand = familienstand;
    this.partner = partner;
    this.eltern = eltern;
    this.kinder = kinder;
    this.geschwister = geschwister;
    this.notizen = notizen;
    this.schluesselworte = schluesselworte;
  }

  validate() {
    const valid = ajv.validate(PATIENT_SCHEMA, this);
    if (!valid) {
      throw new TypeError("Ungültige Daten für Patient.", {
        cause: ajv.errors,
      });
    }

    return this;
  }
}

const ajv = new Ajv({ allErrors: true });
addFormats(ajv);

const PATIENT_SCHEMA = {
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
    // WORKAROUND should have "format": "email", but it is too restrictive
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
