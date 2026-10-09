// Copyright (c) 2026 Falko Schumann. MIT license.

import { useEffect, useState } from "react";

import type { NaturheilpraxisApi } from "../../../shared/application/naturheilpraxis-api.ts";
import type { RechnungenErmittelnQueryResult } from "../../../shared/domain/abrechnungsansicht.ts";
import type { Patientennummer } from "../../../shared/domain/value-objects.ts";
import { RechnungenTabelle } from "../components/rechnungen-tabelle.tsx";

// The tab Rechnungen of the Karteikarte.
export function PatientRechnungen({
  api,
  patientennummer,
}: {
  api: NaturheilpraxisApi;
  patientennummer: Patientennummer;
}) {
  const [rechnungen, setRechnungen] = useState<RechnungenErmittelnQueryResult>();
  const [fehler, setFehler] = useState<string>();

  useEffect(() => {
    let aktuell = true;
    api.rechnungenErmitteln({ type: "rechnungen-ermitteln", parameters: { patientennummer } }).then(
      (rechnungen) => {
        if (aktuell) {
          setRechnungen(rechnungen);
        }
      },
      () => {
        if (aktuell) {
          setFehler("Die Rechnungen konnten nicht geladen werden. Bitte starten Sie die Anwendung neu.");
        }
      },
    );
    return () => {
      aktuell = false;
    };
  }, [api, patientennummer]);

  if (fehler !== undefined) {
    return (
      <div className="alert alert-danger" role="alert">
        {fehler}
      </div>
    );
  }
  if (rechnungen === undefined) {
    return (
      <p className="text-body-secondary" role="status">
        <span className="spinner-border spinner-border-sm me-2" aria-hidden="true"></span>
        Die Rechnungen werden geladen …
      </p>
    );
  }
  return <RechnungenTabelle rechnungen={rechnungen} />;
}
