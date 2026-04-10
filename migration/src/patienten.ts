// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

import { Temporal } from "@js-temporal/polyfill";

import { Patient } from "../../src/shared/domain/patient";

import type { CustomerDto } from "./legacy_database_gateway";
import { normalisiereNumber, normalisiereString } from "./migration";

export function erstellePatienten(customers: CustomerDto[]): Patient[] {
  return customers.map((customer) => erstellePatient(customer));
}

function erstellePatient(customer: CustomerDto) {
  const nummer = normalisiereNumber(customer.id);
  const nachname = normalisiereString(customer.surname);
  const vorname = normalisiereString(customer.forename);
  const annahmejahr = normalisiereNumber(customer.acceptance);
  const praxis = normalisiereString(customer.agency);
  const anrede = normalisiereString(customer.title);
  const straße = normalisiereString(customer.street);
  const wohnort = normalisiereString(customer.city);
  const postleitzahl = normalisiereString(customer.postalCode);
  const staat = normalisiereString(customer.country);
  const staatsangehörigkeit = normalisiereString(customer.citizenship);
  const titel = normalisiereString(customer.academicTitle);
  const beruf = normalisiereString(customer.occupation);
  const telefon = normalisiereString(customer.callNumber);
  const mobil = normalisiereString(customer.mobilePhone);
  const eMail = normalisiereString(customer.email);
  const familienstand = normalisiereString(customer.familyStatus);
  const partner = normalisiereString(customer.partnerFrom);
  const eltern = normalisiereString(customer.childFrom);
  let notizen = normalisiereString(customer.memorandum);

  const handlings = normalisiereString(customer.handlings);
  let schlüsselworte = erstelleSchlüsselworte(handlings);

  const dayOfBirth = normalisiereString(customer.dayOfBirth);
  const geburtsdatum = erstelleGeburtsdatum({
    dayOfBirth,
    onError: (neueSchlüsselworte) => {
      console.warn(
        `  Ungültiges Geburtsdatum für ${nachname}, ${vorname} (${nummer}) gefunden: ${dayOfBirth}`,
      );
      schlüsselworte = [...schlüsselworte, ...neueSchlüsselworte];
      notizen = ergänzeNotizen(
        notizen,
        `Ungültiges Geburtsdatum: ${dayOfBirth}`,
      );
    },
  });

  let patient = Patient.create({
    nummer,
    nachname,
    vorname,
    geburtsdatum,
    annahmejahr,
    praxis,
    anrede,
    straße,
    wohnort,
    postleitzahl,
    staat,
    staatsangehörigkeit,
    titel,
    beruf,
    telefon,
    mobil,
    eMail,
    familienstand,
    partner,
    eltern,
    // TODO kinder: customer.xxx,
    // TODO geschwister: customer.xxx,
    notizen,
    schlüsselworte,
  });
  prüfeVollständigkeit({
    patient,
    onError: (neueSchlüsselworte, fehlendeDaten) => {
      const fehlendeDatenString = fehlendeDaten.join(", ");
      console.warn(
        `  Unvollständiger Datensatz für ${nachname}, ${vorname} (${nummer}), vermisse ${fehlendeDatenString}`,
      );
      schlüsselworte = [...schlüsselworte, ...neueSchlüsselworte];
      notizen = ergänzeNotizen(
        notizen,
        `Fehlende Daten: ${fehlendeDatenString}.`,
      );
      patient = Patient.create({
        ...patient,
        schlüsselworte: schlüsselworte,
        notizen,
      });
    },
  });
  return patient;
}

function erstelleSchlüsselworte(handlings?: string) {
  if (handlings == null) {
    return [];
  }

  return handlings.split(",").map((s) => String(s).trim());
}

function erstelleGeburtsdatum({
  dayOfBirth,
  onError,
}: {
  dayOfBirth?: string;
  onError: (neueSchlüsselworte: string[]) => void;
}) {
  if (dayOfBirth == null) {
    return;
  }

  try {
    return Temporal.PlainDate.from(dayOfBirth);
  } catch {
    onError(["Migrationsfehler", "Geburtsdatum"]);
    return;
  }
}

function prüfeVollständigkeit({
  patient,
  onError,
}: {
  patient: Patient;
  onError: (neueSchlüsselworte: string[], fehlendeDaten: string[]) => void;
}) {
  const fehlendeDaten: string[] = [];
  if (patient.nachname == null) {
    fehlendeDaten.push("Nachname");
  }
  if (patient.vorname == null) {
    fehlendeDaten.push("Vorname");
  }
  if (patient.geburtsdatum == null) {
    fehlendeDaten.push("Geburtsdatum");
  }
  if (patient.annahmejahr == null) {
    fehlendeDaten.push("Annahmejahr");
  }
  if (patient.praxis == null) {
    fehlendeDaten.push("Paxis");
  }
  if (fehlendeDaten.length > 0) {
    onError(["Migrationsfehler", "Unvollständig"], fehlendeDaten);
  }
}

function ergänzeNotizen(notizen = "", ergänzendeNotizen: string) {
  if (notizen.length > 0) {
    notizen += "\n\n";
  }
  notizen += ergänzendeNotizen;
  return notizen;
}
