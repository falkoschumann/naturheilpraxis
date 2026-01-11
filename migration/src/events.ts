// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

import type { ErrorObject } from "ajv";

import type { Einstellungen } from "../../src/shared/domain/einstellungen";
import {
  type PatientAufgenommenV1Data,
  PatientAufgenommenV1Event,
} from "../../src/main/domain/patient_events";

import type { CustomerDto } from "./database_provider";

const PRUEFUNG_ERFORDERLICH = "Prüfung erforderlich";
const FELD_NICHT_AUSGEFUELLT = "Feld nicht ausgefüllt";
const UNGUELTIGER_WERT = "Ungültiger Wert";

export function erzeugeEventsFuerPatienten(
  customers: CustomerDto[],
  einstellungen: Einstellungen,
): PatientAufgenommenV1Event[] {
  const events = customers.map((customer) =>
    erzeugeEventFuerPatient(customer, einstellungen),
  );
  const noOfIssues = events.filter((event) =>
    event.data?.schluesselworte?.includes(PRUEFUNG_ERFORDERLICH),
  ).length;
  console.log("Anzahl migrierter Patienten:", customers.length);
  console.log("Anzahl Patienten mit Fehler:", noOfIssues);
  return events;
}

export function erzeugeEventFuerPatient(
  customer: CustomerDto,
  einstellungen: Einstellungen,
): PatientAufgenommenV1Event {
  let data = createPatientAufgenommenV1Data(customer);
  try {
    return PatientAufgenommenV1Event.create(data);
  } catch (error) {
    data = handleError(error, data, einstellungen);
    return PatientAufgenommenV1Event.create(data);
  }
}

function createPatientAufgenommenV1Data(
  customer: CustomerDto,
): PatientAufgenommenV1Data {
  // using ! because validation is done later
  return {
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
  };
}

function handleError(
  error: unknown,
  data: PatientAufgenommenV1Data,
  einstellungen: Einstellungen,
): PatientAufgenommenV1Data {
  if (error instanceof TypeError) {
    return handleTypeError(error, data, einstellungen);
  } else {
    throw new Error(`Patient ${data.nummer} kann nicht migriert werden.`, {
      cause: error,
    });
  }
}

function tidyUpNumber(value?: number | null): number | undefined {
  if (value == null) {
    return undefined;
  }

  return Number(value);
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

function createArrayFromString(value?: string): string[] | undefined {
  if (value == null) {
    return undefined;
  }

  return value.split(",").map((s) => String(s).trim());
}

function handleTypeError(
  error: TypeError,
  data: PatientAufgenommenV1Data,
  einstellungen: Einstellungen,
): PatientAufgenommenV1Data {
  // TODO entferne ungültiges Attribut

  if (data.schluesselworte == null) {
    data = { ...data, schluesselworte: [] };
  }
  data.schluesselworte!.push(PRUEFUNG_ERFORDERLICH);

  const errors = error.cause as ErrorObject[];
  console.error(
    `Der Patient ${data.nachname}, ${data.vorname} (${data.nummer}), geboren am ${data.geburtsdatum} enthält ${errors.length} Fehler:`,
  );
  for (const err of errors) {
    let key: keyof PatientAufgenommenV1Data;
    let message;
    switch (err.keyword) {
      case "format":
        key = err.instancePath.substring(1) as keyof PatientAufgenommenV1Data;
        message = `Das Feld "${err.instancePath}" hat einen ungültigen Wert: "${data[key]}" passt nicht zum Format "${err.params.format}".`;
        data.schluesselworte!.push(UNGUELTIGER_WERT);
        break;
      case "pattern":
        key = err.instancePath.substring(1) as keyof PatientAufgenommenV1Data;
        message = `Das Feld "${err.instancePath}" hat einen ungültigen Wert: "${data[key]}" passt nicht zum regulären Ausdruck "${err.params.pattern}".`;
        data.schluesselworte!.push(UNGUELTIGER_WERT);
        break;
      case "required":
        key = err.params.missingProperty;
        message = `Ein erforderliches Feld ist nicht ausgefüllt: "${key}".`;
        data.schluesselworte!.push(FELD_NICHT_AUSGEFUELLT);
        break;
      default:
        throw new Error(`Patient ${data.nummer} kann nicht migriert werden.`, {
          cause: error,
        });
    }
    const value = defaultFuertFeld(key, einstellungen);
    console.error("  - " + message + ` Setze Standardwert: "${value}".`);
    data = {
      ...data,
      [key]: value,
      notizen: (data.notizen == null ? "" : "\n") + message,
    };
  }
  return data;
}

const DEFAULT_STRING = "N/A";
const DEFAULT_DATE = "1900-01-01";
const DEFAULT_YEAR = 1900;

function defaultFuertFeld(
  key: keyof PatientAufgenommenV1Data,
  einstellungen: Einstellungen,
) {
  switch (key) {
    case "nachname":
    case "vorname":
      return DEFAULT_STRING;
    case "geburtsdatum":
      return DEFAULT_DATE;
    case "annahmejahr":
      return DEFAULT_YEAR;
    case "praxis":
      return einstellungen.praxis[0];
    default:
      return undefined;
  }
}
