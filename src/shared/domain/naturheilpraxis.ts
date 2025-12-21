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
    partnerVon,
    kindVon,
    memo,
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
    partnerVon?: string;
    kindVon?: string;
    memo?: string;
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
      partnerVon,
      kindVon,
      memo,
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
    partnerVon,
    kindVon,
    memo,
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
    partnerVon?: string;
    kindVon?: string;
    memo?: string;
    schluesselworte?: string[];
  } = {}): NimmPatientAufCommand {
    return NimmPatientAufCommand.create({
      nachname: nachname,
      vorname: vorname,
      geburtsdatum: geburtsdatum,
      annahmejahr: annahmejahr,
      praxis: praxis,
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
  readonly partnerVon?: string;
  readonly kindVon?: string;
  readonly memo?: string;
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
    partnerVon?: string,
    kindVon?: string,
    memo?: string,
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
    this.partnerVon = partnerVon;
    this.kindVon = kindVon;
    this.memo = memo;
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

  readonly nummer?: number;

  private constructor(nummer?: number) {
    this.nummer = nummer;
  }
}

export class PatientenkarteiQueryResult {
  static create({ patienten }: PatientenkarteiQueryResult) {
    return new PatientenkarteiQueryResult(patienten);
  }

  static createEmpty() {
    return PatientenkarteiQueryResult.create({ patienten: [] });
  }

  readonly patienten: Patient[];

  private constructor(patienten: Patient[]) {
    this.patienten = patienten;
  }
}

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
    partnerVon,
    kindVon,
    memo,
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
    partnerVon?: string;
    kindVon?: string;
    memo?: string;
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
      partnerVon,
      kindVon,
      memo,
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
    partnerVon,
    kindVon,
    memo,
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
    partnerVon?: string;
    kindVon?: string;
    memo?: string;
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
      partnerVon,
      kindVon,
      memo,
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
  readonly partnerVon?: string;
  readonly kindVon?: string;
  readonly memo?: string;
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
    partnerVon?: string,
    kindVon?: string,
    memo?: string,
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
    this.partnerVon = partnerVon;
    this.kindVon = kindVon;
    this.memo = memo;
    this.schluesselworte = schluesselworte;
  }
}

// endregion
