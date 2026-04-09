// Copyright (c) 2026 Falko Schumann. All rights reserved. MIT license.

import type { ActivityDto } from "./legacy_database_gateway";

import { Leistung } from "../../src/shared/domain/leistung";
import { normalisiereNumber, normalisiereString } from "./migration";
import { Währung } from "../../src/shared/domain/waehrung";

export function erstelleLeistungen(activities: ActivityDto[]): Leistung[] {
  return activities
    .map((activity) => erstelleLeistung(activity))
    .filter((leistung) => leistung != null);
}

function erstelleLeistung(activity: ActivityDto): Leistung | undefined {
  const id = normalisiereNumber(activity.id);
  const praxis = normalisiereString(activity.agency);
  const patientId = normalisiereNumber(activity.customerId);
  const rechnungId = normalisiereNumber(activity.invoiceId);
  const datum = normalisiereString(activity.date);
  const gebührenziffer = normalisiereString(activity.shortNote);
  const beschreibung = normalisiereString(activity.description);
  const kommentar = normalisiereString(activity.comment);
  const einzelpreis = normalisiereNumber(activity.amount);
  const anzahl = normalisiereNumber(activity.quantity);
  let result;
  prüfeVollständigkeit({
    leistung: {
      id,
      praxis,
      patientId,
      datum,
      gebührenziffer,
      beschreibung,
      einzelpreis,
      anzahl,
    },
    onVollständig: (leistung) => {
      const einzelpreis = erstelleEinzelpreis(leistung.einzelpreis);
      result = Leistung.create({
        ...leistung,
        einzelpreis,
        rechnungId,
        kommentar,
      });
    },
    onError: (fehlendeDaten) => {
      const fehlendeDatenString = fehlendeDaten.join(", ");
      console.warn(
        `  Unvollständiger Datensatz für ${id}, vermisse ${fehlendeDatenString}`,
      );
    },
  });
  return result;
}

function prüfeVollständigkeit({
  leistung,
  onVollständig,
  onError,
}: {
  leistung: {
    id?: number;
    praxis?: string;
    patientId?: number;
    datum?: string;
    gebührenziffer?: string;
    beschreibung?: string;
    einzelpreis?: number;
    anzahl?: number;
  };
  onVollständig: (leistung: {
    id: number;
    praxis: string;
    patientId: number;
    datum: string;
    gebührenziffer: string;
    beschreibung: string;
    einzelpreis: number;
    anzahl: number;
  }) => void;
  onError: (fehlendeDaten: string[]) => void;
}) {
  const { id, praxis, patientId, datum, gebührenziffer } = leistung;
  let { beschreibung, einzelpreis, anzahl } = leistung;
  const fehlendeDaten: string[] = [];
  if (id == null) {
    fehlendeDaten.push("ID");
  }
  if (praxis == null) {
    fehlendeDaten.push("Praxis");
  }
  if (patientId == null) {
    fehlendeDaten.push("Patient");
  }
  if (datum == null) {
    fehlendeDaten.push("Datum");
  }
  if (gebührenziffer == null) {
    fehlendeDaten.push("Gebührenziffer");
  }
  if (beschreibung == null) {
    beschreibung = "";
  }
  if (einzelpreis == null) {
    einzelpreis = 0;
  }
  if (anzahl == null) {
    anzahl = 1;
  }
  if (fehlendeDaten.length > 0) {
    onError(fehlendeDaten);
  } else {
    onVollständig({
      id: id!,
      praxis: praxis!,
      patientId: patientId!,
      datum: datum!,
      gebührenziffer: gebührenziffer!,
      beschreibung,
      einzelpreis,
      anzahl,
    });
  }
}

function erstelleEinzelpreis(amount: number) {
  return Währung.from(Math.round(amount * 100));
}
