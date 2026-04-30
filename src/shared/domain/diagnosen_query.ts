// Copyright (c) 2026 Falko Schumann. All rights reserved. MIT license.

import { Diagnose } from "./diagnose";

export class DiagnosenQuery {
  static create({ patientennummer }: { patientennummer: number }) {
    return new DiagnosenQuery(patientennummer);
  }

  static createTestInstance({
    patientennummer = 1,
  }: { patientennummer?: number } = {}) {
    return DiagnosenQuery.create({ patientennummer });
  }

  readonly patientennummer: number;

  private constructor(patientennummer: number) {
    this.patientennummer = patientennummer;
  }
}

export class DiagnosenQueryResult {
  static create({ diagnosen = [] }: { diagnosen?: Diagnose[] } = {}) {
    diagnosen = diagnosen.map((patient) => Diagnose.create(patient));
    return new DiagnosenQueryResult(diagnosen);
  }

  static createTestInstance({
    diagnosen = [
      Diagnose.createTestInstance({ id: 1 }),
      Diagnose.createTestInstance({
        id: 2,
        datum: "2026-04-30",
        beschreibung: "Zweite Testdiagnose",
      }),
    ],
  }: {
    diagnosen?: Diagnose[];
  } = {}) {
    return DiagnosenQueryResult.create({ diagnosen });
  }

  readonly diagnosen: Diagnose[];

  private constructor(diagnosen: Diagnose[]) {
    this.diagnosen = diagnosen;
  }
}
