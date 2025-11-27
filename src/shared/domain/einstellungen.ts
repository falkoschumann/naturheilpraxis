// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

// TODO configure data folder
// TODO split configuration: Mandant, Patient, ...

export class Einstellungen {
  static create({
    praxis,
    anrede,
    familienstand,
    schluesselworte,
    standardSchluesselworte,
  }: Einstellungen): Einstellungen {
    return new Einstellungen(
      praxis,
      anrede,
      familienstand,
      schluesselworte,
      standardSchluesselworte,
    );
  }

  static createDefault(): Einstellungen {
    return new Einstellungen(
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
  }: Partial<Einstellungen> = {}): Einstellungen {
    return Einstellungen.create({
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
