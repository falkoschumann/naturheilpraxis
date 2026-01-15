// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

// TODO configure data folder
// TODO split configuration: Mandant, Patient, ...

export class Settings {
  static create({
    praxis,
    anrede,
    familienstand,
    schluesselworte,
    standardSchluesselworte,
  }: Settings): Settings {
    return new Settings(
      praxis,
      anrede,
      familienstand,
      schluesselworte,
      standardSchluesselworte,
    );
  }

  static createDefault(): Settings {
    return new Settings(
      ["Naturheilpraxis"],
      ["Herr", "Frau"],
      ["ledig", "verheiratet", "getrennt", "geschieden", "verwitwet"],
      [],
      [],
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
