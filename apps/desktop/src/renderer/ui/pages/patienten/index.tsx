// Copyright (c) 2026 Falko Schumann. MIT license.

import { createColumnHelper, tableFeatures, useTable } from "@tanstack/react-table";
import { useWindowVirtualizer } from "@tanstack/react-virtual";
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router";

import type { NaturheilpraxisApi } from "../../../../shared/application/naturheilpraxis-api.ts";
import type { PatientMitNichtAbgerechnetenLeistungen } from "../../../../shared/domain/abrechnungsansicht.ts";
import type {
  PatientenErmittelnQueryResult,
  PatientenErmittelnQueryResultItem,
} from "../../../../shared/domain/patientenansicht.ts";
import { formatDatum, formatEuro, type Patientennummer } from "../../../../shared/domain/value-objects.ts";
import { ListHeader, PageHeader } from "../../components/sticky-header.tsx";
import { PatientAufnehmenDialog } from "./patient-aufnehmen-dialog.tsx";

export function PatientenPage({ api }: { api: NaturheilpraxisApi }) {
  const [suchbegriff, setSuchbegriff] = useState("");
  const [patienten, setPatienten] = useState<PatientenErmittelnQueryResult>();
  const [offen, setOffen] = useState<ReadonlyMap<Patientennummer, PatientMitNichtAbgerechnetenLeistungen>>(new Map());
  const [fehler, setFehler] = useState<string>();
  const [aufnehmen, setAufnehmen] = useState(false);
  const suche = useRef<HTMLInputElement>(null);
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

  // "/" focuses the search, like in many list views.
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      const target = event.target as HTMLElement | null;
      if (event.key === "/" && target?.closest("input, textarea, select, dialog") == null) {
        event.preventDefault();
        suche.current?.focus();
      }
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

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
          <label htmlFor="patienten-suche" className="visually-hidden">
            Patienten durchsuchen
          </label>
          <div className="input-group">
            <span className="input-group-text">
              <i className="fa-solid fa-magnifying-glass" aria-hidden="true"></i>
            </span>
            <input
              ref={suche}
              id="patienten-suche"
              type="search"
              className="form-control"
              placeholder="Suchen nach Name, Patientennummer, Ort oder Schlüsselwort …"
              autoComplete="off"
              value={suchbegriff}
              onChange={(event) => setSuchbegriff(event.target.value)}
              aria-describedby="patienten-suche-hilfe"
            />
            <span className="input-group-text small text-body-secondary">
              <kbd>/</kbd>
            </span>
          </div>
          <div className="form-text d-flex justify-content-between gap-3">
            <span id="patienten-suche-hilfe">
              Alle Wörter müssen vorkommen. Setzen Sie Wörter mit Leerzeichen in Anführungszeichen, z. B. "Lindenweg 5".
            </span>
            <span className="text-nowrap" aria-live="polite">
              {patienten !== undefined && anzahlPatienten(patienten.length)}
            </span>
          </div>
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

function anzahlPatienten(anzahl: number): string {
  return `${anzahl.toLocaleString("de-DE")} ${anzahl === 1 ? "Patient" : "Patienten"}`;
}

type Patient = PatientenErmittelnQueryResultItem;

const features = tableFeatures({});
const spalten = createColumnHelper<typeof features, Patient>();

// The column widths stay the same while other rows become visible.
const spaltenlayout: Readonly<Record<string, Readonly<{ breite: string; className?: string }>>> = {
  patientennummer: { breite: "8%" },
  name: { breite: "37%" },
  geburtsdatum: { breite: "13%" },
  ort: { breite: "18%" },
  praxiskuerzel: { breite: "8%" },
  offeneLeistungen: { breite: "16%", className: "text-end" },
};

// Every row has the same height, so the rows are not measured. The cells do
// not wrap to keep the height.
const zeilenhoehe = 41;

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
          cell: ({ getValue }) => <span className="text-body-secondary">{getValue()}</span>,
        }),
        spalten.display({
          id: "name",
          header: "Name",
          cell: ({ row }) => <Name patient={row.original} />,
        }),
        spalten.accessor("geburtsdatum", {
          header: "Geburtsdatum",
          cell: ({ getValue }) => formatDatum(getValue()),
        }),
        spalten.accessor("ort", {
          header: "Ort",
          cell: ({ getValue }) => getValue() ?? <span className="text-body-secondary">–</span>,
        }),
        spalten.accessor("praxiskuerzel", {
          header: "Praxis",
          cell: ({ getValue }) => (
            <span className="badge rounded-pill bg-primary-subtle text-primary-emphasis border border-primary-subtle">
              {getValue()}
            </span>
          ),
        }),
        spalten.display({
          id: "offeneLeistungen",
          header: "Offene Leistungen",
          cell: ({ row }) => <OffeneLeistungen offen={offen.get(row.original.patientennummer)} />,
        }),
      ]),
    [offen],
  );
  const data = useMemo(() => patienten ?? [], [patienten]);
  const table = useTable({ features, columns, data });
  const rows = table.getRowModel().rows;

  // The page scrolls, so the rows start below everything above the table.
  const tabellenkoerper = useRef<HTMLTableSectionElement>(null);
  const [abstandOben, setAbstandOben] = useState(0);
  useLayoutEffect(() => {
    const top = tabellenkoerper.current?.getBoundingClientRect().top ?? 0;
    setAbstandOben(top + window.scrollY);
  }, [laedt]);
  const virtualizer = useWindowVirtualizer({
    count: rows.length,
    estimateSize: () => zeilenhoehe,
    getItemKey: (index) => rows[index]?.id ?? index,
    overscan: 10,
    scrollMargin: abstandOben,
  });
  const sichtbar = virtualizer.getVirtualItems();
  const fuellungOben = (sichtbar[0]?.start ?? abstandOben) - abstandOben;
  const fuellungUnten = virtualizer.getTotalSize() - ((sichtbar.at(-1)?.end ?? abstandOben) - abstandOben);
  const spaltenanzahl = columns.length;

  return (
    <table className="table table-hover align-middle mb-0 sticky-table patienten-tabelle">
      <colgroup>
        {table.getAllLeafColumns().map((column) => (
          <col key={column.id} style={{ width: spaltenlayout[column.id]?.breite }} />
        ))}
      </colgroup>
      <thead>
        {table.getHeaderGroups().map((gruppe) => (
          <tr key={gruppe.id}>
            {gruppe.headers.map((header) => (
              <th key={header.id} scope="col" className={spaltenlayout[header.column.id]?.className}>
                <table.FlexRender header={header} />
              </th>
            ))}
          </tr>
        ))}
      </thead>
      <tbody ref={tabellenkoerper}>
        {laedt && (
          <tr>
            <td colSpan={spaltenanzahl} className="text-center text-body-secondary py-4" role="status">
              <span className="spinner-border spinner-border-sm me-2" aria-hidden="true"></span>
              Die Patienten werden geladen …
            </td>
          </tr>
        )}
        {patienten?.length === 0 && (
          <tr>
            <td colSpan={spaltenanzahl} className="text-center text-body-secondary py-4">
              {leerHinweis}
            </td>
          </tr>
        )}
        {fuellungOben > 0 && (
          <tr aria-hidden="true">
            <td colSpan={spaltenanzahl} className="p-0 border-0" style={{ height: fuellungOben }}></td>
          </tr>
        )}
        {sichtbar.map((item) => {
          const row = rows[item.index];
          if (row === undefined) {
            return null;
          }
          return (
            <tr key={row.id} style={{ height: zeilenhoehe }}>
              {row.getAllCells().map((cell) => (
                <td key={cell.id} className={spaltenlayout[cell.column.id]?.className}>
                  <table.FlexRender cell={cell} />
                </td>
              ))}
            </tr>
          );
        })}
        {fuellungUnten > 0 && (
          <tr aria-hidden="true">
            <td colSpan={spaltenanzahl} className="p-0 border-0" style={{ height: fuellungUnten }}></td>
          </tr>
        )}
      </tbody>
    </table>
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
