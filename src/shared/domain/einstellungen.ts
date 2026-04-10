// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

// TODO split settings: Mandant, Patient, ...

export class Einstellungen {
  static create({
    praxen,
    anreden,
    familienstände,
    schlüsselworte,
    standardSchlüsselworte,
  }: {
    praxen: string[];
    anreden: string[];
    familienstände: string[];
    schlüsselworte: string[];
    standardSchlüsselworte: string[];
  }): Einstellungen {
    return new Einstellungen(
      praxen,
      anreden,
      familienstände,
      schlüsselworte,
      standardSchlüsselworte,
    );
  }

  static createDefault({
    praxen = ["Naturheilpraxis"],
    anreden = ["Herr", "Frau"],
    familienstände = [
      "ledig",
      "verheiratet",
      "getrennt",
      "geschieden",
      "verwitwet",
    ],
    schlüsselworte = [],
    standardSchlüsselworte = [],
  }: {
    praxen?: string[];
    anreden?: string[];
    familienstände?: string[];
    schlüsselworte?: string[];
    standardSchlüsselworte?: string[];
  } = {}): Einstellungen {
    return new Einstellungen(
      praxen,
      anreden,
      familienstände,
      schlüsselworte,
      standardSchlüsselworte,
    );
  }

  static createTestInstance({
    praxen = ["Praxis 1", "Praxis 2"],
    anreden = ["Herr", "Frau", "Fräulein"],
    familienstände = ["ledig", "verheiratet", "geschieden", "verwitwet"],
    schlüsselworte = ["Aktiv", "Weihnachtskarte", "Geburtstagskarte"],
    standardSchlüsselworte = ["Aktiv", "Weihnachtskarte"],
  }: {
    praxen?: string[];
    anreden?: string[];
    familienstände?: string[];
    schlüsselworte?: string[];
    standardSchlüsselworte?: string[];
  } = {}): Einstellungen {
    return Einstellungen.create({
      praxen,
      anreden,
      familienstände: familienstände,
      schlüsselworte: schlüsselworte,
      standardSchlüsselworte: standardSchlüsselworte,
    });
  }

  readonly praxen: string[];
  readonly anreden: string[];
  readonly familienstände: string[];
  readonly schlüsselworte: string[];
  readonly standardSchlüsselworte: string[];

  constructor(
    praxen: string[],
    anreden: string[],
    familienstände: string[],
    schlüsselworte: string[],
    standardSchlüsselworte: string[],
  ) {
    this.praxen = praxen;
    this.anreden = anreden;
    this.familienstände = familienstände;
    this.schlüsselworte = schlüsselworte;
    this.standardSchlüsselworte = standardSchlüsselworte;
  }
}
