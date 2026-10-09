// Copyright (c) 2026 Falko Schumann. MIT license.

import { useCallback, useEffect, useState } from "react";
import { Link, NavLink, useLocation, useParams } from "react-router";

import type { NaturheilpraxisApi } from "../../../shared/application/naturheilpraxis-api.ts";
import type { Diagnose } from "../../../shared/domain/entities.ts";
import type { PatientErmittelnQueryResult } from "../../../shared/domain/patientenansicht.ts";
import { formatDatum } from "../../../shared/domain/value-objects.ts";
import { ConfirmDialog } from "../components/confirm-dialog.tsx";
import { sende } from "../components/sende.ts";
import { Toast, type ToastAction } from "../components/toast.tsx";
import { DiagnoseDialog } from "./diagnose-dialog.tsx";
import { PatientBehandlung } from "./patient-behandlung.tsx";
import { PatientStammdaten } from "./patient-stammdaten.tsx";

type DialogZustand =
  | Readonly<{ art: "diagnose-stellen" }>
  | Readonly<{ art: "diagnose-bearbeiten"; diagnose: Diagnose }>
  | Readonly<{ art: "diagnose-loeschen"; diagnose: Diagnose }>
  | undefined;

type Meldung = Readonly<{ message: string; action?: ToastAction }>;

// The Karteikarte of a Patient with the tabs Behandlung and Stammdaten.
export function PatientPage({ api, reiter }: { api: NaturheilpraxisApi; reiter: "behandlung" | "stammdaten" }) {
  const patientennummer = Number(useParams()["patientennummer"]);
  const location = useLocation();
  const [patient, setPatient] = useState<PatientErmittelnQueryResult | null>(null);
  const [fehler, setFehler] = useState<string>();
  const [meldung, setMeldung] = useState<Meldung | undefined>(() => meldungAus(location.state));
  const [dialog, setDialog] = useState<DialogZustand>();
  // Each increment loads the Patient again.
  const [stand, setStand] = useState(0);
  // Each increment loads the Behandlung again.
  const [behandlungStand, setBehandlungStand] = useState(0);

  useEffect(() => {
    let aktuell = true;
    api.patientErmitteln({ type: "patient-ermitteln", parameters: { patientennummer } }).then(
      (patient) => {
        if (aktuell) {
          setPatient(patient);
        }
      },
      () => {
        if (aktuell) {
          setFehler("Der Patient konnte nicht geladen werden. Bitte starten Sie die Anwendung neu.");
        }
      },
    );
    return () => {
      aktuell = false;
    };
  }, [api, patientennummer, stand]);

  const schliesseMeldung = useCallback(() => setMeldung(undefined), []);

  async function diagnoseLoeschen(diagnose: Diagnose) {
    setDialog(undefined);
    const status = await sende(
      () => api.diagnoseLoeschen({ type: "diagnose-loeschen", data: { diagnoseId: diagnose.diagnoseId } }),
      "Die Diagnose konnte nicht gelöscht werden. Bitte versuchen Sie es erneut.",
    );
    if (!status.success) {
      setMeldung({ message: status.errorMessage });
      return;
    }
    setMeldung({
      message: "Die Diagnose wurde gelöscht.",
      action: { label: "Rückgängig", onAction: () => void diagnoseWiederherstellen(diagnose) },
    });
    setBehandlungStand((stand) => stand + 1);
  }

  async function diagnoseWiederherstellen(diagnose: Diagnose) {
    const status = await sende(
      () => api.diagnoseStellen({ type: "diagnose-stellen", data: diagnose }),
      "Die Diagnose konnte nicht wiederhergestellt werden. Bitte stellen Sie sie erneut.",
    );
    setMeldung({ message: status.success ? "Die Diagnose ist wiederhergestellt." : status.errorMessage });
    setBehandlungStand((stand) => stand + 1);
  }

  if (fehler !== undefined) {
    return (
      <div className="alert alert-danger" role="alert">
        {fehler}
      </div>
    );
  }
  if (patient === null) {
    return (
      <p className="text-body-secondary" role="status">
        <span className="spinner-border spinner-border-sm me-2" aria-hidden="true"></span>
        Der Patient wird geladen …
      </p>
    );
  }
  if (patient === undefined) {
    return (
      <div className="alert alert-warning" role="alert">
        Einen Patienten mit der Nummer {patientennummer} gibt es nicht.{" "}
        <Link to="/patienten">Zurück zu den Patienten</Link>
      </div>
    );
  }

  const name = [patient.name.titel, patient.name.vorname, patient.name.nachname].filter(Boolean).join(" ");
  return (
    <>
      <nav aria-label="Brotkrümel">
        <ol className="breadcrumb mb-2">
          <li className="breadcrumb-item">
            <Link to="/patienten">Patienten</Link>
          </li>
          <li className="breadcrumb-item active" aria-current="page">
            {patient.name.nachname}, {patient.name.vorname}
          </li>
        </ol>
      </nav>
      <div className="card shadow-sm mb-3">
        <div className="card-body d-flex flex-wrap gap-3 align-items-center">
          <div className="me-auto">
            <h1 className="h4 mb-1">{name}</h1>
            <div className="text-body-secondary small">
              Nr. {patient.patientennummer} · geb. {formatDatum(patient.geburtsdatum)} ·{" "}
              <span className="badge rounded-pill bg-primary-subtle text-primary-emphasis border border-primary-subtle">
                {patient.praxiskuerzel}
              </span>{" "}
              seit {patient.aufnahmejahr} ·{" "}
              {patient.anschrift === undefined ? (
                <span className="text-warning-emphasis">
                  <i className="fa-solid fa-triangle-exclamation me-1" aria-hidden="true"></i>
                  keine Anschrift
                </span>
              ) : (
                `${patient.anschrift.strasse}, ${patient.anschrift.postleitzahl} ${patient.anschrift.ort}`
              )}
            </div>
          </div>
          <button
            type="button"
            className="btn btn-outline-primary"
            onClick={() => setDialog({ art: "diagnose-stellen" })}
          >
            <i className="fa-solid fa-stethoscope me-1" aria-hidden="true"></i>
            Diagnose stellen
          </button>
        </div>
      </div>
      <ul className="nav nav-tabs mb-3">
        <li className="nav-item">
          <NavLink className="nav-link" to={`/patienten/${patient.patientennummer}`} end>
            <i className="fa-solid fa-notes-medical me-1" aria-hidden="true"></i>
            Behandlung
          </NavLink>
        </li>
        <li className="nav-item">
          <NavLink className="nav-link" to={`/patienten/${patient.patientennummer}/stammdaten`}>
            <i className="fa-solid fa-id-card me-1" aria-hidden="true"></i>
            Stammdaten
          </NavLink>
        </li>
      </ul>
      {reiter === "behandlung" ? (
        <PatientBehandlung
          api={api}
          patientennummer={patient.patientennummer}
          stand={behandlungStand}
          onDiagnoseBearbeiten={(diagnose) => setDialog({ art: "diagnose-bearbeiten", diagnose })}
          onDiagnoseLoeschen={(diagnose) => setDialog({ art: "diagnose-loeschen", diagnose })}
        />
      ) : (
        <PatientStammdaten
          // A new key resets the form when the saved Patient is loaded.
          key={JSON.stringify(patient)}
          api={api}
          patient={patient}
          onSaved={() => {
            setMeldung({ message: "Die Stammdaten wurden gespeichert." });
            setStand((stand) => stand + 1);
          }}
        />
      )}
      {(dialog?.art === "diagnose-stellen" || dialog?.art === "diagnose-bearbeiten") && (
        <DiagnoseDialog
          api={api}
          patient={{ patientennummer: patient.patientennummer, praxiskuerzel: patient.praxiskuerzel, name }}
          diagnose={dialog.art === "diagnose-bearbeiten" ? dialog.diagnose : undefined}
          onClose={() => setDialog(undefined)}
          onSaved={(message) => {
            setDialog(undefined);
            setMeldung({ message });
            setBehandlungStand((stand) => stand + 1);
          }}
        />
      )}
      {dialog?.art === "diagnose-loeschen" && (
        <ConfirmDialog
          title="Diagnose löschen?"
          confirmLabel="Löschen"
          onConfirm={() => void diagnoseLoeschen(dialog.diagnose)}
          onCancel={() => setDialog(undefined)}
        >
          <p className="mb-0">
            Die Diagnose „{dialog.diagnose.text}“ vom {formatDatum(dialog.diagnose.datum)} wird gelöscht.
          </p>
        </ConfirmDialog>
      )}
      {meldung !== undefined && <Toast message={meldung.message} action={meldung.action} onClose={schliesseMeldung} />}
    </>
  );
}

function meldungAus(state: unknown): Meldung | undefined {
  if (typeof state === "object" && state !== null && "meldung" in state && typeof state.meldung === "string") {
    return { message: state.meldung };
  }
  return undefined;
}
