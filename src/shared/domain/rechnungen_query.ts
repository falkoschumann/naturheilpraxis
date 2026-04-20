// Copyright (c) 2026 Falko Schumann. All rights reserved. MIT license.

import { Rechnung } from "./rechnung";

export class RechnungenQuery {
  static create({ patientennummer }: { patientennummer?: number } = {}) {
    return new RechnungenQuery(patientennummer);
  }

  static createTestInstance({
    patientennummer = 1,
  }: { patientennummer?: number } = {}) {
    return RechnungenQuery.create({ patientennummer });
  }

  readonly patientennummer?: number;

  private constructor(patientennummer?: number) {
    this.patientennummer = patientennummer;
  }
}

export class RechnungenQueryResult {
  static create({ rechnungen = [] }: { rechnungen?: Rechnung[] } = {}) {
    rechnungen = rechnungen.map((patient) => Rechnung.create(patient));
    return new RechnungenQueryResult(rechnungen);
  }

  static createTestInstance({
    rechnungen = [
      Rechnung.createTestInstance({ id: 1 }),
      Rechnung.createTestInstance({
        id: 2,
        nummer: "1/260420",
        datum: "2026-04-20",
      }),
    ],
  }: {
    rechnungen?: Rechnung[];
  } = {}) {
    return RechnungenQueryResult.create({ rechnungen });
  }

  readonly rechnungen: Rechnung[];

  private constructor(rechnungen: Rechnung[]) {
    this.rechnungen = rechnungen;
  }
}
