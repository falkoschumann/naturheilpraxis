// Copyright (c) 2026 Falko Schumann. MIT license.

import type { Praxis } from "../../shared/domain/entities.ts";
import type { RechnungErmittelnQueryResult } from "../../shared/domain/rechnungsansicht.ts";

type Rechnung = NonNullable<RechnungErmittelnQueryResult>;

// Shown if there is no Praxis yet.
const beispielpraxis: Praxis = {
  praxiskuerzel: "BSP",
  name: "Naturheilpraxis Beispiel",
  anschrift: {
    strasse: "Hauptstraße 1",
    postleitzahl: "12345",
    ort: "Musterstadt",
  },
  kontakt: { telefon: "0123 456789", email: "info@example.com" },
};

// A sent Rechnung of a made up Patient from the Praxis, which uses all data a
// Rechnungsvorlage may show.
export function beispielrechnung(praxis: Praxis = beispielpraxis): Rechnung {
  return {
    rechnungId: "00000000-0000-4000-8000-000000000000",
    rechnungsnummer: "1234/260920",
    datum: "2026-09-20",
    status: "versendet",
    praxis: {
      praxiskuerzel: praxis.praxiskuerzel,
      name: praxis.name,
      anschrift: praxis.anschrift,
      ...(praxis.kontakt === undefined ? {} : { kontakt: praxis.kontakt }),
    },
    patient: {
      patientennummer: 1234,
      name: {
        anrede: "Frau",
        titel: "Dr.",
        vorname: "Erika",
        nachname: "Mustermann",
      },
      geburtsdatum: "1964-08-12",
      anschrift: {
        strasse: "Musterweg 7",
        zusatz: "Hinterhaus",
        postleitzahl: "12345",
        ort: "Musterstadt",
      },
    },
    diagnosetext: "Chronische Rückenschmerzen",
    rechnungstext:
      praxis.rechnungstext ??
      "Bitte überweisen Sie den Betrag innerhalb von 14 Tagen.",
    positionen: [
      position("2026-09-01", "1", "Eingehende Untersuchung", 1, 2050),
      position("2026-09-08", "20.1", "Akupunktur", 2, 1530),
      position("2026-09-15", "4", "Beratung, auch telefonisch", 1, 1020),
    ],
    gesamtbetrag: { cents: 2050 + 2 * 1530 + 1020 },
  };
}

function position(
  datum: string,
  ziffer: string,
  bezeichnung: string,
  anzahl: number,
  cents: number,
): Rechnung["positionen"][number] {
  return {
    leistungId: `00000000-0000-4000-8000-00000000000${anzahl}`,
    datum,
    ziffer,
    bezeichnung,
    anzahl,
    einzelbetrag: { cents },
    betrag: { cents: anzahl * cents },
  };
}
