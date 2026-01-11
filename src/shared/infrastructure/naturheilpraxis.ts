// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

import {
  PatientenkarteiQuery,
  PatientenkarteiQueryResult,
} from "../domain/naturheilpraxis";
import { PatientDto } from "./patient_dto";

// region Queries

export class PatientenkarteiQueryDto {
  static create({ nummer }: { nummer?: number }) {
    return new PatientenkarteiQueryDto(nummer);
  }

  static createTestInstance({
    nummer = 42,
  }: { nummer?: number } = {}): PatientenkarteiQueryDto {
    return PatientenkarteiQueryDto.create({ nummer });
  }

  static fromModel(model: PatientenkarteiQuery): PatientenkarteiQueryDto {
    return PatientenkarteiQueryDto.create(model);
  }

  readonly nummer?: number;

  private constructor(nummer?: number) {
    this.nummer = nummer;
  }

  validate(): PatientenkarteiQuery {
    return PatientenkarteiQuery.create(this);
  }
}

export class PatientenkarteiQueryResultDto {
  static create({ patienten }: { patienten: PatientDto[] }) {
    return new PatientenkarteiQueryResultDto(patienten);
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
  } = {}): PatientenkarteiQueryResultDto {
    return PatientenkarteiQueryResultDto.create({ patienten });
  }

  static fromModel(
    result: PatientenkarteiQueryResult,
  ): PatientenkarteiQueryResultDto {
    const patienten = result.patienten.map((patient) =>
      PatientDto.create({
        ...patient,
        geburtsdatum: patient.geburtsdatum.toString(),
      }),
    );
    return PatientenkarteiQueryResultDto.create({ patienten });
  }

  readonly patienten: PatientDto[];

  private constructor(patienten: PatientDto[]) {
    this.patienten = patienten;
  }

  validate(): PatientenkarteiQueryResult {
    const patienten = this.patienten.map((patientDto) =>
      PatientDto.create(patientDto).validate(),
    );
    return PatientenkarteiQueryResult.create({ patienten });
  }
}

// endregion
