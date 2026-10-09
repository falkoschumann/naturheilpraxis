// Copyright (c) 2026 Falko Schumann. MIT license.

import { useEffect, useState } from "react";

import type { NaturheilpraxisApi } from "../../../shared/application/naturheilpraxis-api.ts";
import type { RechnungenErmittelnQueryResult } from "../../../shared/domain/abrechnungsansicht.ts";
import type { Rechnungsstatus } from "../../../shared/domain/entities.ts";
import { RechnungenTabelle, rechnungsstatusLabel } from "../components/rechnungen-tabelle.tsx";

const filter: readonly (Rechnungsstatus | "alle")[] = ["alle", "entwurf", "versendet", "bezahlt"];

// All Rechnungen, the Entwürfe first.
export function AbrechnungPage({ api }: { api: NaturheilpraxisApi }) {
  const [rechnungen, setRechnungen] = useState<RechnungenErmittelnQueryResult>();
  const [fehler, setFehler] = useState<string>();
  const [statusFilter, setStatusFilter] = useState<Rechnungsstatus | "alle">("alle");

  useEffect(() => {
    let aktuell = true;
    api.rechnungenErmitteln({ type: "rechnungen-ermitteln", parameters: {} }).then(
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
  }, [api]);

  return (
    <>
      <h1 className="h3 mb-3">Abrechnung</h1>
      <div className="d-flex flex-wrap align-items-center gap-2 mb-2">
        <h2 className="h5 mb-0 me-auto">Rechnungen</h2>
        <div className="btn-group btn-group-sm" role="radiogroup" aria-label="Nach Status filtern">
          {filter.map((status) => (
            <label key={status} className={`btn btn-outline-primary${statusFilter === status ? " active" : ""}`}>
              <input
                type="radio"
                className="btn-check"
                name="status"
                value={status}
                checked={statusFilter === status}
                onChange={() => setStatusFilter(status)}
              />
              {status === "alle" ? "Alle" : rechnungsstatusLabel(status)}
            </label>
          ))}
        </div>
      </div>
      {fehler !== undefined && (
        <div className="alert alert-danger" role="alert">
          {fehler}
        </div>
      )}
      {rechnungen === undefined && fehler === undefined && (
        <p className="text-body-secondary" role="status">
          <span className="spinner-border spinner-border-sm me-2" aria-hidden="true"></span>
          Die Rechnungen werden geladen …
        </p>
      )}
      {rechnungen !== undefined && (
        <RechnungenTabelle
          rechnungen={rechnungen.filter((rechnung) => statusFilter === "alle" || rechnung.status === statusFilter)}
          mitPatient
        />
      )}
    </>
  );
}
