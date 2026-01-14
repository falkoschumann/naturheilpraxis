// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

import {
  SuchePatientenQuery,
  SuchePatientenQueryResult,
} from "../domain/suche_patienten_query";
import { PatientDto } from "./patient_dto";

export class SuchePatientenQueryDto {
  static create(_other = {}): SuchePatientenQueryDto {
    return new SuchePatientenQueryDto();
  }

  static createTestInstance() {
    return SuchePatientenQueryDto.create();
  }

  static fromModel(_model: SuchePatientenQuery): SuchePatientenQueryDto {
    return SuchePatientenQueryDto.create();
  }

  private constructor() {}

  validate(): SuchePatientenQuery {
    return SuchePatientenQuery.create();
  }
}

export class SuchePatientenQueryResultDto {
  static create({ patienten }: { patienten: PatientDto[] }) {
    return new SuchePatientenQueryResultDto(patienten);
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
  } = {}): SuchePatientenQueryResultDto {
    return SuchePatientenQueryResultDto.create({ patienten });
  }

  static fromModel(
    result: SuchePatientenQueryResult,
  ): SuchePatientenQueryResultDto {
    const patienten = result.patienten.map((patient) =>
      PatientDto.create({
        ...patient,
        geburtsdatum: patient.geburtsdatum.toString(),
      }),
    );
    return SuchePatientenQueryResultDto.create({ patienten });
  }

  readonly patienten: PatientDto[];

  private constructor(patienten: PatientDto[]) {
    this.patienten = patienten;
  }

  validate(): SuchePatientenQueryResult {
    const patienten = this.patienten.map((patientDto) =>
      PatientDto.create(patientDto).validate(),
    );
    return SuchePatientenQueryResult.create({ patienten });
  }
}
