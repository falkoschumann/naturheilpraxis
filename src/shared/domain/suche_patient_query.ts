// Copyright (c) 2026 Falko Schumann. All rights reserved. MIT license.

import { Patient } from "./patient";

// TODO remove prefix 'Suche' from class names

export class SuchePatientQuery {
  static create({ nummer }: { nummer: number }) {
    return new SuchePatientQuery(nummer);
  }

  static createTestInstance({ nummer = 1 }: { nummer?: number } = {}) {
    return SuchePatientQuery.create({ nummer });
  }

  readonly nummer: number;

  private constructor(nummer: number) {
    this.nummer = nummer;
  }
}

export class SuchePatientQueryResult {
  static create({ patient }: { patient?: Patient } = {}) {
    return new SuchePatientQueryResult(patient);
  }

  static createTestInstance({
    patient = Patient.createTestInstance({ nummer: 1 }),
  }: {
    patient?: Patient;
  } = {}) {
    return SuchePatientQueryResult.create({ patient });
  }

  readonly patient?: Patient;

  private constructor(patient?: Patient) {
    this.patient = patient;
  }
}
