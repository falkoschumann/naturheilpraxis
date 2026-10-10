// Copyright (c) 2026 Falko Schumann. MIT license.

import {
  alsEntwurf,
  type Leistung,
  type Praxis,
  type Rechnung,
} from "./entities.ts";
import type { DomainEvent } from "./events.ts";
import type {
  Anschrift,
  Euro,
  Kontakt,
  Patientennummer,
  Personenname,
} from "./value-objects.ts";

type Rechnungspraxis = Readonly<{
  praxiskuerzel: string;
  name: string;
  anschrift: Anschrift;
  kontakt?: Kontakt;
}>;

type Rechnungspatient = Readonly<{
  patientennummer: Patientennummer;
  name: Personenname;
  geburtsdatum: string;
  anschrift?: Anschrift;
}>;

// From the dispatch on a Rechnung keeps the state of Praxis, Patient and
// Leistungen at that time, so that a reprint equals the original.
type Stand = Readonly<{
  praxis?: Rechnungspraxis;
  patient?: Rechnungspatient;
  leistungen: readonly Leistung[];
}>;

type GespeicherteRechnung = Readonly<{
  rechnung: Rechnung;
  leistungen: readonly string[];
  beimVersand?: Stand;
}>;

export type Rechnungsansicht = Readonly<{
  praxen: Readonly<Record<string, Rechnungspraxis>>;
  patienten: Readonly<Record<Patientennummer, Rechnungspatient>>;
  leistungen: Readonly<Record<string, Leistung>>;
  rechnungen: Readonly<Record<string, GespeicherteRechnung>>;
}>;

export const initialReadModel: Rechnungsansicht = {
  praxen: {},
  patienten: {},
  leistungen: {},
  rechnungen: {},
};

export type RechnungErmittelnQuery = Readonly<{
  type: "rechnung-ermitteln";
  parameters: Readonly<{ rechnungId: string }>;
}>;

export type Rechnungsposition = Readonly<{
  leistungId: string;
  datum: string;
  ziffer: string;
  bezeichnung: string;
  anzahl: number;
  einzelbetrag: Euro;
  betrag: Euro;
}>;

export type RechnungErmittelnQueryResult =
  | Readonly<{
      rechnungId: string;
      rechnungsnummer?: string;
      datum?: string;
      status: Rechnung["status"];
      praxis: Rechnungspraxis;
      patient: Rechnungspatient;
      diagnosetext: string;
      rechnungstext: string;
      positionen: readonly Rechnungsposition[];
      gesamtbetrag: Euro;
    }>
  | undefined;

// Projecting one event is projecting all events of the list.
export function project(
  readModel: Rechnungsansicht,
  event: DomainEvent,
): Rechnungsansicht {
  return projectAll(readModel, [event]);
}

// The events are applied to a private copy of the read model, so that the
// records are copied once and not for each event.
export function projectAll(
  readModel: Rechnungsansicht,
  events: readonly DomainEvent[],
): Rechnungsansicht {
  const entwurf: Entwurf = {
    praxen: { ...readModel.praxen },
    patienten: { ...readModel.patienten },
    leistungen: { ...readModel.leistungen },
    rechnungen: { ...readModel.rechnungen },
  };
  for (const event of events) {
    anwenden(entwurf, event);
  }
  return entwurf;
}

type Entwurf = {
  praxen: Record<string, Rechnungspraxis>;
  patienten: Record<Patientennummer, Rechnungspatient>;
  leistungen: Record<string, Leistung>;
  rechnungen: Record<string, GespeicherteRechnung>;
};

function anwenden(entwurf: Entwurf, event: DomainEvent): void {
  switch (event.type) {
    case "praxis-angelegt":
    case "praxisdaten-geaendert":
      entwurf.praxen[event.data.praxiskuerzel] = rechnungspraxis(event.data);
      break;
    case "patient-aufgenommen":
    case "patientendaten-geaendert": {
      const { patientennummer, name, geburtsdatum, anschrift } = event.data;
      entwurf.patienten[patientennummer] = {
        patientennummer,
        name,
        geburtsdatum,
        ...(anschrift === undefined ? {} : { anschrift }),
      };
      break;
    }
    case "leistung-erbracht":
    case "leistung-geaendert":
      entwurf.leistungen[event.data.leistungId] = event.data;
      break;
    case "leistung-geloescht":
      delete entwurf.leistungen[event.data.leistungId];
      break;
    case "rechnung-erstellt": {
      const { leistungen, ...rechnung } = event.data;
      entwurf.rechnungen[rechnung.rechnungId] = {
        rechnung: { ...rechnung, status: "entwurf" },
        leistungen,
      };
      break;
    }
    case "rechnung-geaendert": {
      const { leistungen, ...aenderung } = event.data;
      aendereRechnung(entwurf, event.data.rechnungId, (gespeichert) => ({
        rechnung: { ...gespeichert.rechnung, ...aenderung },
        leistungen,
      }));
      break;
    }
    case "entwurf-geloescht":
      delete entwurf.rechnungen[event.data.rechnungId];
      break;
    case "rechnung-versendet":
      aendereRechnung(entwurf, event.data.rechnungId, (gespeichert) => ({
        ...gespeichert,
        rechnung: {
          ...gespeichert.rechnung,
          rechnungsnummer: event.data.rechnungsnummer,
          datum: event.data.datum,
          status: "versendet",
        },
        beimVersand: aktuellerStand(entwurf, gespeichert),
      }));
      break;
    case "rechnung-bezahlt":
      aendereStatus(entwurf, event.data.rechnungId, "bezahlt");
      break;
    case "rechnungszahlung-zurueckgenommen":
      aendereStatus(entwurf, event.data.rechnungId, "versendet");
      break;
    case "rechnungsversand-zurueckgenommen":
      aendereRechnung(entwurf, event.data.rechnungId, (gespeichert) => ({
        rechnung: alsEntwurf(gespeichert.rechnung),
        leistungen: gespeichert.leistungen,
      }));
      break;
  }
}

export function rechnungErmitteln(
  readModel: Rechnungsansicht,
  query: RechnungErmittelnQuery,
): RechnungErmittelnQueryResult {
  const gespeichert = readModel.rechnungen[query.parameters.rechnungId];
  if (gespeichert === undefined) {
    return undefined;
  }
  const { praxis, patient, leistungen } =
    gespeichert.beimVersand ?? aktuellerStand(readModel, gespeichert);
  if (praxis === undefined || patient === undefined) {
    return undefined;
  }

  const { rechnung } = gespeichert;
  const positionen = leistungen
    .toSorted((a, b) => a.datum.localeCompare(b.datum))
    .map(
      ({ leistungId, datum, ziffer, bezeichnung, anzahl, einzelbetrag }) => ({
        leistungId,
        datum,
        ziffer,
        bezeichnung,
        anzahl,
        einzelbetrag,
        betrag: { cents: anzahl * einzelbetrag.cents },
      }),
    );
  return {
    rechnungId: rechnung.rechnungId,
    ...(rechnung.rechnungsnummer === undefined
      ? {}
      : { rechnungsnummer: rechnung.rechnungsnummer }),
    ...(rechnung.datum === undefined ? {} : { datum: rechnung.datum }),
    status: rechnung.status,
    praxis,
    patient,
    diagnosetext: rechnung.diagnosetext,
    rechnungstext: rechnung.rechnungstext,
    positionen,
    gesamtbetrag: {
      cents: positionen.reduce(
        (summe, position) => summe + position.betrag.cents,
        0,
      ),
    },
  };
}

function aktuellerStand(
  readModel: Rechnungsansicht,
  gespeichert: GespeicherteRechnung,
): Stand {
  return {
    praxis: readModel.praxen[gespeichert.rechnung.praxiskuerzel],
    patient: readModel.patienten[gespeichert.rechnung.patientennummer],
    leistungen: gespeichert.leistungen.flatMap((leistungId) => {
      const leistung = readModel.leistungen[leistungId];
      return leistung === undefined ? [] : [leistung];
    }),
  };
}

function rechnungspraxis({
  praxiskuerzel,
  name,
  anschrift,
  kontakt,
}: Praxis): Rechnungspraxis {
  return {
    praxiskuerzel,
    name,
    anschrift,
    ...(kontakt === undefined ? {} : { kontakt }),
  };
}

function aendereRechnung(
  entwurf: Entwurf,
  rechnungId: string,
  aenderung: (gespeichert: GespeicherteRechnung) => GespeicherteRechnung,
): void {
  const gespeichert = entwurf.rechnungen[rechnungId];
  if (gespeichert !== undefined) {
    entwurf.rechnungen[rechnungId] = aenderung(gespeichert);
  }
}

function aendereStatus(
  entwurf: Entwurf,
  rechnungId: string,
  status: Rechnung["status"],
): void {
  aendereRechnung(entwurf, rechnungId, (gespeichert) => ({
    ...gespeichert,
    rechnung: { ...gespeichert.rechnung, status },
  }));
}
