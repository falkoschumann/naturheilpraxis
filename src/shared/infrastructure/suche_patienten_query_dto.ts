// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

import {
  PatientenQuery,
  PatientenQueryResult,
} from "../domain/suche_patienten_query";
import { PatientDto } from "./patient_dto";

export class PatientenQueryDto {
  static create(_other = {}): PatientenQueryDto {
    return new PatientenQueryDto();
  }

  static createTestInstance() {
    return PatientenQueryDto.create();
  }

  static fromModel(_model: PatientenQuery): PatientenQueryDto {
    return PatientenQueryDto.create();
  }

  private constructor() {}

  validate(): PatientenQuery {
    return PatientenQuery.create();
  }
}

export class PatientenQueryResultDto {
  static create({ patienten }: { patienten: PatientDto[] }) {
    return new PatientenQueryResultDto(patienten);
  }

  static createTestInstance({
    patienten = [
      PatientDto.createTestInstance({
        nummer: 1,
        vorname: "Max",
      }),
      PatientDto.createTestInstance({
        nummer: 2,
        vorname: "Erika",
      }),
    ],
  }: {
    patienten?: PatientDto[];
  } = {}): PatientenQueryResultDto {
    return PatientenQueryResultDto.create({ patienten });
  }

  static fromModel(result: PatientenQueryResult): PatientenQueryResultDto {
    const patienten = result.patienten.map((patient) =>
      PatientDto.create({
        ...patient,
        geburtsdatum: patient.geburtsdatum.toString(),
      }),
    );
    return PatientenQueryResultDto.create({ patienten });
  }

  readonly patienten: PatientDto[];

  private constructor(patienten: PatientDto[]) {
    this.patienten = patienten;
  }

  validate(): PatientenQueryResult {
    const patienten = this.patienten.map((patientDto) =>
      PatientDto.create(patientDto).validate(),
    );
    return PatientenQueryResult.create({ patienten });
  }
}
