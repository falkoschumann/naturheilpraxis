// Copyright (c) 2026 Falko Schumann. MIT license.

import { fail, ok, type Rejection, type Result } from "./result.ts";

export type Anschrift = Readonly<{
  strasse: string;
  zusatz?: string;
  postleitzahl: string;
  ort: string;
  staat?: string;
}>;

export type Kontakt = Readonly<{
  telefon?: string;
  mobiltelefon?: string;
  email?: string;
  website?: string;
}>;

export type Personenname = Readonly<{
  anrede?: string;
  titel?: string;
  vorname: string;
  nachname: string;
}>;

// A consecutive number from 1 that identifies a Patient across all Praxen.
export type Patientennummer = number;

// Like "1234/260920" from Patientennummer and Rechnungsdatum, with "-2" and so
// on for further Rechnungen of the Patient on the same day.
export type Rechnungsnummer = string;

// The amount in the smallest unit of the currency avoids rounding errors.
export type Euro = Readonly<{
  cents: number;
}>;

export type Gebuehrenziffer = string;

export function pruefeEuro(euro: Euro): Result<Euro, Rejection> {
  if (euro.cents < 0) {
    return fail({
      invariant: "betrag-ist-nicht-negativ",
      message:
        "Der Betrag darf nicht negativ sein. Bitte geben Sie einen Betrag ab 0,00 € an.",
    });
  }
  return ok(euro);
}

const euroFormat = new Intl.NumberFormat("de-DE", {
  style: "currency",
  currency: "EUR",
});

export function formatEuro(euro: Euro): string {
  return euroFormat.format(euro.cents / 100);
}

// Shows an amount without currency sign like "1234,56", as it is typed.
export function formatEuroEingabe(euro: Euro): string {
  return (euro.cents / 100).toFixed(2).replace(".", ",");
}

// Reads an amount in German notation like "1.234,56 €". The dot only groups
// thousands, so "20.50" is no amount.
export function parseEuro(text: string): Euro | undefined {
  const match = /^(\d+|\d{1,3}(?:\.\d{3})+)(?:,(\d{1,2}))?$/.exec(
    text.replace(/\s|€/g, ""),
  );
  if (match === null) {
    return undefined;
  }

  const [, euros = "0", cents = ""] = match;
  return {
    cents:
      Number(euros.replaceAll(".", "")) * 100 + Number(cents.padEnd(2, "0")),
  };
}

// Shows an ISO date like 1980-09-20 as 20.09.1980.
export function formatDatum(isoDatum: string): string {
  const [jahr, monat, tag] = isoDatum.split("-");
  return `${tag}.${monat}.${jahr}`;
}

// Like "Mustermann, Max (Nr. 1234), geboren am 20.09.1980".
export function formatPatientenname(
  patient: Readonly<{
    patientennummer: Patientennummer;
    name: Personenname;
    geburtsdatum: string;
  }>,
): string {
  return `${patient.name.nachname}, ${patient.name.vorname} (Nr. ${patient.patientennummer}), geboren am ${formatDatum(patient.geburtsdatum)}`;
}
