// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

import {
  PatientQuery,
  PatientQueryResult,
} from "../domain/suche_patient_query";
import { PatientDto } from "./patient_dto";

export class PatientQueryDto {
  static create({ nummer }: { nummer: number }) {
    return new PatientQueryDto(nummer);
  }

  static createTestInstance({ nummer = 1 }: { nummer?: number } = {}) {
    return PatientQueryDto.create({ nummer });
  }

  static fromModel(model: PatientQuery): PatientQueryDto {
    return PatientQueryDto.create(model);
  }

  readonly nummer: number;

  private constructor(nummer: number) {
    this.nummer = nummer;
  }

  validate(): PatientQuery {
    return PatientQuery.create(this);
  }
}

export class PatientQueryResultDto {
  static create({ patient }: { patient?: PatientDto }) {
    return new PatientQueryResultDto(patient);
  }

  static createTestInstance({
    patient = PatientDto.createTestInstance({
      nummer: 1,
      vorname: "Max",
    }),
  }: {
    patient?: PatientDto;
  } = {}): PatientQueryResultDto {
    return PatientQueryResultDto.create({ patient });
  }

  static fromModel(result: PatientQueryResult): PatientQueryResultDto {
    const patient = result.patient
      ? PatientDto.create({
          ...result.patient,
          geburtsdatum: result.patient.geburtsdatum.toString(),
        })
      : undefined;
    return PatientQueryResultDto.create({ patient });
  }

  readonly patient?: PatientDto;

  private constructor(patient?: PatientDto) {
    this.patient = patient;
  }

  validate(): PatientQueryResult {
    const patient = this.patient
      ? PatientDto.create(this.patient).validate()
      : undefined;
    return PatientQueryResult.create({ patient });
  }
}
