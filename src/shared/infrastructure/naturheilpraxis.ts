// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

import { Failure, Success } from "@muspellheim/shared";

import {
  NimmPatientAufCommand,
  type NimmPatientAufCommandStatus,
  Patient,
  PatientenkarteiQuery,
  PatientenkarteiQueryResult,
} from "../domain/naturheilpraxis";

//
// Commands
//

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
    partnerVon,
    kindVon,
    memo,
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
    partnerVon?: string;
    kindVon?: string;
    memo?: string;
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
    partnerVon?: string;
    kindVon?: string;
    memo?: string;
    schluesselworte?: string[];
  } = {}): NimmPatientAufCommandDto {
    return NimmPatientAufCommandDto.create({
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
    partnerVon?: string,
    kindVon?: string,
    memo?: string,
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
    this.partnerVon = partnerVon;
    this.kindVon = kindVon;
    this.memo = memo;
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
      return NimmPatientAufSuccessDto.create({ nummer: model.nummer });
    } else {
      return new Failure(model.errorMessage);
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
}

export class NimmPatientAufSuccessDto extends Success {
  static create({ nummer }: { nummer: number }) {
    return new NimmPatientAufSuccessDto(nummer);
  }

  readonly nummer: number;

  private constructor(nummer: number) {
    super();
    this.nummer = nummer;
  }
}

//
// Queries
//

export class PatientenkarteiQueryDto {
  static create({ nummer }: PatientenkarteiQueryDto) {
    return new PatientenkarteiQueryDto(nummer);
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
  static create({ patienten }: PatientenkarteiQueryResultDto) {
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
    partnerVon,
    kindVon,
    memo,
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
    partnerVon?: string;
    kindVon?: string;
    memo?: string;
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
    partnerVon?: string;
    kindVon?: string;
    memo?: string;
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
      partnerVon,
      kindVon,
      memo,
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
  readonly partnerVon?: string;
  readonly kindVon?: string;
  readonly memo?: string;
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
    partnerVon?: string,
    kindVon?: string,
    memo?: string,
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
    this.partnerVon = partnerVon;
    this.kindVon = kindVon;
    this.memo = memo;
    this.schluesselworte = schluesselworte;
  }

  validate(): Patient {
    return Patient.create(this);
  }
}
