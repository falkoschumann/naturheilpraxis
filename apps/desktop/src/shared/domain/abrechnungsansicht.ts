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

export function project(
  readModel: Abrechnungsansicht,
  event: DomainEvent,
): Abrechnungsansicht {
  switch (event.type) {
    case "rechnung-erstellt": {
      const { leistungen, ...rechnung } = event.data;
      return setzeRechnung(readModel, {
        ...rechnung,
        leistungen,
        status: "entwurf",
      });
    }
    case "rechnung-geaendert":
      return aendereRechnung(readModel, event.data.rechnungId, event.data);
    case "entwurf-geloescht":
      return {
        ...readModel,
        rechnungen: ohne(readModel.rechnungen, event.data.rechnungId),
      };
    case "rechnung-versendet":
      return aendereRechnung(readModel, event.data.rechnungId, {
        rechnungsnummer: event.data.rechnungsnummer,
        datum: event.data.datum,
        status: "versendet",
      });
    case "rechnung-bezahlt":
      return aendereRechnung(readModel, event.data.rechnungId, {
        status: "bezahlt",
      });
    case "rechnungszahlung-zurueckgenommen":
      return aendereRechnung(readModel, event.data.rechnungId, {
        status: "versendet",
      });
    case "rechnungsversand-zurueckgenommen": {
      const rechnung = readModel.rechnungen[event.data.rechnungId];
      if (rechnung === undefined) {
        return readModel;
      }
      return setzeRechnung(readModel, {
        ...alsEntwurf(rechnung),
        leistungen: rechnung.leistungen,
      });
    }
    case "leistung-erbracht":
    case "leistung-geaendert":
      return {
        ...readModel,
        leistungen: {
          ...readModel.leistungen,
          [event.data.leistungId]: event.data,
        },
      };
    case "leistung-geloescht":
      return {
        ...readModel,
        leistungen: ohne(readModel.leistungen, event.data.leistungId),
      };
    case "patient-aufgenommen":
    case "patientendaten-geaendert": {
      const { patientennummer, name, geburtsdatum } = event.data;
      return {
        ...readModel,
        patienten: {
          ...readModel.patienten,
          [patientennummer]: { patientennummer, name, geburtsdatum },
        },
      };
    }
    default:
      return readModel;
  }
}

export function projectAll(
  readModel: Abrechnungsansicht,
  events: readonly DomainEvent[],
): Abrechnungsansicht {
  return events.reduce(project, readModel);
}

// The oldest first.
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

function setzeRechnung(
  readModel: Abrechnungsansicht,
  rechnung: AbgerechneteRechnung,
): Abrechnungsansicht {
  return {
    ...readModel,
    rechnungen: { ...readModel.rechnungen, [rechnung.rechnungId]: rechnung },
  };
}

function aendereRechnung(
  readModel: Abrechnungsansicht,
  rechnungId: string,
  aenderung: Partial<AbgerechneteRechnung>,
): Abrechnungsansicht {
  const rechnung = readModel.rechnungen[rechnungId];
  return rechnung === undefined
    ? readModel
    : setzeRechnung(readModel, { ...rechnung, ...aenderung });
}

function ohne<T>(
  eintraege: Readonly<Record<string, T>>,
  id: string,
): Readonly<Record<string, T>> {
  return Object.fromEntries(
    Object.entries(eintraege).filter(([key]) => key !== id),
  );
}
