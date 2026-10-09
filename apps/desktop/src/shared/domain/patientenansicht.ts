// Copyright (c) 2026 Falko Schumann. MIT license.

import type { Patient } from "./entities.ts";
import type { DomainEvent } from "./events.ts";
import { formatPatientenname, type Patientennummer } from "./value-objects.ts";

// The Patienten by their Patientennummer.
export type Patientenansicht = Readonly<Record<Patientennummer, Patient>>;

export const initialReadModel: Patientenansicht = {};

export type PatientenErmittelnQuery = Readonly<{
  type: "patienten-ermitteln";
  parameters: Readonly<{ suchbegriff?: string }>;
}>;

export type PatientenErmittelnQueryResultItem = Readonly<{
  patientennummer: Patientennummer;
  praxiskuerzel: string;
  aufnahmejahr: number;
  geburtsdatum: string;
  anrede?: string;
  titel?: string;
  vorname: string;
  nachname: string;
  strasse?: string;
  zusatz?: string;
  postleitzahl?: string;
  ort?: string;
  staat?: string;
  telefon?: string;
  mobiltelefon?: string;
  email?: string;
  website?: string;
  beruf?: string;
  familienstand?: string;
  staatsangehoerigkeit?: string;
  notizen?: string;
  partnerVon?: Patientennummer;
  partnerVonName?: string;
  kindVon?: Patientennummer;
  kindVonName?: string;
  schluesselworte?: readonly string[];
}>;

export type PatientenErmittelnQueryResult =
  readonly PatientenErmittelnQueryResultItem[];

export type PatientErmittelnQuery = Readonly<{
  type: "patient-ermitteln";
  parameters: Readonly<{ patientennummer: Patientennummer }>;
}>;

export type PatientErmittelnQueryResult =
  | (Patient & Readonly<{ partnerVonName?: string; kindVonName?: string }>)
  | undefined;

export function project(
  readModel: Patientenansicht,
  event: DomainEvent,
): Patientenansicht {
  switch (event.type) {
    case "patient-aufgenommen":
    case "patientendaten-geaendert":
      return { ...readModel, [event.data.patientennummer]: event.data };
    default:
      return readModel;
  }
}

export function projectAll(
  readModel: Patientenansicht,
  events: readonly DomainEvent[],
): Patientenansicht {
  return events.reduce(project, readModel);
}

export function patientenErmitteln(
  readModel: Patientenansicht,
  query: PatientenErmittelnQuery,
): PatientenErmittelnQueryResult {
  const suchwoerter = suchwoerterAus(query.parameters.suchbegriff ?? "");
  return Object.values(readModel)
    .map(({ name, anschrift, kontakt, ...patient }) => ({
      ...patient,
      ...name,
      ...anschrift,
      ...kontakt,
      ...angehoerigennamen(readModel, patient),
    }))
    .filter((patient) => trifft(patient, suchwoerter))
    .toSorted((a, b) => b.patientennummer - a.patientennummer);
}

export function patientErmitteln(
  readModel: Patientenansicht,
  query: PatientErmittelnQuery,
): PatientErmittelnQueryResult {
  const patient = readModel[query.parameters.patientennummer];
  if (patient === undefined) {
    return undefined;
  }
  return { ...patient, ...angehoerigennamen(readModel, patient) };
}

function angehoerigennamen(
  readModel: Patientenansicht,
  patient: Pick<Patient, "partnerVon" | "kindVon">,
): Readonly<{ partnerVonName?: string; kindVonName?: string }> {
  const partnerVonName = angehoerigenname(readModel, patient.partnerVon);
  const kindVonName = angehoerigenname(readModel, patient.kindVon);
  return {
    ...(partnerVonName === undefined ? {} : { partnerVonName }),
    ...(kindVonName === undefined ? {} : { kindVonName }),
  };
}

function angehoerigenname(
  readModel: Patientenansicht,
  patientennummer?: Patientennummer,
): string | undefined {
  const patient =
    patientennummer === undefined ? undefined : readModel[patientennummer];
  return patient === undefined ? undefined : formatPatientenname(patient);
}

// The words are separated by spaces, a word with spaces is quoted.
function suchwoerterAus(suchbegriff: string): string[] {
  return [...suchbegriff.matchAll(/"([^"]*)"|(\S+)/g)]
    .map(([, zitiert, wort]) => (zitiert ?? wort ?? "").trim().toLowerCase())
    .filter((wort) => wort !== "");
}

// Every word occurs in any of the fields, ignoring case.
function trifft(
  patient: PatientenErmittelnQueryResultItem,
  suchwoerter: readonly string[],
): boolean {
  const felder = Object.values(patient).flatMap((wert) =>
    (Array.isArray(wert) ? wert : [wert]).map((feld) =>
      String(feld).toLowerCase(),
    ),
  );
  return suchwoerter.every((wort) =>
    felder.some((feld) => feld.includes(wort)),
  );
}
