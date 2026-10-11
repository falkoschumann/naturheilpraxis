// Copyright (c) 2026 Falko Schumann. MIT license.

import Mustache from "mustache";

import type { RechnungMitVorlage } from "../application/rechnungsdruck-service.ts";
import type { Vorlagenvorschau } from "../application/rechnungsvorlagen-service.ts";
import type { RechnungErmittelnQueryResult } from "../../shared/domain/rechnungsansicht.ts";
import {
  formatDatum,
  formatEuro,
  type Anschrift,
  type Kontakt,
} from "../../shared/domain/value-objects.ts";
import { beispielrechnung } from "./beispielrechnung.ts";
import standardvorlage from "./rechnungsvorlage.html?raw";

export { standardvorlage };

type Rechnung = NonNullable<RechnungErmittelnQueryResult>;

// The data a Rechnungsvorlage refers to with its placeholders, documented in
// the section "Rechnungsvorlage" of docs/README.md. Dates and amounts are
// formatted, because Mustache has no logic to format them.
export type Rechnungsdaten = Readonly<{
  rechnungsnummer?: string;
  rechnungsdatum?: string;
  entwurf: boolean;
  status: Rechnung["status"];
  praxis: Readonly<{
    name: string;
    anschrift: Anschrift;
    kontakt?: Kontakt;
  }>;
  patient: Readonly<{
    patientennummer: number;
    anrede?: string;
    titel?: string;
    vorname: string;
    nachname: string;
    name: string;
    geburtsdatum: string;
    anschrift?: Anschrift;
  }>;
  diagnosetext: string;
  rechnungstext: string;
  positionen: readonly Readonly<{
    datum: string;
    ziffer: string;
    bezeichnung: string;
    anzahl: number;
    einzelbetrag: string;
    betrag: string;
  }>[];
  gesamtbetrag: string;
}>;

export function rechnungsdaten(rechnung: Rechnung): Rechnungsdaten {
  const { praxis, patient } = rechnung;
  return {
    ...(rechnung.rechnungsnummer === undefined
      ? {}
      : { rechnungsnummer: rechnung.rechnungsnummer }),
    ...(rechnung.datum === undefined
      ? {}
      : { rechnungsdatum: formatDatum(rechnung.datum) }),
    entwurf: rechnung.status === "entwurf",
    status: rechnung.status,
    praxis: {
      name: praxis.name,
      anschrift: praxis.anschrift,
      ...(praxis.kontakt === undefined ? {} : { kontakt: praxis.kontakt }),
    },
    patient: {
      patientennummer: patient.patientennummer,
      ...patient.name,
      name: [patient.name.titel, patient.name.vorname, patient.name.nachname]
        .filter(Boolean)
        .join(" "),
      geburtsdatum: formatDatum(patient.geburtsdatum),
      ...(patient.anschrift === undefined
        ? {}
        : { anschrift: patient.anschrift }),
    },
    diagnosetext: rechnung.diagnosetext,
    rechnungstext: rechnung.rechnungstext,
    positionen: rechnung.positionen.map((position) => ({
      datum: formatDatum(position.datum),
      ziffer: position.ziffer,
      bezeichnung: position.bezeichnung,
      anzahl: position.anzahl,
      einzelbetrag: formatEuro(position.einzelbetrag),
      betrag: formatEuro(position.betrag),
    })),
    gesamtbetrag: formatEuro(rechnung.gesamtbetrag),
  };
}

// Fills the placeholders of the Rechnungsvorlage with the data of the
// Rechnung. Mustache escapes the values for HTML. Throws if the Vorlage is not
// valid Mustache.
export function rechnungErzeugen(vorlage: string, rechnung: Rechnung): string {
  return Mustache.render(vorlage, rechnungsdaten(rechnung));
}

// The page the app serves for a Rechnung, with the HTTP status.
export type Rechnungsdokument = Readonly<{ status: number; html: string }>;

// Creates the Rechnung from the Vorlage of its Praxis. Explains on the page
// why the Rechnung could not be created.
export function rechnungsdokument(
  rechnungMitVorlage: RechnungMitVorlage | undefined,
): Rechnungsdokument {
  if (rechnungMitVorlage === undefined) {
    return {
      status: 404,
      html: fehlerseite("Diese Rechnung gibt es nicht (mehr)."),
    };
  }

  return erzeugeDokument(
    rechnungMitVorlage.vorlage,
    rechnungMitVorlage.rechnung,
  );
}

// Shows a Rechnungsvorlage with Beispieldaten and the data of the Praxis.
export function vorschaudokument(
  vorschau: Vorlagenvorschau | undefined,
): Rechnungsdokument {
  if (vorschau === undefined) {
    return {
      status: 404,
      html: fehlerseite(
        "Diese Praxis gibt es nicht (mehr). Bitte laden Sie die Seite neu.",
      ),
    };
  }

  return erzeugeDokument(vorschau.vorlage, beispielrechnung(vorschau.praxis));
}

function erzeugeDokument(
  vorlage: string,
  rechnung: Rechnung,
): Rechnungsdokument {
  try {
    return { status: 200, html: rechnungErzeugen(vorlage, rechnung) };
  } catch {
    return {
      status: 500,
      html: fehlerseite(
        "Die Rechnung konnte nicht aus der Rechnungsvorlage erzeugt werden. Bitte prüfen Sie die Platzhalter der Rechnungsvorlage.",
      ),
    };
  }
}

function fehlerseite(meldung: string): string {
  return `<!doctype html><html lang="de"><meta charset="utf-8"><title>Rechnung</title><p>${meldung}</p></html>`;
}
