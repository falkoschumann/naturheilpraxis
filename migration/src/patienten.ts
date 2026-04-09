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
  const strasse = normalisiereString(customer.street);
  const wohnort = normalisiereString(customer.city);
  const postleitzahl = normalisiereString(customer.postalCode);
  const staat = normalisiereString(customer.country);
  const staatsangehoerigkeit = normalisiereString(customer.citizenship);
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
  let schluesselworte = erstelleSchluesselworte(handlings);

  const dayOfBirth = normalisiereString(customer.dayOfBirth);
  const geburtsdatum = erstelleGeburtsdatum({
    dayOfBirth,
    onError: (neueSchluesselworte) => {
      console.warn(
        `  Ungültiges Geburtsdatum für ${nachname}, ${vorname} (${nummer}) gefunden: ${dayOfBirth}`,
      );
      schluesselworte = [...schluesselworte, ...neueSchluesselworte];
      notizen = ergaenzeNotizen(
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
    strasse,
    wohnort,
    postleitzahl,
    staat,
    staatsangehoerigkeit,
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
    schluesselworte,
  });
  pruefeVollstaendigkeit({
    patient,
    onError: (neueSchluesselworte, fehlendeDaten) => {
      const fehlendeDatenString = fehlendeDaten.join(", ");
      console.warn(
        `  Unvollständiger Datensatz für ${nachname}, ${vorname} (${nummer}), vermisse ${fehlendeDatenString}`,
      );
      schluesselworte = [...schluesselworte, ...neueSchluesselworte];
      notizen = ergaenzeNotizen(
        notizen,
        `Fehlende Daten: ${fehlendeDatenString}.`,
      );
      patient = Patient.create({ ...patient, schluesselworte, notizen });
    },
  });
  return patient;
}

function erstelleSchluesselworte(handlings?: string) {
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
  onError: (neueSchluesselworte: string[]) => void;
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

function pruefeVollstaendigkeit({
  patient,
  onError,
}: {
  patient: Patient;
  onError: (neueSchluesselworte: string[], fehlendeDaten: string[]) => void;
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

function ergaenzeNotizen(notizen = "", ergaenzendeNotizen: string) {
  if (notizen.length > 0) {
    notizen += "\n\n";
  }
  notizen += ergaenzendeNotizen;
  return notizen;
}
