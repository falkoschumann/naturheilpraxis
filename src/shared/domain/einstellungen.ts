// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

// TODO split settings: Mandant, Patient, ...

export class Einstellungen {
  static create({
    praxen,
    anreden,
    familienstände,
    schlüsselworte,
  }: {
    praxen: string[];
    anreden: string[];
    familienstände: string[];
    schlüsselworte: Schlüsselwort[];
  }): Einstellungen {
    return new Einstellungen(praxen, anreden, familienstände, schlüsselworte);
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
  }: {
    praxen?: string[];
    anreden?: string[];
    familienstände?: string[];
    schlüsselworte?: Schlüsselwort[];
  } = {}): Einstellungen {
    return new Einstellungen(praxen, anreden, familienstände, schlüsselworte);
  }

  static createTestInstance({
    praxen = ["Praxis 1", "Praxis 2"],
    anreden = ["Herr", "Frau", "Fräulein"],
    familienstände = ["ledig", "verheiratet", "geschieden", "verwitwet"],
    schlüsselworte = [
      { name: "Aktiv", istDefault: true },
      { name: "Weihnachtskarte", istDefault: true },
      { name: "Geburtstagskarte", istDefault: false },
    ],
  }: {
    praxen?: string[];
    anreden?: string[];
    familienstände?: string[];
    schlüsselworte?: Schlüsselwort[];
  } = {}): Einstellungen {
    return Einstellungen.create({
      praxen,
      anreden,
      familienstände: familienstände,
      schlüsselworte: schlüsselworte,
    });
  }

  readonly praxen: string[];
  readonly anreden: string[];
  readonly familienstände: string[];
  readonly schlüsselworte: Schlüsselwort[];

  constructor(
    praxen: string[],
    anreden: string[],
    familienstände: string[],
    schlüsselworte: Schlüsselwort[],
  ) {
    this.praxen = praxen;
    this.anreden = anreden;
    this.familienstände = familienstände;
    this.schlüsselworte = schlüsselworte;
  }
}

export type Schlüsselwort = { name: string; istDefault: boolean };
