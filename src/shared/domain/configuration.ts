// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

export class Configuration {
  static create({
    praxis = [],
    anrede = ["Herr", "Frau"],
    familienstand = ["ledig", "verheiratet", "geschieden", "verwitwet"],
    schluesselworte = [],
    defaultSchluesselworte = [],
  }: Partial<Configuration> = {}): Configuration {
    return new Configuration(
      praxis,
      anrede,
      familienstand,
      schluesselworte,
      defaultSchluesselworte,
    );
  }

  static createTestInstance({
    praxis = ["Praxis 1", "Praxis 2"],
    anrede = ["Herr", "Frau"],
    familienstand = ["ledig", "verheiratet", "geschieden", "verwitwet"],
    schluesselworte = ["Aktiv", "Weihnachtskarte", "Geburtstagskarte"],
    defaultSchluesselworte = ["Aktiv", "Weihnachtskarte"],
  }: Partial<Configuration> = {}): Configuration {
    return Configuration.create({
      praxis,
      anrede,
      familienstand,
      schluesselworte,
      defaultSchluesselworte,
    });
  }

  readonly praxis: string[];
  readonly anrede: string[];
  readonly familienstand: string[];
  readonly schluesselworte: string[];
  readonly defaultSchluesselworte: string[];

  constructor(
    praxis: string[],
    anrede: string[],
    familienstand: string[],
    schluesselworte: string[],
    defaultSchluesselworte: string[],
  ) {
    this.praxis = praxis;
    this.anrede = anrede;
    this.familienstand = familienstand;
    this.schluesselworte = schluesselworte;
    this.defaultSchluesselworte = defaultSchluesselworte;
  }
}
