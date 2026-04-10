// Copyright (c) 2026 Falko Schumann. All rights reserved. MIT license.

import { Leistung } from "./leistung";
import { Währung } from "./waehrung";

export class LeistungenQuery {
  static create({ patientennummer }: { patientennummer: number }) {
    return new LeistungenQuery(patientennummer);
  }

  static createTestInstance({
    patientennummer = 1,
  }: { patientennummer?: number } = {}) {
    return LeistungenQuery.create({ patientennummer });
  }

  readonly patientennummer: number;

  private constructor(patientennummer: number) {
    this.patientennummer = patientennummer;
  }
}

export class LeistungenQueryResult {
  static create({ leistungen = [] }: { leistungen?: Leistung[] } = {}) {
    leistungen = leistungen.map((patient) => Leistung.create(patient));
    return new LeistungenQueryResult(leistungen);
  }

  static createTestInstance({
    leistungen = [
      Leistung.createTestInstance({ id: 1 }),
      Leistung.createTestInstance({
        id: 2,
        gebührenziffer: "21",
        beschreibung: "Akupunktur",
        einzelpreis: Währung.from(1815),
      }),
    ],
  }: {
    leistungen?: Leistung[];
  } = {}) {
    return LeistungenQueryResult.create({ leistungen });
  }

  readonly leistungen: Leistung[];

  private constructor(leistungen: Leistung[]) {
    this.leistungen = leistungen;
  }
}
