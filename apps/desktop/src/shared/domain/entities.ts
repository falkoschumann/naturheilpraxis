// Copyright (c) 2026 Falko Schumann. MIT license.

import type {
  Anschrift,
  Euro,
  Gebuehrenziffer,
  Kontakt,
  Patientennummer,
  Personenname,
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
