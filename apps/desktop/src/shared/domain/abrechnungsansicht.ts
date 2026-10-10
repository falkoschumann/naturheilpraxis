// Copyright (c) 2026 Falko Schumann. MIT license.

import { alsEntwurf, type Leistung, type Rechnung } from "./entities.ts";
import type { DomainEvent } from "./events.ts";
import {
  formatPatientenname,
  type Patientennummer,
  type Personenname,
} from "./value-objects.ts";

type AbgerechneteRechnung = Rechnung &
  Readonly<{ leistungen: readonly string[] }>;

type Patient = Readonly<{
  patientennummer: Patientennummer;
  name: Personenname;
  geburtsdatum: string;
}>;

// The Rechnungen, Leistungen and Patienten by their ID.
export type Abrechnungsansicht = Readonly<{
  rechnungen: Readonly<Record<string, AbgerechneteRechnung>>;
  leistungen: Readonly<Record<string, Leistung>>;
  patienten: Readonly<Record<Patientennummer, Patient>>;
}>;

export const initialReadModel: Abrechnungsansicht = {
  rechnungen: {},
  leistungen: {},
  patienten: {},
};

export type NichtAbgerechneteLeistungenErmittelnQuery = Readonly<{
  type: "nicht-abgerechnete-leistungen-ermitteln";
  parameters: Readonly<{ patientennummer: Patientennummer }>;
}>;

export type NichtAbgerechneteLeistungenErmittelnQueryResult =
  readonly Leistung[];

export type RechnungenErmittelnQuery = Readonly<{
  type: "rechnungen-ermitteln";
  parameters: Readonly<{ patientennummer?: Patientennummer }>;
}>;

export type RechnungenErmittelnQueryResultItem = Rechnung &
  Readonly<{ patientenname?: string }>;

export type RechnungenErmittelnQueryResult =
  readonly RechnungenErmittelnQueryResultItem[];

// Projecting one event is projecting all events of the list.
export function project(
  readModel: Abrechnungsansicht,
  event: DomainEvent,
): Abrechnungsansicht {
  return projectAll(readModel, [event]);
}

// The events are applied to a private copy of the read model, so that the
// records are copied once and not for each event.
export function projectAll(
  readModel: Abrechnungsansicht,
  events: readonly DomainEvent[],
): Abrechnungsansicht {
  const entwurf: Entwurf = {
    rechnungen: { ...readModel.rechnungen },
    leistungen: { ...readModel.leistungen },
    patienten: { ...readModel.patienten },
  };
  for (const event of events) {
    anwenden(entwurf, event);
  }
  return entwurf;
}

type Entwurf = {
  rechnungen: Record<string, AbgerechneteRechnung>;
  leistungen: Record<string, Leistung>;
  patienten: Record<Patientennummer, Patient>;
};

function anwenden(entwurf: Entwurf, event: DomainEvent): void {
  switch (event.type) {
    case "rechnung-erstellt": {
      const { leistungen, ...rechnung } = event.data;
      entwurf.rechnungen[rechnung.rechnungId] = {
        ...rechnung,
        leistungen,
        status: "entwurf",
      };
      break;
    }
    case "rechnung-geaendert":
      aendereRechnung(entwurf, event.data.rechnungId, event.data);
      break;
    case "entwurf-geloescht":
      delete entwurf.rechnungen[event.data.rechnungId];
      break;
    case "rechnung-versendet":
      aendereRechnung(entwurf, event.data.rechnungId, {
        rechnungsnummer: event.data.rechnungsnummer,
        datum: event.data.datum,
        status: "versendet",
      });
      break;
    case "rechnung-bezahlt":
      aendereRechnung(entwurf, event.data.rechnungId, { status: "bezahlt" });
      break;
    case "rechnungszahlung-zurueckgenommen":
      aendereRechnung(entwurf, event.data.rechnungId, { status: "versendet" });
      break;
    case "rechnungsversand-zurueckgenommen": {
      const rechnung = entwurf.rechnungen[event.data.rechnungId];
      if (rechnung !== undefined) {
        entwurf.rechnungen[rechnung.rechnungId] = {
          ...alsEntwurf(rechnung),
          leistungen: rechnung.leistungen,
        };
      }
      break;
    }
    case "leistung-erbracht":
    case "leistung-geaendert":
      entwurf.leistungen[event.data.leistungId] = event.data;
      break;
    case "leistung-geloescht":
      delete entwurf.leistungen[event.data.leistungId];
      break;
    case "patient-aufgenommen":
    case "patientendaten-geaendert": {
      const { patientennummer, name, geburtsdatum } = event.data;
      entwurf.patienten[patientennummer] = {
        patientennummer,
        name,
        geburtsdatum,
      };
      break;
    }
  }
}

function aendereRechnung(
  entwurf: Entwurf,
  rechnungId: string,
  aenderung: Partial<AbgerechneteRechnung>,
): void {
  const rechnung = entwurf.rechnungen[rechnungId];
  if (rechnung !== undefined) {
    entwurf.rechnungen[rechnungId] = { ...rechnung, ...aenderung };
  }
}

export function nichtAbgerechneteLeistungenErmitteln(
  readModel: Abrechnungsansicht,
  query: NichtAbgerechneteLeistungenErmittelnQuery,
): NichtAbgerechneteLeistungenErmittelnQueryResult {
  const abgerechnet = new Set(
    Object.values(readModel.rechnungen).flatMap(
      (rechnung) => rechnung.leistungen,
    ),
  );
  return Object.values(readModel.leistungen)
    .filter(
      (leistung) =>
        leistung.patientennummer === query.parameters.patientennummer &&
        !abgerechnet.has(leistung.leistungId),
    )
    .toSorted((a, b) => a.datum.localeCompare(b.datum));
}

// The Entwürfe first by Patient, then the other Rechnungen the newest first.
export function rechnungenErmitteln(
  readModel: Abrechnungsansicht,
  query: RechnungenErmittelnQuery,
): RechnungenErmittelnQueryResult {
  const { patientennummer } = query.parameters;
  const rechnungen = Object.values(readModel.rechnungen)
    .filter(
      (rechnung) =>
        patientennummer === undefined ||
        rechnung.patientennummer === patientennummer,
    )
    .map(
      ({
        rechnungId,
        praxiskuerzel,
        patientennummer,
        diagnosetext,
        rechnungsnummer,
        datum,
        rechnungstext,
        status,
      }) => {
        const rechnung = {
          rechnungId,
          praxiskuerzel,
          patientennummer,
          diagnosetext,
          ...(rechnungsnummer === undefined ? {} : { rechnungsnummer }),
          ...(datum === undefined ? {} : { datum }),
          rechnungstext,
          status,
        };
        const patient = readModel.patienten[patientennummer];
        return patient === undefined
          ? rechnung
          : { ...rechnung, patientenname: formatPatientenname(patient) };
      },
    );
  const sortierschluessel = (rechnung: RechnungenErmittelnQueryResultItem) => {
    const patient = readModel.patienten[rechnung.patientennummer];
    return [
      patient?.name.nachname ?? "",
      patient?.name.vorname ?? "",
      String(rechnung.patientennummer).padStart(10, "0"),
    ];
  };
  const entwuerfe = rechnungen
    .filter((rechnung) => rechnung.status === "entwurf")
    .toSorted((a, b) => vergleiche(sortierschluessel(a), sortierschluessel(b)));
  const uebrige = rechnungen
    .filter((rechnung) => rechnung.status !== "entwurf")
    .toSorted((a, b) =>
      vergleiche(
        [b.datum ?? "", b.rechnungsnummer ?? ""],
        [a.datum ?? "", a.rechnungsnummer ?? ""],
      ),
    );
  return [...entwuerfe, ...uebrige];
}

function vergleiche(a: readonly string[], b: readonly string[]): number {
  for (const [index, wert] of a.entries()) {
    const ergebnis = wert.localeCompare(b[index] ?? "", "de", {
      numeric: true,
    });
    if (ergebnis !== 0) {
      return ergebnis;
    }
  }
  return 0;
}
