// Copyright (c) 2026 Falko Schumann. MIT license.

import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router";

import type { NaturheilpraxisApi } from "../../../../shared/application/naturheilpraxis-api.ts";
import type { PatientMitNichtAbgerechnetenLeistungen } from "../../../../shared/domain/abrechnungsansicht.ts";
import type {
  PatientenErmittelnQueryResult,
  PatientenErmittelnQueryResultItem,
} from "../../../../shared/domain/patientenansicht.ts";
import { formatDatum, formatEuro, type Patientennummer } from "../../../../shared/domain/value-objects.ts";
import {
  createDataTableColumnHelper,
  DataTable,
  textVergleich,
  type Spaltenlayout,
} from "../../components/data-table.tsx";
import { anzahl, SearchField } from "../../components/search-field.tsx";
import { ListHeader, PageHeader } from "../../components/sticky-header.tsx";
import { PatientAufnehmenDialog } from "./patient-aufnehmen-dialog.tsx";

export function PatientenPage({ api }: { api: NaturheilpraxisApi }) {
  const [suchbegriff, setSuchbegriff] = useState("");
  const [patienten, setPatienten] = useState<PatientenErmittelnQueryResult>();
  const [offen, setOffen] = useState<ReadonlyMap<Patientennummer, PatientMitNichtAbgerechnetenLeistungen>>(new Map());
  const [fehler, setFehler] = useState<string>();
  const [aufnehmen, setAufnehmen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    let aktuell = true;
    api.patientenErmitteln({ type: "patienten-ermitteln", parameters: { suchbegriff } }).then(
      (patienten) => {
        if (aktuell) {
          setPatienten(patienten);
        }
      },
      () => {
        if (aktuell) {
          setFehler("Die Patienten konnten nicht geladen werden. Bitte starten Sie die Anwendung neu.");
        }
      },
    );
    return () => {
      aktuell = false;
    };
  }, [api, suchbegriff]);

  // The open Leistungen come from the Abrechnung and are joined by the
  // Patientennummer.
  useEffect(() => {
    let aktuell = true;
    api
      .patientenMitNichtAbgerechnetenLeistungenErmitteln({
        type: "patienten-mit-nicht-abgerechneten-leistungen-ermitteln",
        parameters: {},
      })
      .then(
        (patienten) => {
          if (aktuell) {
            setOffen(new Map(patienten.map((patient) => [patient.patientennummer, patient])));
          }
        },
        () => {
          if (aktuell) {
            setFehler("Die offenen Leistungen konnten nicht geladen werden. Bitte starten Sie die Anwendung neu.");
          }
        },
      );
    return () => {
      aktuell = false;
    };
  }, [api]);

  return (
    <>
      <PageHeader className="d-flex flex-wrap align-items-center justify-content-between gap-2">
        <h1 className="h3 mb-0">Patienten</h1>
        <button type="button" className="btn btn-primary" onClick={() => setAufnehmen(true)}>
          <i className="fa-solid fa-user-plus me-1" aria-hidden="true"></i>
          Patient aufnehmen
        </button>
      </PageHeader>
      {fehler !== undefined && (
        <div className="alert alert-danger" role="alert">
          {fehler}
        </div>
      )}
      <div className="card shadow-sm">
        <ListHeader className="card-body border-bottom rounded-top">
          <SearchField
            label="Patienten durchsuchen"
            placeholder="Suchen nach Name, Patientennummer, Ort oder Schlüsselwort …"
            value={suchbegriff}
            onChange={setSuchbegriff}
            treffer={patienten === undefined ? undefined : anzahl(patienten.length, "Patient", "Patienten")}
          />
        </ListHeader>
        <PatientenTabelle
          patienten={patienten}
          offen={offen}
          laedt={patienten === undefined && fehler === undefined}
          leerHinweis={
            suchbegriff.trim() === ""
              ? "Es ist noch kein Patient aufgenommen. Nehmen Sie mit „Patient aufnehmen“ den ersten Patienten auf."
              : "Kein Patient gefunden. Prüfen Sie die Schreibweise oder nehmen Sie einen neuen Patienten auf."
          }
        />
      </div>
      {aufnehmen && (
        <PatientAufnehmenDialog
          api={api}
          onClose={() => setAufnehmen(false)}
          onAufgenommen={(patientennummer, meldung) => {
            setAufnehmen(false);
            void navigate(`/patienten/${patientennummer}`, { state: { meldung } });
          }}
        />
      )}
    </>
  );
}

type Patient = PatientenErmittelnQueryResultItem;

const spalten = createDataTableColumnHelper<Patient>();

const spaltenlayout: Spaltenlayout = {
  patientennummer: { breite: "8%" },
  name: { breite: "33%" },
  geburtsdatum: { breite: "13%" },
  ort: { breite: "18%" },
  praxiskuerzel: { breite: "8%" },
  offeneLeistungen: { breite: "20%", className: "text-end" },
};

// The newest Patienten come first.
const neuesteZuerst = [{ id: "patientennummer", desc: true }];

function PatientenTabelle({
  patienten,
  offen,
  laedt,
  leerHinweis,
}: {
  patienten: PatientenErmittelnQueryResult | undefined;
  offen: ReadonlyMap<Patientennummer, PatientMitNichtAbgerechnetenLeistungen>;
  laedt: boolean;
  leerHinweis: string;
}) {
  const columns = useMemo(
    () =>
      spalten.columns([
        spalten.accessor("patientennummer", {
          header: "Nr.",
          sortFn: "basic",
          cell: ({ getValue }) => <span className="text-body-secondary">{getValue()}</span>,
        }),
        spalten.accessor((patient) => `${patient.nachname}, ${patient.vorname}`, {
          id: "name",
          header: "Name",
          sortFn: textVergleich(),
          cell: ({ row }) => <Name patient={row.original} />,
        }),
        spalten.accessor("geburtsdatum", {
          header: "Geburtsdatum",
          sortFn: textVergleich(),
          cell: ({ getValue }) => formatDatum(getValue()),
        }),
        spalten.accessor("ort", {
          header: "Ort",
          sortFn: textVergleich(),
          sortUndefined: "last",
          cell: ({ getValue }) => getValue() ?? <span className="text-body-secondary">–</span>,
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
        // Patienten without open Leistungen count as 0 €.
        spalten.accessor((patient) => offen.get(patient.patientennummer)?.betrag.cents ?? 0, {
          id: "offeneLeistungen",
          header: "Offene Leistungen",
          sortFn: "basic",
          cell: ({ row }) => <OffeneLeistungen offen={offen.get(row.original.patientennummer)} />,
        }),
      ]),
    [offen],
  );

  return (
    <DataTable
      columns={columns}
      data={patienten ?? []}
      layout={spaltenlayout}
      getRowId={(patient) => String(patient.patientennummer)}
      initialSorting={neuesteZuerst}
      hinweis={
        laedt ? (
          <span role="status">
            <span className="spinner-border spinner-border-sm me-2" aria-hidden="true"></span>
            Die Patienten werden geladen …
          </span>
        ) : patienten?.length === 0 ? (
          leerHinweis
        ) : undefined
      }
    />
  );
}

function Name({ patient }: { patient: Patient }) {
  return (
    <>
      <Link to={`/patienten/${patient.patientennummer}`} className="fw-semibold text-decoration-none">
        {patient.nachname}, {patient.vorname}
      </Link>
      {patient.schluesselworte?.map((wort) => (
        <span key={wort} className="badge text-bg-light border ms-1">
          {wort}
        </span>
      ))}
    </>
  );
}

function OffeneLeistungen({ offen }: { offen: PatientMitNichtAbgerechnetenLeistungen | undefined }) {
  if (offen === undefined) {
    return <span className="text-body-secondary">–</span>;
  }
  return (
    <>
      {offen.anzahl} · {formatEuro(offen.betrag)}
    </>
  );
}
