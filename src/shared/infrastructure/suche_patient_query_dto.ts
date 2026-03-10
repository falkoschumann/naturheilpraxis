// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

import {
  PatientQuery,
  PatientQueryResult,
} from "../domain/suche_patient_query";
import { PatientDto } from "./patient_dto";

export class PatientQueryDto {
  static create({ nummer }: { nummer?: number }) {
    return new PatientQueryDto(nummer);
  }

  static createTestInstance({ nummer = 1 }: { nummer?: number } = {}) {
    return PatientQueryDto.create({ nummer });
  }

  static fromModel(model: PatientQuery): PatientQueryDto {
    return PatientQueryDto.create(model);
  }

  readonly nummer?: number;

  private constructor(nummer?: number) {
    this.nummer = nummer;
  }

  validate(): PatientQuery {
    return PatientQuery.create(this);
  }
}

export class PatientQueryResultDto {
  static create({
    patient,
    praxen = [],
    anreden = [],
    familienstaende = [],
    schluesselworte = [],
  }: {
    patient?: PatientDto;
    praxen?: string[];
    anreden?: string[];
    familienstaende?: string[];
    schluesselworte?: string[];
  } = {}) {
    return new PatientQueryResultDto(
      praxen,
      anreden,
      familienstaende,
      schluesselworte,
      patient,
    );
  }

  static createTestInstance({
    patient = PatientDto.createTestInstance(),
    praxen = ["Praxis 1", "Praxis 2"],
    anreden = ["Herr", "Frau", "Fräulein"],
    familienstaende = ["ledig", "verheiratet", "geschieden", "verwitwet"],
    schluesselworte = ["Aktiv", "Weihnachtskarte", "Geburtstagskarte"],
  }: {
    patient?: PatientDto;
    praxen?: string[];
    anreden?: string[];
    familienstaende?: string[];
    schluesselworte?: string[];
  } = {}): PatientQueryResultDto {
    return PatientQueryResultDto.create({
      patient,
      praxen,
      anreden,
      familienstaende,
      schluesselworte,
    });
  }

  static fromModel(result: PatientQueryResult): PatientQueryResultDto {
    const patient = result.patient
      ? PatientDto.fromModel(result.patient)
      : undefined;
    return PatientQueryResultDto.create({
      patient,
      praxen: result.praxen,
      anreden: result.anreden,
      familienstaende: result.familienstaende,
      schluesselworte: result.schluesselworte,
    });
  }

  readonly patient?: PatientDto;
  readonly praxen: string[];
  readonly anreden: string[];
  readonly familienstaende: string[];
  readonly schluesselworte: string[];

  private constructor(
    praxen: string[],
    anreden: string[],
    familienstaende: string[],
    schluesselworte: string[],
    patient?: PatientDto,
  ) {
    this.patient = patient;
    this.praxen = praxen;
    this.anreden = anreden;
    this.familienstaende = familienstaende;
    this.schluesselworte = schluesselworte;
  }

  validate(): PatientQueryResult {
    const patient = this.patient
      ? PatientDto.create(this.patient).validate()
      : undefined;
    return PatientQueryResult.create({
      patient,
      praxen: this.praxen,
      anreden: this.anreden,
      familienstaende: this.familienstaende,
      schluesselworte: this.schluesselworte,
    });
  }
}
