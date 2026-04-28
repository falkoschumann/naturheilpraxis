// Copyright (c) 2026 Falko Schumann. All rights reserved. MIT license.

import type { DiagnosisDto } from "./legacy_database_gateway";
import { normalisiereNumber, normalisiereString } from "./migration";
import { Diagnose } from "../../src/shared/domain/diagnose";

export function erstelleDiagnosen(diagnoses: DiagnosisDto[]): Diagnose[] {
  return diagnoses.map((diagnosis) => erstelleDiagnose(diagnosis));
}

function erstelleDiagnose(diagnosis: DiagnosisDto) {
  const patientId = normalisiereNumber(diagnosis.customerId);
  const datum = normalisiereString(diagnosis.date);
  const beschreibung = normalisiereString(diagnosis.comment);
  const diagnose = prüfeVollständigkeit({
    diagnose: {
      datum,
      patientId,
      beschreibung,
    },
    onError: (fehlendeDaten) => {
      const fehlendeDatenString = fehlendeDaten.join(", ");
      console.warn(
        `  Unvollständiger Datensatz, vermisse ${fehlendeDatenString}`,
      );
    },
  });
  return Diagnose.create(diagnose);
}

function prüfeVollständigkeit({
  diagnose,
  onError,
}: {
  diagnose: {
    patientId?: number;
    datum?: string;
    beschreibung?: string;
  };
  onError: (fehlendeDaten: string[]) => void;
}) {
  const { beschreibung } = diagnose;
  let { datum, patientId } = diagnose;
  const fehlendeDaten: string[] = [];
  if (beschreibung == null) {
    throw new Error("Diagnose hat keine Beschreibung.");
  }
  if (datum == null) {
    fehlendeDaten.push("Datum");
    datum = "1970-01-01";
  }
  if (patientId == null) {
    fehlendeDaten.push("Patient");
    patientId = 1;
  }
  if (fehlendeDaten.length > 0) {
    onError(fehlendeDaten);
  }
  return {
    patientId,
    datum,
    beschreibung,
  };
}
