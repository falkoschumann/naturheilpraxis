// Copyright (c) 2026 Falko Schumann. All rights reserved. MIT license.

import { Währung } from "./waehrung";

export class Rechnung {
  static create({
    id,
    praxis,
    nummer,
    datum,
    patientId,
    summe,
    rechnungstext,
    kommentar,
    bezahlt = false,
    gutschrift = false,
  }: {
    id?: number;
    praxis: string;
    nummer?: string;
    datum: Temporal.PlainDate | string;
    patientId: number;
    summe?: Währung | number;
    rechnungstext?: string;
    kommentar?: string;
    bezahlt?: boolean;
    gutschrift?: boolean;
  }) {
    return new Rechnung(
      praxis,
      datum,
      patientId,
      bezahlt,
      gutschrift,
      id,
      nummer,
      rechnungstext,
      kommentar,
      summe,
    );
  }

  static createTestInstance({
    id = 1,
    praxis = "Naturheilpraxis",
    nummer,
    datum = "2026-04-16",
    patientId = 1,
    summe,
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
    summe?: Währung | number;
    rechnungstext?: string;
    kommentar?: string;
    bezahlt?: boolean;
    gutschrift?: boolean;
  } = {}) {
    return Rechnung.create({
      id,
      praxis,
      nummer,
      datum,
      patientId,
      summe,
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
  readonly summe?: Währung;
  readonly rechnungstext?: string;
  readonly kommentar?: string;
  readonly bezahlt: boolean;
  readonly gutschrift: boolean;

  private constructor(
    praxis: string,
    datum: Temporal.PlainDate | string,
    patientId: number,
    bezahlt: boolean,
    gutschrift: boolean,
    id?: number,
    nummer?: string,
    rechnungstext?: string,
    kommentar?: string,
    summe?: Währung | number,
  ) {
    this.id = id;
    this.praxis = praxis;
    this.datum = Temporal.PlainDate.from(datum);
    this.nummer =
      nummer != null
        ? nummer
        : id +
          "/" +
          String(this.datum.year).slice(-2).padStart(2, "0") +
          String(this.datum.month).padStart(2, "0") +
          String(this.datum.day).padStart(2, "0");
    this.patientId = patientId;
    this.summe = summe != null ? Währung.from(summe) : undefined;
    this.rechnungstext = rechnungstext;
    this.kommentar = kommentar;
    this.bezahlt = bezahlt;
    this.gutschrift = gutschrift;
  }
}
