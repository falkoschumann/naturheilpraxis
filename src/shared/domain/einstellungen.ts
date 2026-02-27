// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

// TODO split settings: Mandant, Patient, ...

export class Einstellungen {
  static create({
    praxen = ["Naturheilpraxis"],
    anreden = ["Herr", "Frau"],
    familienstaende = [
      "ledig",
      "verheiratet",
      "getrennt",
      "geschieden",
      "verwitwet",
    ],
    schluesselworte = [],
    standardSchluesselworte = [],
  }: {
    praxen?: string[];
    anreden?: string[];
    familienstaende?: string[];
    schluesselworte?: string[];
    standardSchluesselworte?: string[];
  } = {}): Einstellungen {
    return new Einstellungen(
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
  }: Partial<Einstellungen> = {}): Einstellungen {
    return Einstellungen.create({
      praxen,
      anreden,
      familienstaende,
      schluesselworte,
      standardSchluesselworte,
    });
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
}
