// Copyright (c) 2026 Falko Schumann. All rights reserved. MIT license.

import { Patient } from "./patient";

export class PatientQuery {
  static create({ nummer }: { nummer: number }) {
    return new PatientQuery(nummer);
  }

  static createTestInstance({ nummer = 1 }: { nummer?: number } = {}) {
    return PatientQuery.create({ nummer });
  }

  readonly nummer: number;

  private constructor(nummer: number) {
    this.nummer = nummer;
  }
}

export class PatientQueryResult {
  static create({ patient }: { patient?: Patient } = {}) {
    return new PatientQueryResult(patient);
  }

  static createTestInstance({
    patient = Patient.createTestInstance(),
  }: {
    patient?: Patient;
  } = {}) {
    return PatientQueryResult.create({ patient });
  }

  readonly patient?: Patient;

  private constructor(patient?: Patient) {
    this.patient = patient;
  }
}
