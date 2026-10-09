// Copyright (c) 2026 Falko Schumann. MIT license.

import { useCallback, useEffect, useId, useState } from "react";

import type { NaturheilpraxisApi } from "../../../shared/application/naturheilpraxis-api.ts";
import type { Praxis } from "../../../shared/domain/entities.ts";
import type {
  PraxenErmittelnQueryResult,
  PraxenErmittelnQueryResultItem,
} from "../../../shared/domain/praxenansicht.ts";
import { Toast } from "../components/toast.tsx";
import { PraxisDialog } from "./praxis-dialog.tsx";

type DialogZustand = Readonly<{ praxis?: never }> | Readonly<{ praxis: Praxis }> | undefined;

export function PraxenPage({ api }: { api: NaturheilpraxisApi }) {
  const [praxen, setPraxen] = useState<PraxenErmittelnQueryResult>();
  const [ladefehler, setLadefehler] = useState<string>();
  const [dialog, setDialog] = useState<DialogZustand>();
  const [meldung, setMeldung] = useState<string>();

  // Each increment loads the Praxen again.
  const [stand, setStand] = useState(0);

  useEffect(() => {
    let aktuell = true;
    api.praxenErmitteln({ type: "praxen-ermitteln", parameters: {} }).then(
      (praxen) => {
        if (aktuell) {
          setPraxen(praxen);
          setLadefehler(undefined);
        }
      },
      () => {
        if (aktuell) {
          setLadefehler("Die Praxen konnten nicht geladen werden. Bitte starten Sie die Anwendung neu.");
        }
      },
    );
    return () => {
      aktuell = false;
    };
  }, [api, stand]);

  async function bearbeiten(praxiskuerzel: string) {
    try {
      const praxis = await api.praxisErmitteln({
        type: "praxis-ermitteln",
        parameters: { praxiskuerzel },
      });
      if (praxis !== undefined) {
        setDialog({ praxis });
      }
    } catch {
      setLadefehler("Die Praxis konnte nicht geladen werden. Bitte versuchen Sie es erneut.");
    }
  }

  const schliesseMeldung = useCallback(() => setMeldung(undefined), []);

  return (
    <>
      <div className="d-flex flex-wrap align-items-center justify-content-between gap-2 mb-3">
        <h1 className="h3 mb-0">Praxen</h1>
        <button type="button" className="btn btn-primary" onClick={() => setDialog({})}>
          <i className="fa-solid fa-plus me-1" aria-hidden="true"></i>
          Praxis anlegen
        </button>
      </div>
      {ladefehler !== undefined && (
        <div className="alert alert-danger" role="alert">
          {ladefehler}
        </div>
      )}
      {praxen === undefined && ladefehler === undefined && (
        <p className="text-body-secondary" role="status">
          <span className="spinner-border spinner-border-sm me-2" aria-hidden="true"></span>
          Die Praxen werden geladen …
        </p>
      )}
      {praxen?.length === 0 && (
        <p className="text-body-secondary">
          Es ist noch keine Praxis angelegt. Legen Sie mit „Praxis anlegen“ die erste Praxis an.
        </p>
      )}
      {praxen !== undefined && praxen.length > 0 && (
        <div className="row g-3">
          {praxen.map((praxis) => (
            <div key={praxis.praxiskuerzel} className="col-md-6">
              <PraxisKarte praxis={praxis} onBearbeiten={() => void bearbeiten(praxis.praxiskuerzel)} />
            </div>
          ))}
        </div>
      )}
      {dialog !== undefined && (
        <PraxisDialog
          api={api}
          praxis={dialog.praxis}
          onClose={() => setDialog(undefined)}
          onSaved={(message) => {
            setDialog(undefined);
            setMeldung(message);
            setStand((stand) => stand + 1);
          }}
        />
      )}
      {meldung !== undefined && <Toast message={meldung} onClose={schliesseMeldung} />}
    </>
  );
}

function PraxisKarte({ praxis, onBearbeiten }: { praxis: PraxenErmittelnQueryResultItem; onBearbeiten: () => void }) {
  const titleId = useId();
  const kontakt = [praxis.telefon, praxis.email].filter((value) => value !== undefined);

  return (
    <article className="card shadow-sm h-100" aria-labelledby={titleId}>
      <div className="card-body">
        <div className="d-flex justify-content-between align-items-start">
          <h2 id={titleId} className="h5">
            {praxis.name}
          </h2>
          <span className="badge rounded-pill bg-primary-subtle text-primary-emphasis border border-primary-subtle">
            {praxis.praxiskuerzel}
          </span>
        </div>
        <p className="mb-2">
          {praxis.strasse}
          <br />
          {praxis.postleitzahl} {praxis.ort}
        </p>
        {kontakt.length > 0 && <p className="small text-body-secondary mb-2">{kontakt.join(" · ")}</p>}
        {praxis.rechnungstext !== undefined && <p className="small fst-italic mb-0">„{praxis.rechnungstext}“</p>}
      </div>
      <div className="card-footer bg-body text-end">
        <button
          type="button"
          className="btn btn-sm btn-outline-secondary"
          onClick={onBearbeiten}
          aria-label={`${praxis.name} bearbeiten`}
        >
          <i className="fa-solid fa-pen me-1" aria-hidden="true"></i>
          Bearbeiten
        </button>
      </div>
    </article>
  );
}
