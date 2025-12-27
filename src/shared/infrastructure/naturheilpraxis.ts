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
    kinder,
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
    kinder?: string;
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
      kinder,
      notizen,
      schluesselworte,
    );
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
  readonly kinder?: string;
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
    kinder?: string,
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
    this.kinder = kinder;
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
