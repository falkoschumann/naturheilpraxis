// Copyright (c) 2026 Falko Schumann. All rights reserved. MIT license.

import { Patient } from "./patient";

export class PatientQuery {
  static create({ nummer }: { nummer?: number } = {}) {
    return new PatientQuery(nummer);
  }

  static createTestInstance({ nummer = 1 }: { nummer?: number } = {}) {
    return PatientQuery.create({ nummer });
  }

  readonly nummer?: number;

  private constructor(nummer?: number) {
    this.nummer = nummer;
  }
}

export class PatientQueryResult {
  static create({
    patient,
    praxen = [],
    anreden = [],
    familienstaende = [],
    schluesselworte = [],
  }: {
    patient?: Patient;
    praxen?: string[];
    anreden?: string[];
    familienstaende?: string[];
    schluesselworte?: string[];
  } = {}) {
    return new PatientQueryResult(
      praxen,
      anreden,
      familienstaende,
      schluesselworte,
      patient,
    );
  }

  static createTestInstance({
    patient = Patient.createTestInstance(),
    praxen = ["Praxis 1", "Praxis 2"],
    anreden = ["Herr", "Frau", "Fräulein"],
    familienstaende = ["ledig", "verheiratet", "geschieden", "verwitwet"],
    schluesselworte = ["Aktiv", "Weihnachtskarte", "Geburtstagskarte"],
  }: {
    patient?: Patient;
    praxen?: string[];
    anreden?: string[];
    familienstaende?: string[];
    schluesselworte?: string[];
  } = {}) {
    return PatientQueryResult.create({
      patient,
      praxen,
      anreden,
      familienstaende,
      schluesselworte,
    });
  }

  readonly patient?: Patient;
  readonly praxen: string[];
  readonly anreden: string[];
  readonly familienstaende: string[];
  readonly schluesselworte: string[];

  private constructor(
    praxen: string[],
    anreden: string[],
    familienstaende: string[],
    schluesselworte: string[],
    patient?: Patient,
  ) {
    this.patient = patient;
    this.praxen = praxen;
    this.anreden = anreden;
    this.familienstaende = familienstaende;
    this.schluesselworte = schluesselworte;
  }
}
