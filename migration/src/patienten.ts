// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

import { Patient } from "../../src/shared/domain/patient";

import type { CustomerDto } from "./legacy_database_gateway";
import { Temporal } from "@js-temporal/polyfill";

const MIGRATIONSFEHLER = "Migrationsfehler";

export function erstellePatienten(customers: CustomerDto[]) {
  return customers.map((customer) => {
    return erstellePatient(customer);
  });
}

function erstellePatient(customer: CustomerDto) {
  // TODO Prüfe auf leeren Nachname, Vorname, Geburtsdatum, Annahmejahr und Praxis
  // TODO Markiere fehlende Daten mit Schlüsselwort Unvollständig
  // TODO Markiere Fehler mit Schlüsselwort Migrationsfehler

  let notizen = erstelleNotizen(customer);
  let schluesselworte = erstelleSchluesselworte(customer);
  const geburtsdatum = erstelleGeburtsdatum(customer, {
    onError: (neueSchluesselworte, ergaenzendeNotizen) => {
      schluesselworte = [...schluesselworte, ...neueSchluesselworte];
      notizen = ergaenzeNotizen(notizen, ergaenzendeNotizen);
    },
  });

  return Patient.create({
    nummer: normalisiereNumber(customer.id),
    nachname: normalisiereString(customer.surname),
    vorname: normalisiereString(customer.forename),
    geburtsdatum,
    annahmejahr: normalisiereNumber(customer.acceptance),
    praxis: normalisiereString(customer.agency),
    anrede: normalisiereString(customer.title),
    strasse: normalisiereString(customer.street),
    wohnort: normalisiereString(customer.city),
    postleitzahl: normalisiereString(customer.postalCode),
    staat: normalisiereString(customer.country),
    staatsangehoerigkeit: normalisiereString(customer.citizenship),
    titel: normalisiereString(customer.academicTitle),
    beruf: normalisiereString(customer.occupation),
    telefon: normalisiereString(customer.callNumber),
    mobil: normalisiereString(customer.mobilePhone),
    eMail: normalisiereString(customer.email),
    familienstand: normalisiereString(customer.familyStatus),
    partner: normalisiereString(customer.partnerFrom),
    eltern: normalisiereString(customer.childFrom),
    // TODO kinder: customer.xxx,
    // TODO geschwister: customer.xxx,
    notizen,
    schluesselworte,
  });
}

function erstelleNotizen(customer: CustomerDto) {
  return normalisiereString(customer.memorandum) ?? "";
}

function erstelleSchluesselworte(customer: CustomerDto) {
  const handlings = normalisiereString(customer.handlings);
  if (handlings == null) {
    return [];
  }

  return handlings.split(",").map((s) => String(s).trim());
}

function erstelleGeburtsdatum(
  customer: CustomerDto,
  {
    onError,
  }: {
    onError: (
      neueSchluesselworte: string[],
      ergaenzendeNotizen: string,
    ) => void;
  },
) {
  const dayOfBirth = normalisiereString(customer.dayOfBirth);
  if (dayOfBirth == null) {
    return;
  }

  try {
    return Temporal.PlainDate.from(dayOfBirth);
  } catch {
    console.warn(
      `  Ungültiges Geburtsdatum für ${customer.surname}, ${customer.forename} (${customer.id}) gefunden: ${customer.dayOfBirth}`,
    );
    onError(
      [MIGRATIONSFEHLER, "Geburtsdatum"],
      `Ungültiges Geburtsdatum: ${customer.dayOfBirth}`,
    );
    return;
  }
}

function ergaenzeNotizen(notizen: string, ergaenzendeNotizen: string) {
  if (notizen.length > 0) {
    notizen += "\n\n";
  }
  notizen += ergaenzendeNotizen;
  return notizen;
}

function normalisiereNumber(wert?: number): number | undefined {
  wert = wert && Number(wert);
  if (wert == null) {
    return;
  }

  return wert;
}

function normalisiereString(wert?: string): string | undefined {
  wert = wert && String(wert).trim();
  if (wert == null || wert.length === 0) {
    return;
  }

  return wert.trim();
}
