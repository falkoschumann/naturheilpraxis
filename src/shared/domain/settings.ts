// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

// TODO split settings: Mandant, Patient, ...

export class Settings {
  static create({
    praxis = ["Naturheilpraxis"],
    anrede = ["Herr", "Frau"],
    familienstand = [
      "ledig",
      "verheiratet",
      "getrennt",
      "geschieden",
      "verwitwet",
    ],
    schluesselworte = [],
    standardSchluesselworte = [],
  }: {
    praxis?: string[];
    anrede?: string[];
    familienstand?: string[];
    schluesselworte?: string[];
    standardSchluesselworte?: string[];
  } = {}): Settings {
    return new Settings(
      praxis,
      anrede,
      familienstand,
      schluesselworte,
      standardSchluesselworte,
    );
  }

  static createTestInstance({
    praxis = ["Praxis 1", "Praxis 2"],
    anrede = ["Herr", "Frau", "Fräulein"],
    familienstand = ["ledig", "verheiratet", "geschieden", "verwitwet"],
    schluesselworte = ["Aktiv", "Weihnachtskarte", "Geburtstagskarte"],
    standardSchluesselworte = ["Aktiv", "Weihnachtskarte"],
  }: Partial<Settings> = {}): Settings {
    return Settings.create({
      praxis,
      anrede,
      familienstand,
      schluesselworte,
      standardSchluesselworte,
    });
  }

  readonly praxis: string[];
  readonly anrede: string[];
  readonly familienstand: string[];
  readonly schluesselworte: string[];
  readonly standardSchluesselworte: string[];

  constructor(
    praxis: string[],
    anrede: string[],
    familienstand: string[],
    schluesselworte: string[],
    standardSchluesselworte: string[],
  ) {
    this.praxis = praxis;
    this.anrede = anrede;
    this.familienstand = familienstand;
    this.schluesselworte = schluesselworte;
    this.standardSchluesselworte = standardSchluesselworte;
  }
}
