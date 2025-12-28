// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

import { Temporal } from "@js-temporal/polyfill";
import { Failure, Success } from "@muspellheim/shared";

// region Commands

export class NimmPatientAufCommand {
  static create({
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
  }): NimmPatientAufCommand {
    return new NimmPatientAufCommand(
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
    partner,
    kinder,
    notizen,
    schluesselworte,
  }: {
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
  } = {}): NimmPatientAufCommand {
    return NimmPatientAufCommand.create({
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

  readonly nachname: string;
  readonly vorname: string;
  readonly geburtsdatum: Temporal.PlainDate;
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
  readonly partner?: string;
  readonly kinder?: string;
  readonly notizen?: string;
  readonly schluesselworte?: string[];

  private constructor(
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

export type NimmPatientAufCommandStatus = NimmPatientAufSuccess | Failure;

export class NimmPatientAufSuccess extends Success {
  static create({ nummer }: { nummer: number }) {
    return new NimmPatientAufSuccess(nummer);
  }

  readonly nummer: number;

  private constructor(nummer: number) {
    super();
    this.nummer = nummer;
  }
}

// endregion
// region Queries

export class PatientenkarteiQuery {
  static create({ nummer }: PatientenkarteiQuery) {
    return new PatientenkarteiQuery(nummer);
  }

  static createTestInstance({
    nummer = 42,
  }: { nummer?: number } = {}): PatientenkarteiQuery {
    return PatientenkarteiQuery.create({ nummer });
  }

  readonly nummer?: number;

  private constructor(nummer?: number) {
    this.nummer = nummer;
  }
}

export class PatientenkarteiQueryResult {
  static create({ patienten }: PatientenkarteiQueryResult) {
    return new PatientenkarteiQueryResult(patienten);
  }

  static createTestInstance({
    patienten = [
      Patient.createTestInstance({
        nummer: 1,
        vorname: "Max",
      }),
      Patient.createTestInstance({
        nummer: 2,
        vorname: "Erika",
      }),
    ],
  }: {
    patienten?: Patient[];
  } = {}): PatientenkarteiQueryResult {
    return PatientenkarteiQueryResult.create({ patienten });
  }

  static createEmpty() {
    return PatientenkarteiQueryResult.create({ patienten: [] });
  }

  readonly patienten: Patient[];

  private constructor(patienten: Patient[]) {
    this.patienten = patienten;
  }
}

export class PatientenkarteikarteQuery {
  static create({ nummer }: PatientenkarteikarteQuery) {
    return new PatientenkarteikarteQuery(nummer);
  }

  static createTestInstance({
    nummer = 42,
  }: { nummer?: number } = {}): PatientenkarteikarteQuery {
    return PatientenkarteikarteQuery.create({ nummer });
  }

  readonly nummer: number;

  private constructor(nummer: number) {
    this.nummer = nummer;
  }
}

export class PatientenkarteikarteQueryResult {
  static create({ patient }: PatientenkarteikarteQueryResult) {
    return new PatientenkarteikarteQueryResult(patient);
  }

  static createEmpty() {
    return PatientenkarteikarteQueryResult.create({});
  }

  static createTestInstance({
    patient = Patient.createTestInstance({
      nummer: 1,
      vorname: "Max",
    }),
  }: {
    patient?: Patient;
  } = {}): PatientenkarteikarteQueryResult {
    return PatientenkarteikarteQueryResult.create({ patient });
  }

  readonly patient?: Patient;

  private constructor(patient?: Patient) {
    this.patient = patient;
  }
}

// endregion
// region Model

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

// endregion
