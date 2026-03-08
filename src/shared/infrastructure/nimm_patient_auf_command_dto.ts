// Copyright (c) 2026 Falko Schumann. All rights reserved. MIT license.

import { Failure, Success } from "@muspellheim/shared";

import {
  NimmPatientAufCommand,
  type NimmPatientAufCommandStatus,
} from "../domain/nimm_patient_auf_command";
import { PatientDto } from "./patient_dto";

export class NimmPatientAufCommandDto {
  static create({
    patient,
  }: {
    patient: PatientDto;
  }): NimmPatientAufCommandDto {
    return new NimmPatientAufCommandDto(patient);
  }

  static createTestInstance({
    patient = PatientDto.createTestInstance(),
  }: {
    patient?: PatientDto;
  } = {}): NimmPatientAufCommandDto {
    return NimmPatientAufCommandDto.create({
      patient,
    });
  }

  static fromModel(model: NimmPatientAufCommand): NimmPatientAufCommandDto {
    return NimmPatientAufCommandDto.create({
      patient: PatientDto.fromModel(model.patient),
    });
  }

  readonly patient: PatientDto;

  private constructor(patient: PatientDto) {
    this.patient = patient;
  }

  validate(): NimmPatientAufCommand {
    return NimmPatientAufCommand.create({
      patient: this.patient.validate(),
    });
  }
}

export class NimmPatientAufCommandStatusDto {
  static create({
    isSuccess,
    errorMessage,
    nummer,
  }: {
    isSuccess: boolean;
    errorMessage?: string;
    nummer?: number;
  }): NimmPatientAufCommandStatusDto {
    return new NimmPatientAufCommandStatusDto(isSuccess, errorMessage, nummer);
  }

  static fromModel(
    model: NimmPatientAufCommandStatus,
  ): NimmPatientAufCommandStatusDto {
    if (model.isSuccess) {
      return NimmPatientAufCommandStatusDto.create({
        isSuccess: true,
        nummer: model.result!.nummer,
      });
    } else {
      return NimmPatientAufCommandStatusDto.create({
        isSuccess: false,
        errorMessage: model.errorMessage,
      });
    }
  }

  isSuccess: boolean;
  errorMessage?: string;
  nummer?: number;

  constructor(isSuccess: boolean, errorMessage?: string, nummer?: number) {
    this.isSuccess = isSuccess;
    this.errorMessage = errorMessage;
    this.nummer = nummer;
  }

  validate(): NimmPatientAufCommandStatus {
    if (this.isSuccess) {
      return new Success({ nummer: this.nummer! });
    } else {
      return new Failure(this.errorMessage!);
    }
  }
}
