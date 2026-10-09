// Copyright (c) 2026 Falko Schumann. MIT license.

import { useContext, useState, type FormEvent } from "react";

import type { NaturheilpraxisApi, PatientAufnehmenStatus } from "../../../shared/application/naturheilpraxis-api.ts";
import type { Patientennummer } from "../../../shared/domain/value-objects.ts";
import { Dialog } from "../components/dialog.tsx";
import { AktuellePraxisContext } from "../layouts/aktuelle-praxis.ts";
import {
  PatientFormular,
  patientAus,
  patientWerteAus,
  useAuswahllisten,
  usePatientWerte,
} from "./patient-formular.tsx";

// Admits a Patient in the current Praxis unless chosen otherwise. The input is
// kept when the Patient cannot be admitted.
export function PatientAufnehmenDialog({
  api,
  onClose,
  onAufgenommen,
}: {
  api: NaturheilpraxisApi;
  onClose: () => void;
  onAufgenommen: (patientennummer: Patientennummer, message: string) => void;
}) {
  const aktuellePraxis = useContext(AktuellePraxisContext);
  const formular = usePatientWerte(() => patientWerteAus(undefined, aktuellePraxis));
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
    const data = patientAus(formular.werte);
    let status: PatientAufnehmenStatus;
    try {
      status = await api.patientAufnehmen({ type: "patient-aufnehmen", data });
    } catch {
      status = {
        success: false,
        errorMessage: "Der Patient konnte nicht aufgenommen werden. Bitte versuchen Sie es erneut.",
      };
    }
    setSpeichert(false);
    if (status.success) {
      onAufgenommen(
        status.patientennummer,
        `${data.name.vorname} ${data.name.nachname} wurde mit der Patientennummer ${status.patientennummer} aufgenommen.`,
      );
    } else {
      setFehler(status.errorMessage);
    }
  }

  return (
    <Dialog title="Patient aufnehmen" size="xl" onClose={onClose}>
      <form noValidate onSubmit={(event) => void handleSubmit(event)}>
        <div className="modal-body">
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
            praxen={praxen}
            patienten={patienten}
            autoFocus
          />
        </div>
        <div className="modal-footer">
          <span className="me-auto small text-body-secondary">
            <span className="text-danger">*</span> Pflichtfeld
          </span>
          <button type="button" className="btn btn-outline-secondary" onClick={onClose}>
            Abbrechen
          </button>
          <button type="submit" className="btn btn-primary" disabled={speichert}>
            {speichert ? (
              <span className="spinner-border spinner-border-sm me-2" aria-hidden="true"></span>
            ) : (
              <i className="fa-solid fa-user-plus me-1" aria-hidden="true"></i>
            )}
            Aufnehmen
          </button>
        </div>
      </form>
    </Dialog>
  );
}
