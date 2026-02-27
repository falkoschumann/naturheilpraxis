// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

import { Einstellungen } from "../domain/einstellungen";

export class EinstellungenDto {
  static create({
    praxen = [],
    anreden = [],
    familienstaende = [],
    schluesselworte = [],
    standardSchluesselworte = [],
  }: {
    praxen?: string[];
    anreden?: string[];
    familienstaende?: string[];
    schluesselworte?: string[];
    standardSchluesselworte?: string[];
  } = {}): EinstellungenDto {
    return new EinstellungenDto(
      praxen,
      anreden,
      familienstaende,
      schluesselworte,
      standardSchluesselworte,
    );
  }

  static createTestInstance({
    praxen = ["Praxis 1", "Praxis 2"],
    anreden = ["Herr", "Frau", "Fräulein"],
    familienstaende = ["ledig", "verheiratet", "geschieden", "verwitwet"],
    schluesselworte = ["Aktiv", "Weihnachtskarte", "Geburtstagskarte"],
    standardSchluesselworte = ["Aktiv", "Weihnachtskarte"],
  }: Partial<Einstellungen> = {}): EinstellungenDto {
    return EinstellungenDto.create({
      praxen,
      anreden,
      familienstaende,
      schluesselworte,
      standardSchluesselworte,
    });
  }

  static fromModel(einstellungen: Einstellungen): EinstellungenDto {
    return EinstellungenDto.create(einstellungen);
  }

  readonly praxen: string[];
  readonly anreden: string[];
  readonly familienstaende: string[];
  readonly schluesselworte: string[];
  readonly standardSchluesselworte: string[];

  constructor(
    praxen: string[],
    anreden: string[],
    familienstaende: string[],
    schluesselworte: string[],
    standardSchluesselworte: string[],
  ) {
    this.praxen = praxen;
    this.anreden = anreden;
    this.familienstaende = familienstaende;
    this.schluesselworte = schluesselworte;
    this.standardSchluesselworte = standardSchluesselworte;
  }

  validate(): Einstellungen {
    return Einstellungen.create(this);
  }
}
