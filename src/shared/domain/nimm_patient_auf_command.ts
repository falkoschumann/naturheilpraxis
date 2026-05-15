// Copyright (c) 2026 Falko Schumann. All rights reserved. MIT license.

import { Failure, Success } from "@muspellheim/shared";

import { Patient } from "./patient";

export class NimmPatientAufCommand {
  static create({ patient }: { patient: Patient }) {
    return new NimmPatientAufCommand(patient);
  }

  static createTestInstance({
    patient = Patient.createTestInstance(),
  }: {
    patient?: Patient;
  } = {}) {
    return NimmPatientAufCommand.create({ patient });
  }

  readonly patient: Patient;

  private constructor(patient: Patient) {
    this.patient = Patient.create(patient);
  }
}

export type NimmPatientAufCommandStatus = Success<{ nummer: number }> | Failure;
