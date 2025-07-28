// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

import { Failure, Success } from "../common/messages";

export interface NimmPatientAufCommand {
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

export type NimmPatientAufCommandStatus = NimmPatientAufSuccess | Failure;

export class NimmPatientAufSuccess extends Success {
  readonly nummer: number;

  constructor(nummer: number) {
    super();
    this.nummer = nummer;
  }
}

export interface PatientenkarteiQuery {
  readonly nummer?: number;
}

export interface PatientenkarteiQueryResult {
  readonly patienten: Patient[];
}

export interface Patient {
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

export function createTestPatient({
  nummer = Math.floor(Math.random() * 1000),
  nachname = "Mustermann",
  vorname = "Max",
  geburtsdatum = "1980-01-01",
  annahmejahr = 2025,
  praxis = "Praxis 1",
  anrede = "Herr",
  strasse = "Musterstraße 1",
  wohnort = "Musterstadt",
  postleitzahl = "12345",
  staat = "Deutschland",
  staatsangehoerigkeit = "Deutsch",
  titel = "Dr.",
  beruf = "Arzt",
  telefon = "0123456789",
  mobil = "0987654321",
  eMail = "max.mustermann@example.com",
  familienstand,
  partnerVon,
  kindVon,
  memo,
  schluesselworte = ["Aktiv", "Weihnachtskarte"],
}: Partial<Patient> = {}): Patient {
  return {
    nummer,
    anrede,
    vorname,
    nachname,
    geburtsdatum,
    annahmejahr,
    praxis,
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
  };
}
