// Copyright (c) 2026 Falko Schumann. MIT license.

import { useCallback, useEffect, useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router";

import type { NaturheilpraxisApi } from "../../../shared/application/naturheilpraxis-api.ts";
import { rechnungUrl, type PrintApi } from "../../../shared/application/print-api.ts";
import type { RechnungErmittelnQueryResult } from "../../../shared/domain/rechnungsansicht.ts";
import { formatDatum, formatEuro } from "../../../shared/domain/value-objects.ts";
import { ConfirmDialog } from "../components/confirm-dialog.tsx";
import { RechnungsstatusBadge, rechnungsstatusLabel } from "../components/rechnungen-tabelle.tsx";
import { PageHeader } from "../components/sticky-header.tsx";
import { sende } from "../components/sende.ts";
import { meldungAus, Toast, type Meldung } from "../components/toast.tsx";
import { heute } from "./heute.ts";
import { RechnungDialog } from "./rechnung-dialog.tsx";

type Rechnung = NonNullable<RechnungErmittelnQueryResult>;

// A Rechnung as it is printed, with the actions its status allows.
export function RechnungPage({ api, printer }: { api: NaturheilpraxisApi; printer: PrintApi }) {
  const rechnungId = useParams()["rechnungId"] ?? "";
  const location = useLocation();
  const navigate = useNavigate();
  const [rechnung, setRechnung] = useState<RechnungErmittelnQueryResult | null>(null);
  const [fehler, setFehler] = useState<string>();
  const [dialog, setDialog] = useState<
    "bearbeiten" | "loeschen" | "versenden" | "versand-zuruecknehmen" | "zahlung-zuruecknehmen"
  >();
  const [meldung, setMeldung] = useState<Meldung | undefined>(() => meldungAus(location.state));
  // Each increment loads the Rechnung and its preview again.
  const [stand, setStand] = useState(0);
  const [druckt, setDruckt] = useState(false);

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

  async function versenden(rechnung: Rechnung) {
    setDialog(undefined);
    const status = await sende(
      () =>
        api.rechnungVersenden({
          type: "rechnung-versenden",
          data: { rechnungId: rechnung.rechnungId, patientennummer: rechnung.patient.patientennummer, datum: heute() },
        }),
      "Die Rechnung konnte nicht versendet werden. Bitte versuchen Sie es erneut.",
    );
    if (!status.success) {
      setMeldung({ message: status.errorMessage, fehler: true });
      return;
    }
    // The Rechnungsnummer is assigned on dispatch, so the Rechnung is loaded
    // again to tell it.
    const versendet = await api
      .rechnungErmitteln({ type: "rechnung-ermitteln", parameters: { rechnungId: rechnung.rechnungId } })
      .catch(() => undefined);
    setRechnung(versendet);
    setStand((stand) => stand + 1);
    setMeldung({
      message:
        versendet?.rechnungsnummer === undefined
          ? "Die Rechnung wurde als versendet markiert."
          : `Die Rechnung ${versendet.rechnungsnummer} wurde als versendet markiert.`,
    });
  }

  async function versandZuruecknehmen(rechnung: Rechnung) {
    setDialog(undefined);
    const status = await sende(
      () => api.rechnungZurueckstufen({ type: "rechnung-zurueckstufen", data: { rechnungId: rechnung.rechnungId } }),
      "Der Versand konnte nicht zurückgenommen werden. Bitte versuchen Sie es erneut.",
    );
    setMeldung(
      status.success
        ? { message: "Der Versand wurde zurückgenommen. Die Rechnung ist wieder ein Entwurf." }
        : { message: status.errorMessage, fehler: true },
    );
    setStand((stand) => stand + 1);
  }

  async function drucken(rechnung: Rechnung) {
    setDruckt(true);
    const status = await printer.printRechnung(rechnung.rechnungId).catch(() => ({
      printed: false,
      errorMessage: "Die Rechnung konnte nicht gedruckt werden. Bitte versuchen Sie es erneut.",
    }));
    setDruckt(false);
    if (status.printed) {
      setMeldung({ message: `Die Rechnung ${rechnung.rechnungsnummer} wurde zum Drucken übergeben.` });
    } else if (status.errorMessage !== undefined) {
      setMeldung({ message: status.errorMessage, fehler: true });
    }
  }

  async function zahlungErfassen(rechnung: Rechnung) {
    const status = await sende(
      () => api.zahlungErfassen({ type: "zahlung-erfassen", data: { rechnungId: rechnung.rechnungId } }),
      "Die Zahlung konnte nicht erfasst werden. Bitte versuchen Sie es erneut.",
    );
    setMeldung(
      status.success
        ? {
            message: `Der Zahlungseingang für Rechnung ${rechnung.rechnungsnummer} wurde erfasst.`,
            action: { label: "Rückgängig", onAction: () => void zahlungZuruecknehmen(rechnung) },
          }
        : { message: status.errorMessage, fehler: true },
    );
    setStand((stand) => stand + 1);
  }

  async function zahlungZuruecknehmen(rechnung: Rechnung) {
    setDialog(undefined);
    const status = await sende(
      () => api.rechnungZurueckstufen({ type: "rechnung-zurueckstufen", data: { rechnungId: rechnung.rechnungId } }),
      "Die Zahlung konnte nicht zurückgenommen werden. Bitte versuchen Sie es erneut.",
    );
    setMeldung(
      status.success
        ? { message: "Die Zahlung wurde zurückgenommen." }
        : { message: status.errorMessage, fehler: true },
    );
    setStand((stand) => stand + 1);
  }

  const { patient, praxis } = rechnung;
  const patientenname = [patient.name.titel, patient.name.vorname, patient.name.nachname].filter(Boolean).join(" ");
  const titel = rechnung.rechnungsnummer === undefined ? "Rechnungsentwurf" : `Rechnung ${rechnung.rechnungsnummer}`;
  return (
    <>
      <PageHeader className="d-print-none">
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
        <div className="d-flex flex-wrap align-items-center gap-2">
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
              <button type="button" className="btn btn-primary" onClick={() => setDialog("versenden")}>
                <i className="fa-solid fa-paper-plane me-1" aria-hidden="true"></i>
                Versenden
              </button>
            </div>
          )}
          {rechnung.status === "versendet" && (
            <div className="ms-auto d-flex flex-wrap gap-2">
              <button
                type="button"
                className="btn btn-outline-secondary"
                onClick={() => setDialog("versand-zuruecknehmen")}
              >
                <i className="fa-solid fa-rotate-left me-1" aria-hidden="true"></i>
                Versand zurücknehmen
              </button>
              <DruckenButton druckt={druckt} onClick={() => void drucken(rechnung)} />
              <button type="button" className="btn btn-primary" onClick={() => void zahlungErfassen(rechnung)}>
                <i className="fa-solid fa-euro-sign me-1" aria-hidden="true"></i>
                Zahlung erfassen
              </button>
            </div>
          )}
          {rechnung.status === "bezahlt" && (
            <div className="ms-auto d-flex flex-wrap gap-2">
              <button
                type="button"
                className="btn btn-outline-secondary"
                onClick={() => setDialog("zahlung-zuruecknehmen")}
              >
                <i className="fa-solid fa-rotate-left me-1" aria-hidden="true"></i>
                Zahlung zurücknehmen
              </button>
              <DruckenButton druckt={druckt} onClick={() => void drucken(rechnung)} />
            </div>
          )}
        </div>
      </PageHeader>
      <Fortschritt status={rechnung.status} />
      {rechnung.status === "entwurf" && patient.anschrift === undefined && (
        <div className="alert alert-warning d-flex align-items-center gap-2 d-print-none" role="alert">
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
      {/* The Rechnung is created from the Rechnungsvorlage, which may run
          neither a script nor reach the app. */}
      <iframe
        key={stand}
        className="card shadow-sm mx-auto d-block rechnung"
        title="Rechnung"
        sandbox=""
        src={rechnungUrl(rechnung.rechnungId)}
      ></iframe>
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
      {dialog === "versenden" && (
        <ConfirmDialog
          title="Rechnung versenden?"
          confirmLabel="Versenden"
          variant="primary"
          onConfirm={() => void versenden(rechnung)}
          onCancel={() => setDialog(undefined)}
        >
          <p className="mb-0">
            Die Rechnung erhält eine Rechnungsnummer und das Rechnungsdatum {formatDatum(heute())}. Danach können Sie
            sie nicht mehr bearbeiten. Mit „Versand zurücknehmen“ wird sie wieder zum Entwurf.
          </p>
        </ConfirmDialog>
      )}
      {dialog === "versand-zuruecknehmen" && (
        <ConfirmDialog
          title="Versand zurücknehmen?"
          confirmLabel="Versand zurücknehmen"
          onConfirm={() => void versandZuruecknehmen(rechnung)}
          onCancel={() => setDialog(undefined)}
        >
          <p className="mb-0">
            Die Rechnung wird wieder zum Entwurf. Rechnungsnummer {rechnung.rechnungsnummer} und Rechnungsdatum werden
            entfernt und beim erneuten Versand neu vergeben.
          </p>
        </ConfirmDialog>
      )}
      {dialog === "zahlung-zuruecknehmen" && (
        <ConfirmDialog
          title="Zahlung zurücknehmen?"
          confirmLabel="Zahlung zurücknehmen"
          onConfirm={() => void zahlungZuruecknehmen(rechnung)}
          onCancel={() => setDialog(undefined)}
        >
          <p className="mb-0">
            Die Rechnung {rechnung.rechnungsnummer} gilt danach wieder als versendet und unbezahlt.
          </p>
        </ConfirmDialog>
      )}
      {meldung !== undefined && <Toast {...meldung} onClose={schliesseMeldung} />}
    </>
  );
}

function DruckenButton({ druckt, onClick }: { druckt: boolean; onClick: () => void }) {
  return (
    <button type="button" className="btn btn-outline-secondary" disabled={druckt} onClick={onClick}>
      {druckt ? (
        <span className="spinner-border spinner-border-sm me-1" aria-hidden="true"></span>
      ) : (
        <i className="fa-solid fa-print me-1" aria-hidden="true"></i>
      )}
      Drucken
    </button>
  );
}

const schritte = ["entwurf", "versendet", "bezahlt"] as const;

function Fortschritt({ status }: { status: Rechnung["status"] }) {
  const aktuell = schritte.indexOf(status);
  return (
    <ol className="list-inline small mb-3 d-print-none" aria-label="Fortschritt der Rechnung">
      {schritte.map((schritt, index) => (
        <li
          key={schritt}
          className={`list-inline-item ${index <= aktuell ? "text-primary fw-semibold" : "text-body-secondary"}`}
          aria-current={index === aktuell ? "step" : undefined}
        >
          <i
            className={`fa-solid ${index < aktuell ? "fa-circle-check" : index === aktuell ? "fa-circle-dot" : "fa-circle"} me-1`}
            aria-hidden="true"
          ></i>
          {rechnungsstatusLabel(schritt)}
          {index < schritte.length - 1 && (
            <i className="fa-solid fa-chevron-right mx-2 text-body-tertiary" aria-hidden="true"></i>
          )}
        </li>
      ))}
    </ol>
  );
}
