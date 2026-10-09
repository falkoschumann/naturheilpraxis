// Copyright (c) 2026 Falko Schumann. MIT license.

import type { Patientennummer, Rechnungsnummer } from "./value-objects.ts";

// The events of the Abrechnung. The Leistungserbringung consults them already,
// the consistency boundary follows with the Abrechnung.

export type RechnungErstelltEvent = Readonly<{
  type: "rechnung-erstellt";
  data: Readonly<{
    rechnungId: string;
    praxiskuerzel: string;
    patientennummer: Patientennummer;
    diagnosetext: string;
    rechnungstext: string;
    leistungen: readonly string[];
  }>;
}>;

export type RechnungGeaendertEvent = Readonly<{
  type: "rechnung-geaendert";
  data: Readonly<{
    rechnungId: string;
    praxiskuerzel: string;
    diagnosetext: string;
    rechnungstext: string;
    leistungen: readonly string[];
  }>;
}>;

export type EntwurfGeloeschtEvent = Readonly<{
  type: "entwurf-geloescht";
  data: Readonly<{ rechnungId: string }>;
}>;

export type RechnungVersendetEvent = Readonly<{
  type: "rechnung-versendet";
  data: Readonly<{
    rechnungId: string;
    patientennummer: Patientennummer;
    rechnungsnummer: Rechnungsnummer;
    // An ISO date like 2026-09-20.
    datum: string;
  }>;
}>;

export type RechnungBezahltEvent = Readonly<{
  type: "rechnung-bezahlt";
  data: Readonly<{ rechnungId: string }>;
}>;

export type RechnungszahlungZurueckgenommenEvent = Readonly<{
  type: "rechnungszahlung-zurueckgenommen";
  data: Readonly<{ rechnungId: string }>;
}>;

// The Rechnung is a draft again; the event names the freed Rechnungsnummer and
// the former date.
export type RechnungsversandZurueckgenommenEvent = Readonly<{
  type: "rechnungsversand-zurueckgenommen";
  data: Readonly<{
    rechnungId: string;
    patientennummer: Patientennummer;
    rechnungsnummer: Rechnungsnummer;
    datum: string;
  }>;
}>;

export type AbrechnungEvent =
  | RechnungErstelltEvent
  | RechnungGeaendertEvent
  | EntwurfGeloeschtEvent
  | RechnungVersendetEvent
  | RechnungBezahltEvent
  | RechnungszahlungZurueckgenommenEvent
  | RechnungsversandZurueckgenommenEvent;
