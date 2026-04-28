// Copyright (c) 2026 Falko Schumann. All rights reserved. MIT license.

export class Diagnose {
  static create({
    id,
    datum,
    patientId,
    beschreibung,
  }: {
    id?: number;
    patientId: number;
    datum: Temporal.PlainDate | string;
    beschreibung: string;
  }) {
    return new Diagnose(patientId, datum, beschreibung, id);
  }

  static createTestInstance({
    id = 1,
    patientId = 1,
    datum = "2026-04-16",
    beschreibung = "Testbeschreibung",
  }: {
    id?: number;
    patientId?: number;
    datum?: Temporal.PlainDate | string;
    beschreibung?: string;
  } = {}) {
    return Diagnose.create({
      id,
      patientId,
      datum,
      beschreibung,
    });
  }

  // id ist ein Pflichtfeld, außer die Diagnose ist noch nicht erstellt
  readonly id?: number;
  readonly patientId: number;
  readonly datum: Temporal.PlainDate;
  readonly beschreibung: string;
  private constructor(
    patientId: number,
    datum: Temporal.PlainDate | string,
    beschreibung: string,
    id?: number,
  ) {
    this.id = id;
    this.patientId = patientId;
    this.datum = Temporal.PlainDate.from(datum);
    this.beschreibung = beschreibung;
  }
}
