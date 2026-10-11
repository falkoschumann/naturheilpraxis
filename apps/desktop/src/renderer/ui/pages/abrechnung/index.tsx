// Copyright (c) 2026 Falko Schumann. MIT license.

import { useEffect, useId, useState } from "react";
import { Link, useNavigate } from "react-router";

import type { NaturheilpraxisApi } from "../../../../shared/application/naturheilpraxis-api.ts";
import type {
  KennzahlenErmittelnQueryResult,
  PatientenMitNichtAbgerechnetenLeistungenErmittelnQueryResult,
  PatientMitNichtAbgerechnetenLeistungen,
  RechnungenErmittelnQueryResult,
} from "../../../../shared/domain/abrechnungsansicht.ts";
import type { Rechnungsstatus } from "../../../../shared/domain/entities.ts";
import { formatDatum, formatEuro } from "../../../../shared/domain/value-objects.ts";
import { ListHeader, PageHeader } from "../../components/sticky-header.tsx";
import { RechnungenTabelle, rechnungsstatusLabel } from "../../components/rechnungen-tabelle.tsx";
import { RechnungDialog } from "../../components/rechnung-dialog.tsx";

const filter: readonly (Rechnungsstatus | "alle")[] = ["alle", "entwurf", "versendet", "bezahlt"];

type Abrechnung = Readonly<{
  kennzahlen: KennzahlenErmittelnQueryResult;
  patienten: PatientenMitNichtAbgerechnetenLeistungenErmittelnQueryResult;
  rechnungen: RechnungenErmittelnQueryResult;
}>;

// The state of the billing at a glance, the Patienten to bill and all
// Rechnungen, the Entwürfe first.
export function AbrechnungPage({ api }: { api: NaturheilpraxisApi }) {
  const navigate = useNavigate();
  const [abrechnung, setAbrechnung] = useState<Abrechnung>();
  const [fehler, setFehler] = useState<string>();
  const [statusFilter, setStatusFilter] = useState<Rechnungsstatus | "alle">("alle");
  const rechnungenTitelId = useId();
  const [abzurechnen, setAbzurechnen] = useState<PatientMitNichtAbgerechnetenLeistungen>();

  useEffect(() => {
    let aktuell = true;
    Promise.all([
      api.kennzahlenErmitteln({ type: "kennzahlen-ermitteln", parameters: {} }),
      api.patientenMitNichtAbgerechnetenLeistungenErmitteln({
        type: "patienten-mit-nicht-abgerechneten-leistungen-ermitteln",
        parameters: {},
      }),
      api.rechnungenErmitteln({ type: "rechnungen-ermitteln", parameters: {} }),
    ]).then(
      ([kennzahlen, patienten, rechnungen]) => {
        if (aktuell) {
          setAbrechnung({ kennzahlen, patienten, rechnungen });
        }
      },
      () => {
        if (aktuell) {
          setFehler("Die Abrechnung konnte nicht geladen werden. Bitte starten Sie die Anwendung neu.");
        }
      },
    );
    return () => {
      aktuell = false;
    };
  }, [api]);

  return (
    <>
      <PageHeader>
        <h1 className="h3 mb-0">Abrechnung</h1>
      </PageHeader>
      {fehler !== undefined && (
        <div className="alert alert-danger" role="alert">
          {fehler}
        </div>
      )}
      {abrechnung === undefined && fehler === undefined && (
        <p className="text-body-secondary" role="status">
          <span className="spinner-border spinner-border-sm me-2" aria-hidden="true"></span>
          Die Abrechnung wird geladen …
        </p>
      )}
      {abrechnung !== undefined && (
        <>
          <Kennzahlen kennzahlen={abrechnung.kennzahlen} />
          <PatientenMitNichtAbgerechnetenLeistungen
            patienten={abrechnung.patienten}
            onRechnungErstellen={setAbzurechnen}
          />
          <section aria-labelledby={rechnungenTitelId}>
            <ListHeader className="d-flex flex-wrap align-items-center gap-2 pb-2">
              <h2 id={rechnungenTitelId} className="h5 mb-0 me-auto">
                Rechnungen
              </h2>
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
            </ListHeader>
            <RechnungenTabelle
              rechnungen={abrechnung.rechnungen.filter(
                (rechnung) => statusFilter === "alle" || rechnung.status === statusFilter,
              )}
              mitPatient
            />
          </section>
        </>
      )}
      {abzurechnen !== undefined && (
        <RechnungDialog
          api={api}
          patient={{
            patientennummer: abzurechnen.patientennummer,
            praxiskuerzel: abzurechnen.praxiskuerzel,
            name: [abzurechnen.name.titel, abzurechnen.name.vorname, abzurechnen.name.nachname]
              .filter(Boolean)
              .join(" "),
          }}
          onClose={() => setAbzurechnen(undefined)}
          onSaved={(rechnungId, message) => {
            setAbzurechnen(undefined);
            void navigate(`/rechnungen/${rechnungId}`, { state: { meldung: message } });
          }}
        />
      )}
    </>
  );
}

function Kennzahlen({ kennzahlen }: { kennzahlen: KennzahlenErmittelnQueryResult }) {
  return (
    <div className="row g-3 mb-4">
      <Kachel
        label="Nicht abgerechnet"
        wert={formatEuro(kennzahlen.nichtAbgerechnet.betrag)}
        icon="fa-hourglass-half text-warning"
      />
      <Kachel label="Entwürfe" wert={String(kennzahlen.entwuerfe.anzahl)} icon="fa-file-pen text-secondary" />
      <Kachel
        label="Versendet, unbezahlt"
        wert={formatEuro(kennzahlen.versendet.betrag)}
        icon="fa-paper-plane text-info"
      />
      <Kachel label="Bezahlt" wert={String(kennzahlen.bezahlt.anzahl)} icon="fa-circle-check text-success" />
    </div>
  );
}

function Kachel({ label, wert, icon }: { label: string; wert: string; icon: string }) {
  const labelId = useId();
  return (
    <div className="col-6 col-lg-3">
      <div className="card shadow-sm h-100" role="group" aria-labelledby={labelId}>
        <div className="card-body">
          <div className="small text-body-secondary">
            <i className={`fa-solid ${icon} me-1`} aria-hidden="true"></i>
            <span id={labelId}>{label}</span>
          </div>
          <div className="fs-4 fw-semibold">{wert}</div>
        </div>
      </div>
    </div>
  );
}

function PatientenMitNichtAbgerechnetenLeistungen({
  patienten,
  onRechnungErstellen,
}: {
  patienten: PatientenMitNichtAbgerechnetenLeistungenErmittelnQueryResult;
  onRechnungErstellen: (patient: PatientMitNichtAbgerechnetenLeistungen) => void;
}) {
  const titleId = useId();
  return (
    <section aria-labelledby={titleId}>
      <ListHeader className="pb-2">
        <h2 id={titleId} className="h5 mb-0">
          Patienten mit nicht abgerechneten Leistungen
        </h2>
      </ListHeader>
      {patienten.length === 0 ? (
        <p className="text-body-secondary mb-4">Alle Leistungen sind abgerechnet.</p>
      ) : (
        <div className="card shadow-sm mb-4">
          <ul className="list-group list-group-flush" aria-labelledby={titleId}>
            {patienten.map((patient) => (
              <li key={patient.patientennummer} className="list-group-item d-flex flex-wrap align-items-center gap-2">
                <Link to={`/patienten/${patient.patientennummer}`} className="fw-semibold text-decoration-none me-auto">
                  {[patient.name.nachname, patient.name.vorname].filter(Boolean).join(", ")}{" "}
                  <span className="text-body-secondary fw-normal small">Nr. {patient.patientennummer}</span>
                </Link>
                <span className="small text-body-secondary">
                  {patient.anzahl} {patient.anzahl === 1 ? "Leistung" : "Leistungen"} seit {formatDatum(patient.seit)}
                </span>
                <span className="fw-semibold text-end text-nowrap" style={{ minWidth: "6rem" }}>
                  {formatEuro(patient.betrag)}
                </span>
                <button
                  type="button"
                  className="btn btn-sm btn-outline-primary"
                  onClick={() => onRechnungErstellen(patient)}
                >
                  Rechnung erstellen
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}
