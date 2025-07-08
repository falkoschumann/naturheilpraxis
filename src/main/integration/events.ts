// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

import type { CloudEventV1 } from "cloudevents";

export interface PatientAufgenommenData {
  nummer: number;
  nachname: string;
  vorname: string;
  geburtsdatum: string;
  annahmejahr: string;
  praxis: string;
  anrede?: string;
  strasse?: string;
  hausnummer?: string;
  wohnort?: string;
  postleitzahl?: string;
  staat?: string;
  staatsangehoerigkeit?: string;
  titel?: string;
  beruf?: string;
  telefon?: string;
  mobil?: string;
  eMail?: string;
  familienstand?: string;
  partnerVon?: string;
  kindVon?: string;
  memo?: string;
  schluesselworte?: string[];
}

export interface PatientAufgenommen
  extends CloudEventV1<PatientAufgenommenData> {
  id: string;
  type: "de.muspellheim.naturheilpraxis.patient_aufgenommen";
  source: "/naturheilpraxis/patient";
  specversion: "1.0";
  data: PatientAufgenommenData;
}
