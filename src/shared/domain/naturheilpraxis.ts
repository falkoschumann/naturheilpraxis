// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

import { Patient } from "./patient";

// region Queries

export class PatientenkarteiQuery {
  static create({ nummer }: PatientenkarteiQuery) {
    return new PatientenkarteiQuery(nummer);
  }

  static createTestInstance({
    nummer = 42,
  }: { nummer?: number } = {}): PatientenkarteiQuery {
    return PatientenkarteiQuery.create({ nummer });
  }

  readonly nummer?: number;

  private constructor(nummer?: number) {
    this.nummer = nummer;
  }
}

export class PatientenkarteiQueryResult {
  static create({ patienten }: PatientenkarteiQueryResult) {
    return new PatientenkarteiQueryResult(patienten);
  }

  static createTestInstance({
    patienten = [
      Patient.createTestInstance({
        nummer: 1,
        vorname: "Max",
      }),
      Patient.createTestInstance({
        nummer: 2,
        vorname: "Erika",
      }),
    ],
  }: {
    patienten?: Patient[];
  } = {}): PatientenkarteiQueryResult {
    return PatientenkarteiQueryResult.create({ patienten });
  }

  static createEmpty() {
    return PatientenkarteiQueryResult.create({ patienten: [] });
  }

  readonly patienten: Patient[];

  private constructor(patienten: Patient[]) {
    this.patienten = patienten;
  }
}

// endregion
