// Copyright (c) 2026 Falko Schumann. MIT license.

import { Link } from "react-router";

import type {
  RechnungenErmittelnQueryResult,
  RechnungenErmittelnQueryResultItem,
} from "../../../shared/domain/abrechnungsansicht.ts";
import type { Rechnungsstatus } from "../../../shared/domain/entities.ts";
import { formatDatum, formatEuro } from "../../../shared/domain/value-objects.ts";
import { createDataTableColumnHelper, DataTable, textVergleich, type Spaltenlayout } from "./data-table.tsx";

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

const reihenfolge: Readonly<Record<Rechnungsstatus, number>> = { entwurf: 0, versendet: 1, bezahlt: 2 };

type Rechnung = RechnungenErmittelnQueryResultItem;

const spalten = createDataTableColumnHelper<Rechnung>();

const columns = spalten.columns([
  spalten.accessor("rechnungsnummer", {
    header: "Rechnungsnr.",
    sortFn: textVergleich(),
    sortUndefined: "last",
    cell: ({ row }) => (
      <Link to={`/rechnungen/${row.original.rechnungId}`} className="text-decoration-none">
        {row.original.rechnungsnummer ?? "Entwurf"}
      </Link>
    ),
  }),
  spalten.accessor("datum", {
    header: "Datum",
    sortFn: textVergleich(),
    sortUndefined: "last",
    cell: ({ getValue }) => {
      const datum = getValue();
      return datum === undefined ? "–" : formatDatum(datum);
    },
  }),
  spalten.accessor((rechnung) => patientDer(rechnung), {
    id: "patient",
    header: "Patient",
    sortFn: textVergleich(),
  }),
  spalten.accessor("diagnosetext", {
    header: "Diagnose",
    sortFn: textVergleich(),
  }),
  spalten.accessor("praxiskuerzel", {
    header: "Praxis",
    sortFn: textVergleich(),
    cell: ({ getValue }) => (
      <span className="badge rounded-pill bg-primary-subtle text-primary-emphasis border border-primary-subtle">
        {getValue()}
      </span>
    ),
  }),
  spalten.accessor((rechnung) => reihenfolge[rechnung.status], {
    id: "status",
    header: "Status",
    sortFn: "basic",
    cell: ({ row }) => <RechnungsstatusBadge rechnungsstatus={row.original.status} />,
  }),
  spalten.accessor((rechnung) => rechnung.betrag.cents, {
    id: "betrag",
    header: "Betrag",
    sortFn: "basic",
    cell: ({ row }) => formatEuro(row.original.betrag),
  }),
]);

const ohnePatient = columns.filter((spalte) => spalte.id !== "patient");

const layoutMitPatient: Spaltenlayout = {
  rechnungsnummer: { breite: "14%" },
  datum: { breite: "11%" },
  patient: { breite: "28%" },
  diagnosetext: { breite: "19%" },
  praxiskuerzel: { breite: "9%" },
  status: { breite: "9%" },
  betrag: { breite: "10%", className: "text-end" },
};

const layoutOhnePatient: Spaltenlayout = {
  rechnungsnummer: { breite: "15%" },
  datum: { breite: "13%" },
  diagnosetext: { breite: "39%" },
  praxiskuerzel: { breite: "10%" },
  status: { breite: "11%" },
  betrag: { breite: "12%", className: "text-end" },
};

export function patientDer(rechnung: Rechnung): string {
  return rechnung.patientenname ?? `Nr. ${rechnung.patientennummer}`;
}

// The Rechnungen with a link to each one. The column Patient is optional, for
// lists of more than one Patient. Without a sorting by the user the
// Rechnungen keep their order, the Entwürfe first.
export function RechnungenTabelle({
  rechnungen,
  mitPatient = false,
  leerHinweis = "Keine Rechnungen vorhanden.",
}: {
  rechnungen: RechnungenErmittelnQueryResult;
  mitPatient?: boolean;
  leerHinweis?: string;
}) {
  if (rechnungen.length === 0) {
    return <div className="text-center text-body-secondary border rounded bg-body p-5">{leerHinweis}</div>;
  }

  return (
    <div className="card shadow-sm">
      <DataTable
        columns={mitPatient ? columns : ohnePatient}
        data={rechnungen}
        layout={mitPatient ? layoutMitPatient : layoutOhnePatient}
        getRowId={(rechnung) => rechnung.rechnungId}
      />
    </div>
  );
}
