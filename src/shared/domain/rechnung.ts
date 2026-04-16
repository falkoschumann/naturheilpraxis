// Copyright (c) 2026 Falko Schumann. All rights reserved. MIT license.

export class Rechnung {
  static create({
    id,
    praxis,
    nummer,
    datum,
    patientId,
    rechnungstext,
    kommentar,
    bezahlt = false,
    gutschrift = false,
  }: {
    id?: number;
    praxis: string;
    nummer: string;
    datum: Temporal.PlainDate | string;
    patientId: number;
    rechnungstext?: string;
    kommentar?: string;
    bezahlt?: boolean;
    gutschrift?: boolean;
  }) {
    return new Rechnung(
      praxis,
      nummer,
      datum,
      patientId,
      bezahlt,
      gutschrift,
      id,
      rechnungstext,
      kommentar,
    );
  }

  static createTestInstance({
    id = 1,
    praxis = "Naturheilpraxis",
    nummer = "1/260416",
    datum = "2026-04-16",
    patientId = 1,
    rechnungstext = "Bitte überweisen Sie den obigen Rechnungsbetrag auf das Konto DE84 1022 7075 0900 1170 01.",
    kommentar,
    bezahlt = false,
    gutschrift = false,
  }: {
    id?: number;
    praxis?: string;
    nummer?: string;
    datum?: Temporal.PlainDate | string;
    patientId?: number;
    rechnungstext?: string;
    kommentar?: string;
    bezahlt?: boolean;
    gutschrift?: boolean;
  }) {
    return Rechnung.create({
      id,
      praxis,
      nummer,
      datum,
      patientId,
      rechnungstext,
      kommentar,
      bezahlt,
      gutschrift,
    });
  }

  // id ist ein Pflichtfeld, außer die Rechnung ist noch nicht erstellt
  readonly id?: number;
  readonly praxis: string;
  readonly nummer: string;
  readonly datum: Temporal.PlainDate;
  readonly patientId: number;
  readonly rechnungstext?: string;
  readonly kommentar?: string;
  readonly bezahlt: boolean;
  readonly gutschrift: boolean;

  private constructor(
    praxis: string,
    nummer: string,
    datum: Temporal.PlainDate | string,
    patientId: number,
    bezahlt: boolean,
    gutschrift: boolean,
    id?: number,
    rechnungstext?: string,
    kommentar?: string,
  ) {
    this.id = id;
    this.praxis = praxis;
    this.nummer = nummer;
    this.datum = Temporal.PlainDate.from(datum);
    this.patientId = patientId;
    this.rechnungstext = rechnungstext;
    this.kommentar = kommentar;
    this.bezahlt = bezahlt;
    this.gutschrift = gutschrift;
  }
}
