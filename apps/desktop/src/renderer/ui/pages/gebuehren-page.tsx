// Copyright (c) 2026 Falko Schumann. MIT license.

import { useCallback, useEffect, useState } from "react";

import type { CommandStatus, NaturheilpraxisApi } from "../../../shared/application/naturheilpraxis-api.ts";
import type { Gebuehr } from "../../../shared/domain/entities.ts";
import type { GebuehrenErmittelnQueryResult } from "../../../shared/domain/gebuehrenansicht.ts";
import { formatEuro } from "../../../shared/domain/value-objects.ts";
import { ConfirmDialog } from "../components/confirm-dialog.tsx";
import { Toast, type ToastAction } from "../components/toast.tsx";
import { GebuehrDialog } from "./gebuehr-dialog.tsx";

type DialogZustand =
  | Readonly<{ art: "anlegen" }>
  | Readonly<{ art: "bearbeiten"; gebuehr: Gebuehr }>
  | Readonly<{ art: "entfernen"; gebuehr: Gebuehr }>
  | undefined;

type Meldung = Readonly<{ message: string; action?: ToastAction }>;

export function GebuehrenPage({ api }: { api: NaturheilpraxisApi }) {
  const [gebuehren, setGebuehren] = useState<GebuehrenErmittelnQueryResult>();
  const [fehler, setFehler] = useState<string>();
  const [suche, setSuche] = useState("");
  const [dialog, setDialog] = useState<DialogZustand>();
  const [meldung, setMeldung] = useState<Meldung>();
  // Each increment loads the Gebühren again.
  const [stand, setStand] = useState(0);

  useEffect(() => {
    let aktuell = true;
    api.gebuehrenErmitteln({ type: "gebuehren-ermitteln", parameters: {} }).then(
      (gebuehren) => {
        if (aktuell) {
          setGebuehren(gebuehren);
        }
      },
      () => {
        if (aktuell) {
          setFehler("Die Gebühren konnten nicht geladen werden. Bitte starten Sie die Anwendung neu.");
        }
      },
    );
    return () => {
      aktuell = false;
    };
  }, [api, stand]);

  const neuLaden = () => setStand((stand) => stand + 1);

  async function entfernen(gebuehr: Gebuehr) {
    setDialog(undefined);
    const status = await sende(
      () => api.gebuehrEntfernen({ type: "gebuehr-entfernen", data: { ziffer: gebuehr.ziffer } }),
      "Die Gebühr konnte nicht entfernt werden. Bitte versuchen Sie es erneut.",
    );
    if (!status.success) {
      setFehler(status.errorMessage);
      return;
    }

    setFehler(undefined);
    setMeldung({
      message: `Die Gebühr ${gebuehr.ziffer} wurde entfernt.`,
      action: { label: "Rückgängig", onAction: () => void wiederherstellen(gebuehr) },
    });
    neuLaden();
  }

  async function wiederherstellen(gebuehr: Gebuehr) {
    const status = await sende(
      () => api.gebuehrAnlegen({ type: "gebuehr-anlegen", data: gebuehr }),
      "Die Gebühr konnte nicht wiederhergestellt werden. Bitte legen Sie sie erneut an.",
    );
    if (!status.success) {
      setFehler(status.errorMessage);
      return;
    }

    setMeldung({ message: `Die Gebühr ${gebuehr.ziffer} ist wieder im Gebührenverzeichnis.` });
    neuLaden();
  }

  const schliesseMeldung = useCallback(() => setMeldung(undefined), []);

  const begriff = suche.trim().toLowerCase();
  const gefunden = gebuehren?.filter((gebuehr) =>
    `${gebuehr.ziffer} ${gebuehr.bezeichnung}`.toLowerCase().includes(begriff),
  );

  return (
    <>
      <div className="d-flex flex-wrap align-items-center justify-content-between gap-2 mb-3">
        <h1 className="h3 mb-0">Gebührenverzeichnis</h1>
        <button type="button" className="btn btn-primary" onClick={() => setDialog({ art: "anlegen" })}>
          <i className="fa-solid fa-plus me-1" aria-hidden="true"></i>
          Gebühr anlegen
        </button>
      </div>
      {fehler !== undefined && (
        <div className="alert alert-danger" role="alert">
          {fehler}
        </div>
      )}
      {gebuehren === undefined && fehler === undefined && (
        <p className="text-body-secondary" role="status">
          <span className="spinner-border spinner-border-sm me-2" aria-hidden="true"></span>
          Die Gebühren werden geladen …
        </p>
      )}
      {gebuehren?.length === 0 && (
        <p className="text-body-secondary">
          Es ist noch keine Gebühr angelegt. Legen Sie mit „Gebühr anlegen“ die erste Gebühr an.
        </p>
      )}
      {gefunden !== undefined && gebuehren !== undefined && gebuehren.length > 0 && (
        <div className="card shadow-sm">
          <div className="card-body border-bottom">
            <label htmlFor="gebuehr-suche" className="visually-hidden">
              Gebühren durchsuchen
            </label>
            <input
              id="gebuehr-suche"
              type="search"
              className="form-control"
              placeholder="Suchen nach Ziffer oder Bezeichnung …"
              value={suche}
              onChange={(event) => setSuche(event.target.value)}
            />
          </div>
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead>
                <tr>
                  <th scope="col">Ziffer</th>
                  <th scope="col">Bezeichnung</th>
                  <th scope="col" className="text-end">
                    Betrag
                  </th>
                  <th scope="col" className="text-end">
                    <span className="visually-hidden">Aktionen</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {gefunden.map((gebuehr) => (
                  <tr key={gebuehr.ziffer}>
                    <td className="fw-semibold">{gebuehr.ziffer}</td>
                    <td>{gebuehr.bezeichnung}</td>
                    <td className="text-end text-nowrap">{formatEuro(gebuehr.betrag)}</td>
                    <td className="text-end text-nowrap">
                      <div className="btn-group btn-group-sm">
                        <button
                          type="button"
                          className="btn btn-outline-secondary"
                          aria-label={`Gebühr ${gebuehr.ziffer} bearbeiten`}
                          title="Bearbeiten"
                          onClick={() => setDialog({ art: "bearbeiten", gebuehr })}
                        >
                          <i className="fa-solid fa-pen" aria-hidden="true"></i>
                        </button>
                        <button
                          type="button"
                          className="btn btn-outline-danger"
                          aria-label={`Gebühr ${gebuehr.ziffer} entfernen`}
                          title="Entfernen"
                          onClick={() => setDialog({ art: "entfernen", gebuehr })}
                        >
                          <i className="fa-solid fa-trash" aria-hidden="true"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {gefunden.length === 0 && (
                  <tr>
                    <td colSpan={4} className="text-center text-body-secondary py-4">
                      Keine Gebühr gefunden.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
      {(dialog?.art === "anlegen" || dialog?.art === "bearbeiten") && (
        <GebuehrDialog
          api={api}
          gebuehr={dialog.art === "bearbeiten" ? dialog.gebuehr : undefined}
          onClose={() => setDialog(undefined)}
          onSaved={(message) => {
            setDialog(undefined);
            setMeldung({ message });
            neuLaden();
          }}
        />
      )}
      {dialog?.art === "entfernen" && (
        <ConfirmDialog
          title="Gebühr entfernen?"
          confirmLabel="Entfernen"
          onConfirm={() => void entfernen(dialog.gebuehr)}
          onCancel={() => setDialog(undefined)}
        >
          <p className="mb-0">
            Die Gebühr {dialog.gebuehr.ziffer} „{dialog.gebuehr.bezeichnung}“ wird aus dem Gebührenverzeichnis entfernt.
            Bereits erfasste Leistungen mit dieser Ziffer bleiben unverändert.
          </p>
        </ConfirmDialog>
      )}
      {meldung !== undefined && <Toast message={meldung.message} action={meldung.action} onClose={schliesseMeldung} />}
    </>
  );
}

// A failed message to the main process becomes a rejection with the given
// message.
async function sende(command: () => Promise<CommandStatus>, errorMessage: string): Promise<CommandStatus> {
  try {
    return await command();
  } catch {
    return { success: false, errorMessage };
  }
}
