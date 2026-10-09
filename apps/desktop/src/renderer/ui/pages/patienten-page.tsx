// Copyright (c) 2026 Falko Schumann. MIT license.

import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router";

import type { NaturheilpraxisApi } from "../../../shared/application/naturheilpraxis-api.ts";
import type { PatientenErmittelnQueryResult } from "../../../shared/domain/patientenansicht.ts";
import { formatDatum } from "../../../shared/domain/value-objects.ts";
import { PatientAufnehmenDialog } from "./patient-aufnehmen-dialog.tsx";

export function PatientenPage({ api }: { api: NaturheilpraxisApi }) {
  const [suchbegriff, setSuchbegriff] = useState("");
  const [patienten, setPatienten] = useState<PatientenErmittelnQueryResult>();
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
      <div className="d-flex flex-wrap align-items-center justify-content-between gap-2 mb-3">
        <h1 className="h3 mb-0">Patienten</h1>
        <button type="button" className="btn btn-primary" onClick={() => setAufnehmen(true)}>
          <i className="fa-solid fa-user-plus me-1" aria-hidden="true"></i>
          Patient aufnehmen
        </button>
      </div>
      {fehler !== undefined && (
        <div className="alert alert-danger" role="alert">
          {fehler}
        </div>
      )}
      <div className="card shadow-sm">
        <div className="card-body border-bottom">
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
          <div id="patienten-suche-hilfe" className="form-text">
            Alle Wörter müssen vorkommen. Setzen Sie Wörter mit Leerzeichen in Anführungszeichen, z. B. "Lindenweg 5".
          </div>
        </div>
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead>
              <tr>
                <th scope="col">Nr.</th>
                <th scope="col">Name</th>
                <th scope="col">Geburtsdatum</th>
                <th scope="col">Ort</th>
                <th scope="col">Praxis</th>
              </tr>
            </thead>
            <tbody>
              {patienten === undefined && fehler === undefined && (
                <tr>
                  <td colSpan={5} className="text-center text-body-secondary py-4" role="status">
                    <span className="spinner-border spinner-border-sm me-2" aria-hidden="true"></span>
                    Die Patienten werden geladen …
                  </td>
                </tr>
              )}
              {patienten?.length === 0 && (
                <tr>
                  <td colSpan={5} className="text-center text-body-secondary py-4">
                    {suchbegriff.trim() === ""
                      ? "Es ist noch kein Patient aufgenommen. Nehmen Sie mit „Patient aufnehmen“ den ersten Patienten auf."
                      : "Kein Patient gefunden. Prüfen Sie die Schreibweise oder nehmen Sie einen neuen Patienten auf."}
                  </td>
                </tr>
              )}
              {patienten?.map((patient) => (
                <tr key={patient.patientennummer}>
                  <td className="text-body-secondary">{patient.patientennummer}</td>
                  <td>
                    <Link to={`/patienten/${patient.patientennummer}`} className="fw-semibold text-decoration-none">
                      {patient.nachname}, {patient.vorname}
                    </Link>
                    {patient.schluesselworte?.map((wort) => (
                      <span key={wort} className="badge text-bg-light border ms-1">
                        {wort}
                      </span>
                    ))}
                  </td>
                  <td>{formatDatum(patient.geburtsdatum)}</td>
                  <td>{patient.ort ?? <span className="text-body-secondary">–</span>}</td>
                  <td>
                    <span className="badge rounded-pill bg-primary-subtle text-primary-emphasis border border-primary-subtle">
                      {patient.praxiskuerzel}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
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
