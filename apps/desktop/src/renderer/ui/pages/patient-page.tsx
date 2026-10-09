// Copyright (c) 2026 Falko Schumann. MIT license.

import { useCallback, useEffect, useId, useState, type FormEvent } from "react";
import { Link, useLocation, useParams } from "react-router";

import type { CommandStatus, NaturheilpraxisApi } from "../../../shared/application/naturheilpraxis-api.ts";
import type { PatientErmittelnQueryResult } from "../../../shared/domain/patientenansicht.ts";
import { formatDatum } from "../../../shared/domain/value-objects.ts";
import { Toast } from "../components/toast.tsx";
import {
  PatientFormular,
  patientAus,
  patientWerteAus,
  useAuswahllisten,
  usePatientWerte,
} from "./patient-formular.tsx";

type Patient = NonNullable<PatientErmittelnQueryResult>;

// The Karteikarte of a Patient.
export function PatientPage({ api }: { api: NaturheilpraxisApi }) {
  const patientennummer = Number(useParams()["patientennummer"]);
  const location = useLocation();
  const [patient, setPatient] = useState<PatientErmittelnQueryResult | null>(null);
  const [fehler, setFehler] = useState<string>();
  const [meldung, setMeldung] = useState<string | undefined>(() => meldungAus(location.state));
  // Each increment loads the Patient again.
  const [stand, setStand] = useState(0);

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
        <div className="card-body">
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
      </div>
      <Stammdaten
        // A new key resets the form when the saved Patient is loaded.
        key={JSON.stringify(patient)}
        api={api}
        patient={patient}
        onSaved={() => {
          setMeldung("Die Stammdaten wurden gespeichert.");
          setStand((stand) => stand + 1);
        }}
      />
      {meldung !== undefined && <Toast message={meldung} onClose={schliesseMeldung} />}
    </>
  );
}

function Stammdaten({ api, patient, onSaved }: { api: NaturheilpraxisApi; patient: Patient; onSaved: () => void }) {
  const titleId = useId();
  const formular = usePatientWerte(() => patientWerteAus(patient));
  const { praxen, patienten } = useAuswahllisten(api);
  const [fehler, setFehler] = useState<string>();
  const [speichert, setSpeichert] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!formular.pruefen(event.currentTarget)) {
      setFehler("Bitte prüfen Sie die markierten Felder.");
      return;
    }

    setFehler(undefined);
    setSpeichert(true);
    let status: CommandStatus;
    try {
      status = await api.patientendatenAendern({
        type: "patientendaten-aendern",
        data: { patientennummer: patient.patientennummer, ...patientAus(formular.werte) },
      });
    } catch {
      status = {
        success: false,
        errorMessage: "Die Stammdaten konnten nicht gespeichert werden. Bitte versuchen Sie es erneut.",
      };
    }
    setSpeichert(false);
    if (status.success) {
      onSaved();
    } else {
      setFehler(status.errorMessage);
    }
  }

  return (
    <form
      className="card shadow-sm"
      noValidate
      aria-labelledby={titleId}
      onSubmit={(event) => void handleSubmit(event)}
    >
      <div className="card-header">
        <h2 id={titleId} className="h5 mb-0">
          Stammdaten
        </h2>
      </div>
      <div className="card-body">
        {fehler !== undefined && (
          <div className="alert alert-danger" role="alert">
            <i className="fa-solid fa-circle-exclamation me-2" aria-hidden="true"></i>
            {fehler} Ihre Eingaben bleiben erhalten.
          </div>
        )}
        <PatientFormular
          werte={formular.werte}
          ungueltig={formular.ungueltig}
          onChange={formular.aendern}
          patientennummer={patient.patientennummer}
          praxen={praxen}
          patienten={patienten}
        />
      </div>
      <div className="card-footer d-flex align-items-center justify-content-end gap-2 sticky-bottom bg-body">
        <span className="me-auto small text-body-secondary">
          <span className="text-danger">*</span> Pflichtfeld
        </span>
        <button
          type="button"
          className="btn btn-outline-secondary"
          onClick={() => {
            formular.zuruecksetzen(patientWerteAus(patient));
            setFehler(undefined);
          }}
        >
          Änderungen verwerfen
        </button>
        <button type="submit" className="btn btn-primary" disabled={speichert}>
          {speichert ? (
            <span className="spinner-border spinner-border-sm me-2" aria-hidden="true"></span>
          ) : (
            <i className="fa-solid fa-floppy-disk me-1" aria-hidden="true"></i>
          )}
          Speichern
        </button>
      </div>
    </form>
  );
}

function meldungAus(state: unknown): string | undefined {
  if (typeof state === "object" && state !== null && "meldung" in state && typeof state.meldung === "string") {
    return state.meldung;
  }
  return undefined;
}
