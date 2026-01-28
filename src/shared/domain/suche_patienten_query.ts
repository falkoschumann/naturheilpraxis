// Copyright (c) 2026 Falko Schumann. All rights reserved. MIT license.

import { Patient } from "./patient";

export class PatientenQuery {
  static create() {
    return new PatientenQuery();
  }

  static createTestInstance() {
    return PatientenQuery.create();
  }

  private constructor() {}
}

export class PatientenQueryResult {
  static create({ patienten = [] }: { patienten?: Patient[] } = {}) {
    return new PatientenQueryResult(patienten);
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
  } = {}) {
    return PatientenQueryResult.create({ patienten });
  }

  readonly patienten: Patient[];

  private constructor(patienten: Patient[]) {
    this.patienten = patienten;
  }
}
