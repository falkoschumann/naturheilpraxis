// Copyright (c) 2026 Falko Schumann. MIT license.

import { useEffect, useId, useState } from "react";

import type { NaturheilpraxisApi } from "../../../shared/application/naturheilpraxis-api.ts";
import type { BehandlungenErmittelnQueryResult } from "../../../shared/domain/behandlungsansicht.ts";
import type { Diagnose } from "../../../shared/domain/entities.ts";
import type { Patientennummer } from "../../../shared/domain/value-objects.ts";

type Behandlung = BehandlungenErmittelnQueryResult[number];

// The tab Behandlung of the Karteikarte: the course of the treatment, grouped
// by day, the newest first.
export function PatientBehandlung({
  api,
  patientennummer,
  stand,
  onDiagnoseBearbeiten,
  onDiagnoseLoeschen,
}: {
  api: NaturheilpraxisApi;
  patientennummer: Patientennummer;
  // A change loads the treatment again.
  stand: number;
  onDiagnoseBearbeiten: (diagnose: Diagnose) => void;
  onDiagnoseLoeschen: (diagnose: Diagnose) => void;
}) {
  const [behandlungen, setBehandlungen] = useState<BehandlungenErmittelnQueryResult>();
  const [fehler, setFehler] = useState<string>();

  useEffect(() => {
    let aktuell = true;
    api.behandlungenErmitteln({ type: "behandlungen-ermitteln", parameters: { patientennummer } }).then(
      (behandlungen) => {
        if (aktuell) {
          setBehandlungen(behandlungen);
        }
      },
      () => {
        if (aktuell) {
          setFehler("Die Behandlung konnte nicht geladen werden. Bitte starten Sie die Anwendung neu.");
        }
      },
    );
    return () => {
      aktuell = false;
    };
  }, [api, patientennummer, stand]);

  if (fehler !== undefined) {
    return (
      <div className="alert alert-danger" role="alert">
        {fehler}
      </div>
    );
  }
  if (behandlungen === undefined) {
    return (
      <p className="text-body-secondary" role="status">
        <span className="spinner-border spinner-border-sm me-2" aria-hidden="true"></span>
        Die Behandlung wird geladen …
      </p>
    );
  }
  if (behandlungen.length === 0) {
    return (
      <div className="text-center text-body-secondary border rounded bg-body p-5">
        Für diesen Patienten wurde noch nichts erfasst. Beginnen Sie mit <em>Diagnose stellen</em>.
      </div>
    );
  }

  const tage = Map.groupBy(behandlungen, (behandlung) => behandlung.eintrag.datum);
  return (
    <>
      <h2 className="h5 mb-3">Behandlungsverlauf</h2>
      {[...tage].map(([datum, eintraege]) => (
        <Tag
          key={datum}
          datum={datum}
          eintraege={eintraege}
          onDiagnoseBearbeiten={onDiagnoseBearbeiten}
          onDiagnoseLoeschen={onDiagnoseLoeschen}
        />
      ))}
    </>
  );
}

function Tag({
  datum,
  eintraege,
  onDiagnoseBearbeiten,
  onDiagnoseLoeschen,
}: {
  datum: string;
  eintraege: readonly Behandlung[];
  onDiagnoseBearbeiten: (diagnose: Diagnose) => void;
  onDiagnoseLoeschen: (diagnose: Diagnose) => void;
}) {
  const titleId = useId();
  return (
    <section className="card shadow-sm mb-3" aria-labelledby={titleId}>
      <div className="card-header">
        <h3 id={titleId} className="h6 mb-0">
          {datumLang(datum)}
        </h3>
      </div>
      <ul className="list-group list-group-flush">
        {eintraege.map(({ eintrag: diagnose }) => (
          <li key={diagnose.diagnoseId} className="list-group-item d-flex gap-3 align-items-start">
            <span className="badge bg-info-subtle text-info-emphasis p-2">
              <i className="fa-solid fa-stethoscope" aria-hidden="true"></i>
            </span>
            <div className="me-auto">
              <div className="small text-body-secondary">
                Diagnose{" "}
                <span className="badge rounded-pill bg-primary-subtle text-primary-emphasis border border-primary-subtle">
                  {diagnose.praxiskuerzel}
                </span>
              </div>
              <div className="fw-semibold">{diagnose.text}</div>
            </div>
            <div className="btn-group btn-group-sm">
              <button
                type="button"
                className="btn btn-outline-secondary"
                aria-label="Diagnose bearbeiten"
                title="Bearbeiten"
                onClick={() => onDiagnoseBearbeiten(diagnose)}
              >
                <i className="fa-solid fa-pen" aria-hidden="true"></i>
              </button>
              <button
                type="button"
                className="btn btn-outline-danger"
                aria-label="Diagnose löschen"
                title="Löschen"
                onClick={() => onDiagnoseLoeschen(diagnose)}
              >
                <i className="fa-solid fa-trash" aria-hidden="true"></i>
              </button>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}

// Like "Montag, 14. September 2026".
function datumLang(isoDatum: string): string {
  return new Date(`${isoDatum}T00:00:00`).toLocaleDateString("de-DE", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}
