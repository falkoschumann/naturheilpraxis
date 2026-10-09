// Copyright (c) 2026 Falko Schumann. MIT license.

import { useCallback, useEffect, useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router";

import type { NaturheilpraxisApi } from "../../../shared/application/naturheilpraxis-api.ts";
import type { RechnungErmittelnQueryResult } from "../../../shared/domain/rechnungsansicht.ts";
import { formatDatum, formatEuro } from "../../../shared/domain/value-objects.ts";
import { ConfirmDialog } from "../components/confirm-dialog.tsx";
import { RechnungsstatusBadge } from "../components/rechnungen-tabelle.tsx";
import { sende } from "../components/sende.ts";
import { meldungAus, Toast, type Meldung } from "../components/toast.tsx";
import { RechnungDialog } from "./rechnung-dialog.tsx";

type Rechnung = NonNullable<RechnungErmittelnQueryResult>;

// A Rechnung as it is printed, with the actions its status allows.
export function RechnungPage({ api }: { api: NaturheilpraxisApi }) {
  const rechnungId = useParams()["rechnungId"] ?? "";
  const location = useLocation();
  const navigate = useNavigate();
  const [rechnung, setRechnung] = useState<RechnungErmittelnQueryResult | null>(null);
  const [fehler, setFehler] = useState<string>();
  const [dialog, setDialog] = useState<"bearbeiten" | "loeschen">();
  const [meldung, setMeldung] = useState<Meldung | undefined>(() => meldungAus(location.state));
  // Each increment loads the Rechnung again.
  const [stand, setStand] = useState(0);

  useEffect(() => {
    let aktuell = true;
    api.rechnungErmitteln({ type: "rechnung-ermitteln", parameters: { rechnungId } }).then(
      (rechnung) => {
        if (aktuell) {
          setRechnung(rechnung);
        }
      },
      () => {
        if (aktuell) {
          setFehler("Die Rechnung konnte nicht geladen werden. Bitte starten Sie die Anwendung neu.");
        }
      },
    );
    return () => {
      aktuell = false;
    };
  }, [api, rechnungId, stand]);

  const schliesseMeldung = useCallback(() => setMeldung(undefined), []);

  if (fehler !== undefined) {
    return (
      <div className="alert alert-danger" role="alert">
        {fehler}
      </div>
    );
  }
  if (rechnung === null) {
    return (
      <p className="text-body-secondary" role="status">
        <span className="spinner-border spinner-border-sm me-2" aria-hidden="true"></span>
        Die Rechnung wird geladen …
      </p>
    );
  }
  if (rechnung === undefined) {
    return (
      <div className="alert alert-warning" role="alert">
        Diese Rechnung gibt es nicht (mehr). <Link to="/abrechnung">Zur Abrechnung</Link>
      </div>
    );
  }

  async function entwurfLoeschen(rechnung: Rechnung) {
    setDialog(undefined);
    const status = await sende(
      () => api.entwurfLoeschen({ type: "entwurf-loeschen", data: { rechnungId: rechnung.rechnungId } }),
      "Der Rechnungsentwurf konnte nicht gelöscht werden. Bitte versuchen Sie es erneut.",
    );
    if (status.success) {
      void navigate(`/patienten/${rechnung.patient.patientennummer}/rechnungen`, {
        state: { meldung: "Der Rechnungsentwurf wurde gelöscht." },
      });
    } else {
      setMeldung({ message: status.errorMessage });
    }
  }

  const { patient, praxis } = rechnung;
  const patientenname = [patient.name.titel, patient.name.vorname, patient.name.nachname].filter(Boolean).join(" ");
  const titel = rechnung.rechnungsnummer === undefined ? "Rechnungsentwurf" : `Rechnung ${rechnung.rechnungsnummer}`;
  return (
    <>
      <nav aria-label="Brotkrümel">
        <ol className="breadcrumb mb-2">
          <li className="breadcrumb-item">
            <Link to="/patienten">Patienten</Link>
          </li>
          <li className="breadcrumb-item">
            <Link to={`/patienten/${patient.patientennummer}/rechnungen`}>
              {patient.name.nachname}, {patient.name.vorname}
            </Link>
          </li>
          <li className="breadcrumb-item active" aria-current="page">
            {titel}
          </li>
        </ol>
      </nav>
      <div className="d-flex flex-wrap align-items-center gap-2 mb-3">
        <h1 className="h3 mb-0 me-2">{titel}</h1>
        <RechnungsstatusBadge rechnungsstatus={rechnung.status} />
        {rechnung.status === "entwurf" && (
          <div className="ms-auto d-flex flex-wrap gap-2">
            <button type="button" className="btn btn-outline-danger" onClick={() => setDialog("loeschen")}>
              <i className="fa-solid fa-trash me-1" aria-hidden="true"></i>
              Entwurf löschen
            </button>
            <button type="button" className="btn btn-outline-primary" onClick={() => setDialog("bearbeiten")}>
              <i className="fa-solid fa-pen me-1" aria-hidden="true"></i>
              Bearbeiten
            </button>
          </div>
        )}
      </div>
      {rechnung.status === "entwurf" && patient.anschrift === undefined && (
        <div className="alert alert-warning d-flex align-items-center gap-2" role="alert">
          <i className="fa-solid fa-triangle-exclamation" aria-hidden="true"></i>
          <div>
            Für {patientenname} ist keine vollständige Anschrift hinterlegt. Ohne Straße, Postleitzahl und Ort kann die
            Rechnung nicht versendet werden.{" "}
            <Link to={`/patienten/${patient.patientennummer}/stammdaten`} className="alert-link">
              Anschrift ergänzen
            </Link>
          </div>
        </div>
      )}
      <article className="card shadow-sm mx-auto rechnung" aria-label="Rechnung">
        <div className="card-body p-4 p-md-5">
          <header className="d-flex justify-content-between flex-wrap gap-3 mb-5">
            <div className="small">
              <div className="text-body-secondary mb-3 rechnung-absender">
                {praxis.name} · {praxis.anschrift.strasse} · {praxis.anschrift.postleitzahl} {praxis.anschrift.ort}
              </div>
              {patient.name.anrede !== undefined && <div>{patient.name.anrede}</div>}
              <div>{patientenname}</div>
              {patient.anschrift === undefined ? (
                <div className="text-danger">Anschrift fehlt</div>
              ) : (
                <>
                  <div>{patient.anschrift.strasse}</div>
                  {patient.anschrift.zusatz !== undefined && <div>{patient.anschrift.zusatz}</div>}
                  <div>
                    {patient.anschrift.postleitzahl} {patient.anschrift.ort}
                  </div>
                  {patient.anschrift.staat !== undefined && <div>{patient.anschrift.staat}</div>}
                </>
              )}
            </div>
            <div className="text-end">
              <div className="fs-5 text-primary">
                <i className="fa-solid fa-leaf me-1" aria-hidden="true"></i>
                {praxis.name}
              </div>
              <div className="small text-body-secondary">
                {praxis.anschrift.strasse}
                <br />
                {praxis.anschrift.postleitzahl} {praxis.anschrift.ort}
                {[praxis.kontakt?.telefon, praxis.kontakt?.email].map(
                  (kontakt) =>
                    kontakt !== undefined && (
                      <span key={kontakt}>
                        <br />
                        {kontakt}
                      </span>
                    ),
                )}
              </div>
            </div>
          </header>
          <div className="d-flex justify-content-between align-items-end mb-3">
            <h2 className="h4 mb-0">Rechnung</h2>
            <dl className="row small mb-0 text-end">
              <dt className="col-7 fw-normal text-body-secondary">Rechnungsnr.</dt>
              <dd className="col-5 mb-0">{rechnung.rechnungsnummer ?? <em>beim Versand</em>}</dd>
              <dt className="col-7 fw-normal text-body-secondary">Rechnungsdatum</dt>
              <dd className="col-5 mb-0">
                {rechnung.datum === undefined ? <em>beim Versand</em> : formatDatum(rechnung.datum)}
              </dd>
              <dt className="col-7 fw-normal text-body-secondary">Patientennr.</dt>
              <dd className="col-5 mb-0">{patient.patientennummer}</dd>
            </dl>
          </div>
          <p className="mb-3">
            <span className="text-body-secondary">Diagnose:</span> {rechnung.diagnosetext}
          </p>
          <table className="table table-sm">
            <thead>
              <tr>
                <th scope="col">Datum</th>
                <th scope="col">Ziffer</th>
                <th scope="col">Leistung</th>
                <th scope="col" className="text-end">
                  Anzahl
                </th>
                <th scope="col" className="text-end">
                  Einzelbetrag
                </th>
                <th scope="col" className="text-end">
                  Betrag
                </th>
              </tr>
            </thead>
            <tbody>
              {rechnung.positionen.map((position) => (
                <tr key={position.leistungId}>
                  <td>{formatDatum(position.datum)}</td>
                  <td>{position.ziffer}</td>
                  <td>{position.bezeichnung}</td>
                  <td className="text-end">{position.anzahl}</td>
                  <td className="text-end text-nowrap">{formatEuro(position.einzelbetrag)}</td>
                  <td className="text-end text-nowrap">{formatEuro(position.betrag)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <th colSpan={5} className="text-end">
                  Rechnungsbetrag
                </th>
                <th className="text-end text-nowrap">{formatEuro(rechnung.gesamtbetrag)}</th>
              </tr>
            </tfoot>
          </table>
          <p className="mt-4 mb-0">{rechnung.rechnungstext}</p>
        </div>
      </article>
      {dialog === "bearbeiten" && (
        <RechnungDialog
          api={api}
          patient={{
            patientennummer: patient.patientennummer,
            praxiskuerzel: praxis.praxiskuerzel,
            name: patientenname,
          }}
          entwurf={{
            rechnungId: rechnung.rechnungId,
            praxiskuerzel: praxis.praxiskuerzel,
            diagnosetext: rechnung.diagnosetext,
            rechnungstext: rechnung.rechnungstext,
            positionen: rechnung.positionen,
          }}
          onClose={() => setDialog(undefined)}
          onSaved={(_rechnungId, message) => {
            setDialog(undefined);
            setMeldung({ message });
            setStand((stand) => stand + 1);
          }}
        />
      )}
      {dialog === "loeschen" && (
        <ConfirmDialog
          title="Entwurf löschen?"
          confirmLabel="Löschen"
          onConfirm={() => void entwurfLoeschen(rechnung)}
          onCancel={() => setDialog(undefined)}
        >
          <p className="mb-0">
            Der Rechnungsentwurf für {patientenname} über {formatEuro(rechnung.gesamtbetrag)} wird gelöscht. Die
            Leistungen können danach wieder abgerechnet werden.
          </p>
        </ConfirmDialog>
      )}
      {meldung !== undefined && <Toast message={meldung.message} action={meldung.action} onClose={schliesseMeldung} />}
    </>
  );
}
