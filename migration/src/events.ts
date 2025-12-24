// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

import { PatientAufgenommenV1Event } from "../../src/main/infrastructure/events";

import type { CustomerDto } from "./database_provider";
import type { CloudEventV1 } from "cloudevents";

export function createEventsForCustomers(
  customers: CustomerDto[],
): CloudEventV1<unknown>[] {
  const events = [];
  let noOfIssues = 0;
  for (let customer of customers) {
    try {
      customer = tidyUpCustomer(customer);
      const event = PatientAufgenommenV1Event.create({
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
        notizen: customer.memorandum ?? undefined,
        schluesselworte: customer.handlings?.split(",").map((s) => s.trim()),
      });
      events.push(event);
    } catch (error) {
      noOfIssues++;
      console.error("Skip invalid customer:", error, customer);
    }
  }
  console.log("Skipped customers with issues:", noOfIssues);
  return events;
}

function tidyUpCustomer(customer: CustomerDto): CustomerDto {
  try {
    return {
      ...customer,
      id: customer.id,
      surname: tidyUpString(customer.surname),
      forename: tidyUpString(customer.forename),
      dayOfBirth: tidyUpString(customer.dayOfBirth),
      acceptance: tidyUpNumber(customer.acceptance),
      agency: tidyUpString(customer.agency),
      title: tidyUpString(customer.title),
      street: tidyUpString(customer.street),
      city: tidyUpString(customer.city),
      postalCode: tidyUpString(customer.postalCode),
      country: tidyUpString(customer.country),
      citizenship: tidyUpString(customer.citizenship),
      academicTitle: tidyUpString(customer.academicTitle),
      occupation: tidyUpString(customer.occupation),
      callNumber: tidyUpString(customer.callNumber),
      mobilePhone: tidyUpString(customer.mobilePhone),
      email: tidyUpString(customer.email),
      familyStatus: tidyUpString(customer.familyStatus),
      partnerFrom: tidyUpString(customer.partnerFrom),
      childFrom: tidyUpString(customer.childFrom),
    };
  } catch (error) {
    console.error("Error tidying up customer:", customer, error);
    throw error;
  }
}

function tidyUpNumber(value?: number | null): number | undefined {
  if (value == null) {
    return undefined;
  }

  if (isNaN(value)) {
    throw new Error(`Invalid number value: ${value}`);
  }

  return value;
}

function tidyUpString(value?: string | null): string | undefined {
  if (value == null) {
    return undefined;
  }

  const trimmed = String(value).trim();
  if (trimmed.length === 0) {
    return undefined;
  }

  return trimmed;
}
