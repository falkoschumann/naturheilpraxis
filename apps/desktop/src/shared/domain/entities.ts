// Copyright (c) 2026 Falko Schumann. MIT license.

import type {
  Anschrift,
  Euro,
  Gebuehrenziffer,
  Kontakt,
  Patientennummer,
  Personenname,
  Rechnungsnummer,
} from "./value-objects.ts";

export type Praxis = Readonly<{
  praxiskuerzel: string;
  name: string;
  anschrift: Anschrift;
  kontakt?: Kontakt;
  rechnungstext?: string;
}>;

export type Gebuehr = Readonly<{
  ziffer: Gebuehrenziffer;
  bezeichnung: string;
  betrag: Euro;
}>;

export type Patient = Readonly<{
  patientennummer: Patientennummer;
  praxiskuerzel: string;
  aufnahmejahr: number;
  // An ISO date like 1980-09-20.
  geburtsdatum: string;
  name: Personenname;
  anschrift?: Anschrift;
  kontakt?: Kontakt;
  beruf?: string;
  familienstand?: string;
  staatsangehoerigkeit?: string;
  notizen?: string;
  partnerVon?: Patientennummer;
  kindVon?: Patientennummer;
  schluesselworte?: readonly string[];
}>;

export type Diagnose = Readonly<{
  diagnoseId: string;
  praxiskuerzel: string;
  patientennummer: Patientennummer;
  // An ISO date like 2026-09-14.
  datum: string;
  text: string;
}>;

export type Leistung = Readonly<{
  leistungId: string;
  praxiskuerzel: string;
  patientennummer: Patientennummer;
  // An ISO date like 2026-09-14.
  datum: string;
  ziffer: Gebuehrenziffer;
  bezeichnung: string;
  anzahl: number;
  einzelbetrag: Euro;
}>;

export type Rechnungsstatus = "entwurf" | "versendet" | "bezahlt";

// Rechnungsnummer and Datum are given from the dispatch on.
export type Rechnung = Readonly<{
  rechnungId: string;
  praxiskuerzel: string;
  patientennummer: Patientennummer;
  diagnosetext: string;
  rechnungsnummer?: Rechnungsnummer;
  datum?: string;
  rechnungstext: string;
  status: Rechnungsstatus;
}>;

// A Rechnung without Rechnungsnummer and Datum, as before the dispatch.
export function alsEntwurf(rechnung: Rechnung): Rechnung {
  const {
    rechnungId,
    praxiskuerzel,
    patientennummer,
    diagnosetext,
    rechnungstext,
  } = rechnung;
  return {
    rechnungId,
    praxiskuerzel,
    patientennummer,
    diagnosetext,
    rechnungstext,
    status: "entwurf",
  };
}
