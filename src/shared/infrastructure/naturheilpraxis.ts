// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

import { Failure } from "@muspellheim/shared";

import {
  NimmPatientAufCommand,
  type NimmPatientAufCommandStatus,
  NimmPatientAufSuccess,
  Patient,
  PatientenkarteiQuery,
  PatientenkarteiQueryResult,
} from "../domain/naturheilpraxis";

// region Commands

export class NimmPatientAufCommandDto {
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
    eltern,
    kinder,
    geschwister,
    notizen,
    schluesselworte,
  }: {
    nachname: string;
    vorname: string;
    geburtsdatum: string;
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
  }): NimmPatientAufCommandDto {
    return new NimmPatientAufCommandDto(
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
  }: {
    nachname?: string;
    vorname?: string;
    geburtsdatum?: string;
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
  } = {}): NimmPatientAufCommandDto {
    return NimmPatientAufCommandDto.create({
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

  static fromModel(model: NimmPatientAufCommand): NimmPatientAufCommandDto {
    return NimmPatientAufCommandDto.create({
      ...model,
      geburtsdatum: model.geburtsdatum.toString(),
    });
  }

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
  readonly partner?: string;
  readonly eltern?: string;
  readonly kinder?: string;
  readonly geschwister?: string;
  readonly notizen?: string;
  readonly schluesselworte?: string[];

  private constructor(
    nachname: string,
    vorname: string,
    geburtsdatum: string,
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
    this.nachname = nachname;
    this.vorname = vorname;
    this.geburtsdatum = geburtsdatum;
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

  validate(): NimmPatientAufCommand {
    return NimmPatientAufCommand.create(this);
  }
}

export class NimmPatientAufCommandStatusDto {
  static create({
    isSuccess,
    errorMessage,
    nummer,
  }: {
    isSuccess: boolean;
    errorMessage?: string;
    nummer?: number;
  }): NimmPatientAufCommandStatusDto {
    return new NimmPatientAufCommandStatusDto(isSuccess, errorMessage, nummer);
  }

  static fromModel(
    model: NimmPatientAufCommandStatus,
  ): NimmPatientAufCommandStatusDto {
    if (model.isSuccess) {
      return NimmPatientAufCommandStatusDto.create({
        isSuccess: true,
        nummer: model.nummer,
      });
    } else {
      return NimmPatientAufCommandStatusDto.create({
        isSuccess: false,
        errorMessage: model.errorMessage,
      });
    }
  }

  isSuccess: boolean;
  errorMessage?: string;
  nummer?: number;

  constructor(isSuccess: boolean, errorMessage?: string, nummer?: number) {
    this.isSuccess = isSuccess;
    this.errorMessage = errorMessage;
    this.nummer = nummer;
  }

  validate(): NimmPatientAufCommandStatus {
    if (this.isSuccess) {
      return NimmPatientAufSuccess.create({ nummer: this.nummer! });
    } else {
      return new Failure(this.errorMessage!);
    }
  }
}

// endregion
// region Queries

export class PatientenkarteiQueryDto {
  static create({ nummer }: { nummer?: number }) {
    return new PatientenkarteiQueryDto(nummer);
  }

  static createTestInstance({
    nummer = 42,
  }: { nummer?: number } = {}): PatientenkarteiQueryDto {
    return PatientenkarteiQueryDto.create({ nummer });
  }

  static fromModel(model: PatientenkarteiQuery): PatientenkarteiQueryDto {
    return PatientenkarteiQueryDto.create(model);
  }

  readonly nummer?: number;

  private constructor(nummer?: number) {
    this.nummer = nummer;
  }

  validate(): PatientenkarteiQuery {
    return PatientenkarteiQuery.create(this);
  }
}

export class PatientenkarteiQueryResultDto {
  static create({ patienten }: { patienten: PatientDto[] }) {
    return new PatientenkarteiQueryResultDto(patienten);
  }

  static createTestInstance({
    patienten = [
      PatientDto.createTestInstance({
        nummer: 1,
        vorname: "Max",
      }),
      PatientDto.createTestInstance({
        nummer: 2,
        vorname: "Erika",
      }),
    ],
  }: {
    patienten?: PatientDto[];
  } = {}): PatientenkarteiQueryResultDto {
    return PatientenkarteiQueryResultDto.create({ patienten });
  }

  static fromModel(
    result: PatientenkarteiQueryResult,
  ): PatientenkarteiQueryResultDto {
    const patienten = result.patienten.map((patient) =>
      PatientDto.create({
        ...patient,
        geburtsdatum: patient.geburtsdatum.toString(),
      }),
    );
    return PatientenkarteiQueryResultDto.create({ patienten });
  }

  readonly patienten: PatientDto[];

  private constructor(patienten: PatientDto[]) {
    this.patienten = patienten;
  }

  validate(): PatientenkarteiQueryResult {
    const patienten = this.patienten.map((patientDto) =>
      PatientDto.create(patientDto).validate(),
    );
    return PatientenkarteiQueryResult.create({ patienten });
  }
}

// endregion
// region Models

export class PatientDto {
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
    geburtsdatum: string;
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
  }): PatientDto {
    return new PatientDto(
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
    geburtsdatum?: string;
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
  } = {}): PatientDto {
    return PatientDto.create({
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
  readonly partner?: string;
  readonly kinder?: string;
  readonly notizen?: string;
  readonly schluesselworte?: string[];

  private constructor(
    nummer: number,
    nachname: string,
    vorname: string,
    geburtsdatum: string,
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
    this.geburtsdatum = geburtsdatum;
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

  validate(): Patient {
    return Patient.create(this);
  }
}

// endregion
