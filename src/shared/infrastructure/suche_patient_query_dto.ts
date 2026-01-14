// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

import {
  SuchePatientQuery,
  SuchePatientQueryResult,
} from "../domain/suche_patient_query";
import { PatientDto } from "./patient_dto";

export class SuchePatientQueryDto {
  static create({ nummer }: { nummer: number }) {
    return new SuchePatientQueryDto(nummer);
  }

  static createTestInstance({ nummer = 1 }: { nummer?: number } = {}) {
    return SuchePatientQueryDto.create({ nummer });
  }

  static fromModel(model: SuchePatientQuery): SuchePatientQueryDto {
    return SuchePatientQueryDto.create(model);
  }

  readonly nummer: number;

  private constructor(nummer: number) {
    this.nummer = nummer;
  }

  validate(): SuchePatientQuery {
    return SuchePatientQuery.create(this);
  }
}

export class SuchePatientQueryResultDto {
  static create({ patient }: { patient?: PatientDto }) {
    return new SuchePatientQueryResultDto(patient);
  }

  static createTestInstance({
    patient = PatientDto.createTestInstance({
      nummer: 1,
      vorname: "Max",
    }),
  }: {
    patient?: PatientDto;
  } = {}): SuchePatientQueryResultDto {
    return SuchePatientQueryResultDto.create({ patient });
  }

  static fromModel(
    result: SuchePatientQueryResult,
  ): SuchePatientQueryResultDto {
    const patient = result.patient
      ? PatientDto.create({
          ...result.patient,
          geburtsdatum: result.patient.geburtsdatum.toString(),
        })
      : undefined;
    return SuchePatientQueryResultDto.create({ patient });
  }

  readonly patient?: PatientDto;

  private constructor(patient?: PatientDto) {
    this.patient = patient;
  }

  validate(): SuchePatientQueryResult {
    const patient = this.patient
      ? PatientDto.create(this.patient).validate()
      : undefined;
    return SuchePatientQueryResult.create({ patient });
  }
}
