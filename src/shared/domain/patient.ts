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
    straße,
    wohnort,
    postleitzahl,
    staat,
    staatsangehörigkeit,
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
    schlüsselworte,
  }: {
    nummer?: number;
    nachname?: string;
    vorname?: string;
    geburtsdatum?: Temporal.PlainDate | string;
    annahmejahr?: number;
    praxis?: string;
    anrede?: string;
    straße?: string;
    wohnort?: string;
    postleitzahl?: string;
    staat?: string;
    staatsangehörigkeit?: string;
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
    schlüsselworte?: string[];
  }): Patient {
    return new Patient(
      nummer,
      nachname,
      vorname,
      geburtsdatum,
      annahmejahr,
      praxis,
      anrede,
      straße,
      wohnort,
      postleitzahl,
      staat,
      staatsangehörigkeit,
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
      schlüsselworte,
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
    straße = "Musterstraße 1",
    wohnort = "Musterstadt",
    postleitzahl = "12345",
    staat,
    staatsangehörigkeit,
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
    schlüsselworte = ["Schlüsselwort1", "Schlüsselwort2"],
  }: {
    nummer?: number;
    nachname?: string;
    vorname?: string;
    geburtsdatum?: Temporal.PlainDate | string;
    annahmejahr?: number;
    praxis?: string;
    anrede?: string;
    straße?: string;
    wohnort?: string;
    postleitzahl?: string;
    staat?: string;
    staatsangehörigkeit?: string;
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
    schlüsselworte?: string[];
  } = {}): Patient {
    return Patient.create({
      nummer,
      nachname,
      vorname,
      geburtsdatum,
      annahmejahr,
      praxis,
      anrede,
      straße: straße,
      wohnort,
      postleitzahl,
      staat,
      staatsangehörigkeit: staatsangehörigkeit,
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
      schlüsselworte: schlüsselworte,
    });
  }

  // nummer ist ein Pflichtfeld, außer der Patient ist noch nicht aufgenommen
  readonly nummer?: number;
  readonly nachname?: string;
  readonly vorname?: string;
  readonly geburtsdatum?: Temporal.PlainDate;
  readonly annahmejahr?: number;
  readonly praxis?: string;
  readonly anrede?: string;
  readonly straße?: string;
  readonly wohnort?: string;
  readonly postleitzahl?: string;
  readonly staat?: string;
  readonly staatsangehörigkeit?: string;
  readonly titel?: string;
  readonly beruf?: string;
  readonly telefon?: string;
  readonly mobil?: string;
  readonly eMail?: string;
  readonly familienstand?: string;
  readonly partner?: string;
  readonly eltern?: string;
  readonly kinder?: string;
  readonly geschwister?: string;
  readonly notizen?: string;
  readonly schlüsselworte?: string[];

  private constructor(
    nummer?: number,
    nachname?: string,
    vorname?: string,
    geburtsdatum?: Temporal.PlainDate | string,
    annahmejahr?: number,
    praxis?: string,
    anrede?: string,
    straße?: string,
    wohnort?: string,
    postleitzahl?: string,
    staat?: string,
    staatsangehörigkeit?: string,
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
    schlüsselworte?: string[],
  ) {
    this.nummer = nummer;
    this.nachname = nachname;
    this.vorname = vorname;
    this.geburtsdatum =
      geburtsdatum != null
        ? Temporal.PlainDate.from(geburtsdatum)
        : geburtsdatum;
    this.annahmejahr = annahmejahr;
    this.praxis = praxis;
    this.anrede = anrede;
    this.straße = straße;
    this.wohnort = wohnort;
    this.postleitzahl = postleitzahl;
    this.staat = staat;
    this.staatsangehörigkeit = staatsangehörigkeit;
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
    this.schlüsselworte = schlüsselworte;
  }
}
