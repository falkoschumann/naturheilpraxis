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
    familienstände = [],
    schlüsselworte = [],
  }: {
    patient?: Patient;
    praxen?: string[];
    anreden?: string[];
    familienstände?: string[];
    schlüsselworte?: string[];
  } = {}) {
    return new PatientQueryResult(
      praxen,
      anreden,
      familienstände,
      schlüsselworte,
      patient,
    );
  }

  static createTestInstance({
    patient = Patient.createTestInstance(),
    praxen = ["Naturheilpraxis"],
    anreden = ["Frau", "Herr"],
    familienstände = [
      "geschieden",
      "getrennt",
      "ledig",
      "verheiratet",
      "verwitwet",
    ],
    schlüsselworte = [
      "E-Mail",
      "Geburtstagskarte",
      "Selbstzahler",
      "Weihnachtskarte",
      "Werbung",
      "gesetzlich versichert",
      "privat versichert",
    ],
  }: {
    patient?: Patient;
    praxen?: string[];
    anreden?: string[];
    familienstände?: string[];
    schlüsselworte?: string[];
  } = {}) {
    return PatientQueryResult.create({
      patient,
      praxen,
      anreden,
      familienstände,
      schlüsselworte,
    });
  }

  readonly patient?: Patient;
  readonly praxen: string[];
  readonly anreden: string[];
  readonly familienstände: string[];
  readonly schlüsselworte: string[];

  private constructor(
    praxen: string[],
    anreden: string[],
    familienstände: string[],
    schlüsselworte: string[],
    patient?: Patient,
  ) {
    this.patient = patient && Patient.create(patient);
    this.praxen = praxen;
    this.anreden = anreden;
    this.familienstände = familienstände;
    this.schlüsselworte = schlüsselworte;
  }
}
