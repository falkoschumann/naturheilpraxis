// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

import { Patient } from "../../src/shared/domain/patient";

import type { CustomerDto } from "./legacy_database_gateway";
import { Temporal } from "@js-temporal/polyfill";

const MIGRATIONSFEHLER = "Migrationsfehler";

export function erstellePatienten(customers: CustomerDto[]) {
  return customers.map((customer) => erstellePatient(customer));
}

function erstellePatient(customer: CustomerDto) {
  // TODO Validiere Daten
  // TODO Prüfe auf leeren Nachname, Vorname, Geburtsdatum, Annahmejahr und Praxis
  // TODO Markiere fehlende Daten mit Schlüsselwort Unvollständig
  // TODO Markiere Fehler mit Schlüsselwort Migrationsfehler
  // TODO Sichere Leerstring-Werte als undefined?

  let notizen = erstelleNotizen(customer);
  const schluesselworte = erstelleSchluesselworte(customer.handlings);

  if (customer.dayOfBirth != null) {
    if (customer.dayOfBirth.trim() === "") {
      customer.dayOfBirth = undefined;
    } else {
      try {
        Temporal.PlainDate.from(customer.dayOfBirth);
      } catch {
        console.warn(
          `  Ungültiges Geburtsdatum für ${customer.surname}, ${customer.forename} (${customer.id}) gefunden: ${customer.dayOfBirth}`,
        );
        customer.dayOfBirth = undefined;
        schluesselworte.push(MIGRATIONSFEHLER, "Geburtsdatum");
        if (notizen.length > 0) {
          notizen += "\n\n";
        }
        notizen += `Ungültiges Geburtsdatum: ${customer.dayOfBirth}`;
      }
    }
  }

  return Patient.create({
    nummer: customer.id,
    nachname: customer.surname,
    vorname: customer.forename,
    geburtsdatum: customer.dayOfBirth,
    annahmejahr: customer.acceptance,
    praxis: customer.agency,
    anrede: customer.title,
    strasse: customer.street,
    wohnort: customer.city,
    postleitzahl: customer.postalCode,
    staat: customer.country,
    staatsangehoerigkeit: customer.citizenship,
    titel: customer.academicTitle,
    beruf: customer.occupation,
    telefon: customer.callNumber,
    mobil: customer.mobilePhone,
    eMail: customer.email,
    familienstand: customer.familyStatus,
    partner: customer.partnerFrom,
    eltern: customer.childFrom,
    // TODO kinder: customer.xxx,
    // TODO geschwister: customer.xxx,
    notizen,
    schluesselworte,
  });
}

function erstelleNotizen(customer: CustomerDto) {
  return customer.memorandum?.trim() ?? "";
}

function erstelleSchluesselworte(value?: string) {
  if (value == null) {
    return [];
  }

  return value.split(",").map((s) => String(s).trim());
}
