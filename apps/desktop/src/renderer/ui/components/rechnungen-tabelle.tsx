// Copyright (c) 2026 Falko Schumann. MIT license.

import { Link } from "react-router";

import type { RechnungenErmittelnQueryResult } from "../../../shared/domain/abrechnungsansicht.ts";
import type { Rechnungsstatus } from "../../../shared/domain/entities.ts";
import { formatDatum } from "../../../shared/domain/value-objects.ts";

const status: Record<Rechnungsstatus, Readonly<{ label: string; className: string }>> = {
  entwurf: { label: "Entwurf", className: "text-bg-secondary" },
  versendet: { label: "Versendet", className: "text-bg-info" },
  bezahlt: { label: "Bezahlt", className: "text-bg-success" },
};

export function RechnungsstatusBadge({ rechnungsstatus }: { rechnungsstatus: Rechnungsstatus }) {
  const { label, className } = status[rechnungsstatus];
  return <span className={`badge ${className}`}>{label}</span>;
}

export function rechnungsstatusLabel(rechnungsstatus: Rechnungsstatus): string {
  return status[rechnungsstatus].label;
}

// The Rechnungen with a link to each one. The column Patient is optional, for
// lists of more than one Patient.
export function RechnungenTabelle({
  rechnungen,
  mitPatient = false,
}: {
  rechnungen: RechnungenErmittelnQueryResult;
  mitPatient?: boolean;
}) {
  if (rechnungen.length === 0) {
    return (
      <div className="text-center text-body-secondary border rounded bg-body p-5">Keine Rechnungen vorhanden.</div>
    );
  }

  return (
    <div className="card shadow-sm">
      <div className="table-responsive">
        <table className="table table-hover align-middle mb-0">
          <thead>
            <tr>
              <th scope="col">Rechnungsnr.</th>
              <th scope="col">Datum</th>
              {mitPatient && <th scope="col">Patient</th>}
              <th scope="col">Diagnose</th>
              <th scope="col">Praxis</th>
              <th scope="col">Status</th>
            </tr>
          </thead>
          <tbody>
            {rechnungen.map((rechnung) => (
              <tr key={rechnung.rechnungId}>
                <td>
                  <Link to={`/rechnungen/${rechnung.rechnungId}`} className="text-decoration-none">
                    {rechnung.rechnungsnummer ?? "Entwurf"}
                  </Link>
                </td>
                <td>{rechnung.datum === undefined ? "–" : formatDatum(rechnung.datum)}</td>
                {mitPatient && <td>{rechnung.patientenname ?? `Nr. ${rechnung.patientennummer}`}</td>}
                <td>{rechnung.diagnosetext}</td>
                <td>
                  <span className="badge rounded-pill bg-primary-subtle text-primary-emphasis border border-primary-subtle">
                    {rechnung.praxiskuerzel}
                  </span>
                </td>
                <td>
                  <RechnungsstatusBadge rechnungsstatus={rechnung.status} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
