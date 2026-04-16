// Copyright (c) 2026 Falko Schumann. All rights reserved. MIT license.

import type { ActivityDto } from "./legacy_database_gateway";

import { Leistung } from "../../src/shared/domain/leistung";
import { normalisiereNumber, normalisiereString } from "./migration";

export function erstelleLeistungen(activities: ActivityDto[]): Leistung[] {
  return activities.map((activity) => erstelleLeistung(activity));
}

function erstelleLeistung(activity: ActivityDto) {
  const id = normalisiereNumber(activity.id);
  const praxis = normalisiereString(activity.agency);
  const patientId = normalisiereNumber(activity.customerId);
  const rechnungId = normalisiereNumber(activity.invoiceId);
  const datum = normalisiereString(activity.date);
  const gebührenziffer = normalisiereString(activity.shortNote);
  const beschreibung = normalisiereString(activity.description);
  const kommentar = normalisiereString(activity.comment);
  const amount = normalisiereNumber(activity.amount);
  const einzelpreis = erstelleEinzelpreis(amount);
  const anzahl = normalisiereNumber(activity.quantity);
  const leistung = prüfeVollständigkeit({
    leistung: {
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
    },
    onError: (fehlendeDaten) => {
      const fehlendeDatenString = fehlendeDaten.join(", ");
      console.warn(
        `  Unvollständiger Datensatz für ${id}, vermisse ${fehlendeDatenString}`,
      );
    },
  });
  return Leistung.create(leistung);
}

function erstelleEinzelpreis(amount: number | undefined) {
  if (amount == null) {
    return;
  }

  return Math.round(amount * 100);
}

function prüfeVollständigkeit({
  leistung,
  onError,
}: {
  leistung: {
    id?: number;
    praxis?: string;
    patientId?: number;
    rechnungId?: number;
    datum?: string;
    gebührenziffer?: string;
    beschreibung?: string;
    kommentar?: string;
    einzelpreis?: number;
    anzahl?: number;
  };
  onError: (fehlendeDaten: string[]) => void;
}) {
  const { id, kommentar } = leistung;
  let {
    patientId,
    praxis,
    datum,
    gebührenziffer,
    beschreibung,
    einzelpreis,
    anzahl,
    rechnungId,
  } = leistung;
  const fehlendeDaten: string[] = [];
  if (id == null) {
    throw new Error("Leistung hat keine ID.");
  }
  if (praxis == null) {
    fehlendeDaten.push("Praxis");
    praxis = "N/A";
  }
  if (patientId == null) {
    fehlendeDaten.push("Patient");
    patientId = 1;
  }
  if (datum == null) {
    fehlendeDaten.push("Datum");
    datum = "1970-01-01";
  }
  if (gebührenziffer == null) {
    fehlendeDaten.push("Gebührenziffer");
    gebührenziffer = "N/A";
  }
  if (beschreibung == null) {
    fehlendeDaten.push("Beschreibung");
    beschreibung = "N/A";
  }
  if (einzelpreis == null) {
    fehlendeDaten.push("Einzelpreis");
    einzelpreis = 0;
  }
  if (anzahl == null) {
    fehlendeDaten.push("Anzahl");
    anzahl = 1;
  }
  if (rechnungId === -1) {
    rechnungId = undefined;
  }
  if (fehlendeDaten.length > 0) {
    onError(fehlendeDaten);
  }
  return {
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
  };
}
