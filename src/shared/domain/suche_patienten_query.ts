// Copyright (c) 2026 Falko Schumann. All rights reserved. MIT license.

import { Patient } from "./patient";

export class SuchePatientenQuery {
  static create() {
    return new SuchePatientenQuery();
  }

  static createTestInstance() {
    return SuchePatientenQuery.create();
  }

  private constructor() {}
}

export class SuchePatientenQueryResult {
  static create({ patienten = [] }: { patienten?: Patient[] } = {}) {
    return new SuchePatientenQueryResult(patienten);
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
    return SuchePatientenQueryResult.create({ patienten });
  }

  readonly patienten: Patient[];

  private constructor(patienten: Patient[]) {
    this.patienten = patienten;
  }
}
