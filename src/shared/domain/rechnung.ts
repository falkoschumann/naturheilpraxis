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
    zustand = Rechnungszustand.ERSTELLT,
    nachname,
    vorname,
    geburtsdatum,
  }: {
    id?: number;
    praxis: string;
    nummer?: string;
    datum: Temporal.PlainDate | string;
    patientId: number;
    summe?: Währung | number;
    rechnungstext?: string;
    kommentar?: string;
    zustand?: Rechnungszustand;
    nachname?: string;
    vorname?: string;
    geburtsdatum?: Temporal.PlainDate | string;
  }) {
    return new Rechnung(
      praxis,
      datum,
      patientId,
      zustand,
      id,
      nummer,
      rechnungstext,
      kommentar,
      summe,
      nachname,
      vorname,
      geburtsdatum,
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
    zustand = Rechnungszustand.ERSTELLT,
    nachname,
    vorname,
    geburtsdatum,
  }: {
    id?: number;
    praxis?: string;
    nummer?: string;
    datum?: Temporal.PlainDate | string;
    patientId?: number;
    summe?: Währung | number;
    rechnungstext?: string;
    kommentar?: string;
    zustand?: Rechnungszustand;
    nachname?: string;
    vorname?: string;
    geburtsdatum?: Temporal.PlainDate | string;
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
      zustand,
      nachname,
      vorname,
      geburtsdatum,
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
  readonly zustand: Rechnungszustand;
  readonly nachname?: string;
  readonly vorname?: string;
  readonly geburtsdatum?: Temporal.PlainDate;

  private constructor(
    praxis: string,
    datum: Temporal.PlainDate | string,
    patientId: number,
    zustand: Rechnungszustand,
    id?: number,
    nummer?: string,
    rechnungstext?: string,
    kommentar?: string,
    summe?: Währung | number,
    nachname?: string,
    vorname?: string,
    geburtsdatum?: Temporal.PlainDate | string,
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
    this.zustand = zustand;
    this.nachname = nachname;
    this.vorname = vorname;
    this.geburtsdatum =
      geburtsdatum != null ? Temporal.PlainDate.from(geburtsdatum) : undefined;
  }
}

export const Rechnungszustand = Object.freeze({
  ERSTELLT: "erstellt",
  ABGERECHNET: "abgerechnet",
  BEZAHLT: "bezahlt",
} as const);

export type Rechnungszustand =
  (typeof Rechnungszustand)[keyof typeof Rechnungszustand];
