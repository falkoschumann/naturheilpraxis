// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

import { Patient } from "../../src/shared/domain/patient";

import type { CustomerDto } from "./legacy_database_gateway";

export function createPatientenFromCustomers(customers: CustomerDto[]) {
  const patienten = customers.map((customer) =>
    createPatientFromCustomer(customer),
  );
  console.log("Anzahl migrierter Patienten:", customers.length);
  return patienten;
}

export function createPatientFromCustomer(customer: CustomerDto) {
  // TODO validate data
  const data = createPatient(customer);
  return Patient.create(data);
}

function createPatient(customer: CustomerDto): Patient {
  // using ! because validation is done later
  return Patient.create({
    nummer: tidyUpNumber(customer.id)!,
    nachname: tidyUpString(customer.surname)!,
    vorname: tidyUpString(customer.forename)!,
    geburtsdatum: tidyUpString(customer.dayOfBirth)!,
    annahmejahr: tidyUpNumber(customer.acceptance)!,
    praxis: tidyUpString(customer.agency)!,
    anrede: tidyUpString(customer.title),
    strasse: tidyUpString(customer.street),
    wohnort: tidyUpString(customer.city),
    postleitzahl: tidyUpString(customer.postalCode),
    staat: tidyUpString(customer.country),
    staatsangehoerigkeit: tidyUpString(customer.citizenship),
    titel: tidyUpString(customer.academicTitle),
    beruf: tidyUpString(customer.occupation),
    telefon: tidyUpString(customer.callNumber),
    mobil: tidyUpString(customer.mobilePhone),
    eMail: tidyUpString(customer.email),
    familienstand: tidyUpString(customer.familyStatus),
    partner: tidyUpString(customer.partnerFrom),
    eltern: tidyUpString(customer.childFrom),
    // TODO kinder: customer.xxx,
    // TODO geschwister: customer.xxx,
    notizen: tidyUpString(customer.memorandum ?? undefined),
    schluesselworte: createArrayFromString(tidyUpString(customer.handlings)),
  });
}

function tidyUpNumber(value?: number | null) {
  if (value == null) {
    return undefined;
  }

  return Number(value);
}

function tidyUpString(value?: string | null) {
  if (value == null) {
    return undefined;
  }

  const trimmed = String(value).trim();
  if (trimmed.length === 0) {
    return undefined;
  }

  return trimmed;
}

function createArrayFromString(value?: string) {
  if (value == null) {
    return undefined;
  }

  return value.split(",").map((s) => String(s).trim());
}
