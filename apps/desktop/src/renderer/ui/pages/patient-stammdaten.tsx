// Copyright (c) 2026 Falko Schumann. MIT license.

import { useId, useState, type FormEvent } from "react";

import type { CommandStatus, NaturheilpraxisApi } from "../../../shared/application/naturheilpraxis-api.ts";
import type { PatientErmittelnQueryResult } from "../../../shared/domain/patientenansicht.ts";
import {
  PatientFormular,
  patientAus,
  patientWerteAus,
  useAuswahllisten,
  usePatientWerte,
} from "./patient-formular.tsx";

type Patient = NonNullable<PatientErmittelnQueryResult>;

// The tab Stammdaten of the Karteikarte.
export function PatientStammdaten({
  api,
  patient,
  onSaved,
}: {
  api: NaturheilpraxisApi;
  patient: Patient;
  onSaved: () => void;
}) {
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
