// Copyright (c) 2026 Falko Schumann. All rights reserved. MIT license.

import { Temporal } from "@js-temporal/polyfill";

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
    kinder,
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
    kinder?: string;
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
      kinder,
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
    kinder,
    notizen,
    schluesselworte,
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
    kinder?: string;
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
      kinder,
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
  readonly partner?: string;
  readonly kinder?: string;
  readonly notizen?: string;
  readonly schluesselworte?: string[];

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
    kinder?: string,
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
    this.kinder = kinder;
    this.notizen = notizen;
    this.schluesselworte = schluesselworte;
  }
}
