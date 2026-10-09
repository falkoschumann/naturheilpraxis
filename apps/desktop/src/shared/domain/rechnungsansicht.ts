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

export function project(
  readModel: Rechnungsansicht,
  event: DomainEvent,
): Rechnungsansicht {
  switch (event.type) {
    case "praxis-angelegt":
    case "praxisdaten-geaendert":
      return {
        ...readModel,
        praxen: {
          ...readModel.praxen,
          [event.data.praxiskuerzel]: rechnungspraxis(event.data),
        },
      };
    case "patient-aufgenommen":
    case "patientendaten-geaendert": {
      const { patientennummer, name, geburtsdatum, anschrift } = event.data;
      const patient = {
        patientennummer,
        name,
        geburtsdatum,
        ...(anschrift === undefined ? {} : { anschrift }),
      };
      return {
        ...readModel,
        patienten: { ...readModel.patienten, [patientennummer]: patient },
      };
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
    case "rechnung-erstellt": {
      const { leistungen, ...rechnung } = event.data;
      return setzeRechnung(readModel, {
        rechnung: { ...rechnung, status: "entwurf" },
        leistungen,
      });
    }
    case "rechnung-geaendert": {
      const { leistungen, ...aenderung } = event.data;
      return aendereRechnung(
        readModel,
        event.data.rechnungId,
        (gespeichert) => ({
          rechnung: { ...gespeichert.rechnung, ...aenderung },
          leistungen,
        }),
      );
    }
    case "entwurf-geloescht":
      return {
        ...readModel,
        rechnungen: ohne(readModel.rechnungen, event.data.rechnungId),
      };
    case "rechnung-versendet":
      return aendereRechnung(
        readModel,
        event.data.rechnungId,
        (gespeichert) => ({
          ...gespeichert,
          rechnung: {
            ...gespeichert.rechnung,
            rechnungsnummer: event.data.rechnungsnummer,
            datum: event.data.datum,
            status: "versendet",
          },
          beimVersand: aktuellerStand(readModel, gespeichert),
        }),
      );
    case "rechnung-bezahlt":
      return aendereStatus(readModel, event.data.rechnungId, "bezahlt");
    case "rechnungszahlung-zurueckgenommen":
      return aendereStatus(readModel, event.data.rechnungId, "versendet");
    case "rechnungsversand-zurueckgenommen":
      return aendereRechnung(
        readModel,
        event.data.rechnungId,
        (gespeichert) => ({
          rechnung: alsEntwurf(gespeichert.rechnung),
          leistungen: gespeichert.leistungen,
        }),
      );
    default:
      return readModel;
  }
}

export function projectAll(
  readModel: Rechnungsansicht,
  events: readonly DomainEvent[],
): Rechnungsansicht {
  return events.reduce(project, readModel);
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

function setzeRechnung(
  readModel: Rechnungsansicht,
  gespeichert: GespeicherteRechnung,
): Rechnungsansicht {
  return {
    ...readModel,
    rechnungen: {
      ...readModel.rechnungen,
      [gespeichert.rechnung.rechnungId]: gespeichert,
    },
  };
}

function aendereRechnung(
  readModel: Rechnungsansicht,
  rechnungId: string,
  aenderung: (gespeichert: GespeicherteRechnung) => GespeicherteRechnung,
): Rechnungsansicht {
  const gespeichert = readModel.rechnungen[rechnungId];
  return gespeichert === undefined
    ? readModel
    : setzeRechnung(readModel, aenderung(gespeichert));
}

function aendereStatus(
  readModel: Rechnungsansicht,
  rechnungId: string,
  status: Rechnung["status"],
): Rechnungsansicht {
  return aendereRechnung(readModel, rechnungId, (gespeichert) => ({
    ...gespeichert,
    rechnung: { ...gespeichert.rechnung, status },
  }));
}

function ohne<T>(
  eintraege: Readonly<Record<string, T>>,
  id: string,
): Readonly<Record<string, T>> {
  return Object.fromEntries(
    Object.entries(eintraege).filter(([key]) => key !== id),
  );
}
