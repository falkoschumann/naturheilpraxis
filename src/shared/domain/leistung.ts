// Copyright (c) 2026 Falko Schumann. All rights reserved. MIT license.

import { Währung } from "./waehrung";

export class Leistung {
  static create({
    id,
    praxis,
    patientId,
    rechnungId,
    datum,
    gebührenziffer,
    beschreibung,
    kommentar,
    einzelpreis,
    anzahl,
  }: {
    id?: number;
    praxis: string;
    patientId: number;
    rechnungId?: number;
    datum: Temporal.PlainDate | string;
    gebührenziffer: string;
    beschreibung: string;
    kommentar?: string;
    einzelpreis: Währung | number;
    anzahl: number;
  }) {
    return new Leistung(
      praxis,
      patientId,
      datum,
      gebührenziffer,
      beschreibung,
      einzelpreis,
      anzahl,
      id,
      rechnungId,
      kommentar,
    );
  }

  static createTestInstance({
    id = 1,
    praxis = "Naturheilpraxis",
    patientId = 1,
    rechnungId,
    datum = "2026-04-09",
    gebührenziffer = "1",
    beschreibung = "Eingehende Untersuchung",
    kommentar,
    einzelpreis = Währung.from(1640),
    anzahl = 1,
  }: {
    id?: number;
    praxis?: string;
    patientId?: number;
    rechnungId?: number;
    datum?: Temporal.PlainDate | string;
    gebührenziffer?: string;
    beschreibung?: string;
    kommentar?: string;
    einzelpreis?: Währung;
    anzahl?: number;
  } = {}) {
    return Leistung.create({
      id,
      praxis,
      patientId,
      rechnungId,
      datum,
      gebührenziffer,
      beschreibung,
      kommentar,
      einzelpreis,
      anzahl,
    });
  }

  // id ist ein Pflichtfeld, außer die Leistung ist noch nicht erfasst
  readonly id?: number;
  readonly praxis: string;
  readonly patientId: number;
  readonly rechnungId?: number;
  readonly datum: Temporal.PlainDate;
  readonly gebührenziffer: string;
  readonly beschreibung: string;
  readonly kommentar?: string;
  readonly einzelpreis: Währung;
  readonly anzahl: number;

  constructor(
    praxis: string,
    patientId: number,
    datum: Temporal.PlainDate | string,
    gebührenziffer: string,
    beschreibung: string,
    einzelpreis: Währung | number,
    anzahl: number,
    id?: number,
    rechnungId?: number,
    kommentar?: string,
  ) {
    this.id = id;
    this.praxis = praxis;
    this.patientId = patientId;
    this.rechnungId = rechnungId;
    this.datum = Temporal.PlainDate.from(datum);
    this.gebührenziffer = gebührenziffer;
    this.beschreibung = beschreibung;
    this.kommentar = kommentar;
    this.einzelpreis = Währung.from(einzelpreis);
    this.anzahl = anzahl;
  }
}
