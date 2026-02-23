// Copyright (c) 2026 Falko Schumann. All rights reserved. MIT license.

import { Failure, Success } from "@muspellheim/shared";

import {
  NimmPatientAufCommand,
  type NimmPatientAufCommandStatus,
} from "../domain/nimm_patient_auf_command";

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
    schluesselworte = ["Schlüsselwort1", "Schlüsselwort2"],
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
        nummer: model.result!.nummer,
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
      return new Success({ nummer: this.nummer! });
    } else {
      return new Failure(this.errorMessage!);
    }
  }
}
