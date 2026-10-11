// Copyright (c) 2026 Falko Schumann. MIT license.

import { useCallback, useEffect, useState } from "react";

import {
  rechnungsvorlageUrl,
  type RechnungsvorlagenApi,
  type RechnungsvorlagenErmittelnResult,
  type RechnungsvorlagenErmittelnResultItem,
  type RechnungsvorlageStatus,
} from "../../../shared/application/rechnungsvorlagen-api.ts";
import { ConfirmDialog } from "../components/confirm-dialog.tsx";
import { PageHeader } from "../components/sticky-header.tsx";
import { Toast, type Meldung } from "../components/toast.tsx";

type Vorlage = RechnungsvorlagenErmittelnResultItem;

const herkunftLabels: Record<Vorlage["herkunft"], string> = {
  eigene: "Eigene Vorlage",
  standardvorlage: "Standardvorlage",
  allgemeine: "Allgemeine Vorlage",
};

// The allgemeine Vorlage has no Praxiskürzel.
function schluessel(vorlage: Vorlage): string {
  return vorlage.praxiskuerzel ?? "";
}

// Shows the Rechnungsvorlagen with a preview of Beispieldaten. The user edits
// a Vorlage outside the app: export, change, import.
export function RechnungsvorlagenPage({ rechnungsvorlagen }: { rechnungsvorlagen: RechnungsvorlagenApi }) {
  const [vorlagen, setVorlagen] = useState<RechnungsvorlagenErmittelnResult>();
  const [ladefehler, setLadefehler] = useState<string>();
  const [gewaehlt, setGewaehlt] = useState("");
  const [dialog, setDialog] = useState<"importieren" | "zuruecksetzen">();
  const [arbeitet, setArbeitet] = useState(false);
  const [meldung, setMeldung] = useState<Meldung>();
  // Each increment loads the Vorlagen and the preview again.
  const [stand, setStand] = useState(0);

  useEffect(() => {
    let aktuell = true;
    rechnungsvorlagen.rechnungsvorlagenErmitteln().then(
      (vorlagen) => {
        if (aktuell) {
          setVorlagen(vorlagen);
          setLadefehler(undefined);
        }
      },
      () => {
        if (aktuell) {
          setLadefehler("Die Rechnungsvorlagen konnten nicht geladen werden. Bitte starten Sie die Anwendung neu.");
        }
      },
    );
    return () => {
      aktuell = false;
    };
  }, [rechnungsvorlagen, stand]);

  const schliesseMeldung = useCallback(() => setMeldung(undefined), []);

  const vorlage = vorlagen?.find((vorlage) => schluessel(vorlage) === gewaehlt) ?? vorlagen?.[0];

  async function fuehreAus(
    aktion: () => Promise<RechnungsvorlageStatus>,
    erfolg: string,
    fehler: string,
  ): Promise<void> {
    setDialog(undefined);
    setArbeitet(true);
    const status = await aktion().catch(() => ({ completed: false, errorMessage: fehler }));
    setArbeitet(false);
    if (status.completed) {
      setMeldung({ message: erfolg });
      setStand((stand) => stand + 1);
    } else if (status.errorMessage !== undefined) {
      setMeldung({ message: status.errorMessage, fehler: true });
    }
  }

  function exportieren(vorlage: Vorlage) {
    void fuehreAus(
      () => rechnungsvorlagen.rechnungsvorlageExportieren(geltungVon(vorlage)),
      `Die Rechnungsvorlage „${vorlage.bezeichnung}“ wurde exportiert.`,
      "Die Rechnungsvorlage konnte nicht exportiert werden. Bitte versuchen Sie es erneut.",
    );
  }

  function importieren(vorlage: Vorlage) {
    void fuehreAus(
      () => rechnungsvorlagen.rechnungsvorlageImportieren(geltungVon(vorlage)),
      `Die Rechnungsvorlage „${vorlage.bezeichnung}“ wurde importiert.`,
      "Die Rechnungsvorlage konnte nicht importiert werden. Bitte versuchen Sie es erneut.",
    );
  }

  function zuruecksetzen(vorlage: Vorlage) {
    void fuehreAus(
      () => rechnungsvorlagen.rechnungsvorlageZuruecksetzen(geltungVon(vorlage)),
      `Die Rechnungsvorlage „${vorlage.bezeichnung}“ wurde zurückgesetzt.`,
      "Die Rechnungsvorlage konnte nicht zurückgesetzt werden. Bitte versuchen Sie es erneut.",
    );
  }

  return (
    <>
      <PageHeader>
        <h1 className="h3 mb-0">Rechnungsvorlagen</h1>
      </PageHeader>
      <p className="text-body-secondary">
        Eine Praxis ohne eigene Vorlage nutzt die allgemeine Vorlage. Um eine Vorlage zu ändern, exportieren Sie sie,
        bearbeiten die HTML-Datei mit einem Editor Ihrer Wahl und importieren sie wieder.
      </p>
      {ladefehler !== undefined && (
        <div className="alert alert-danger" role="alert">
          {ladefehler}
        </div>
      )}
      {vorlagen === undefined && ladefehler === undefined && (
        <p className="text-body-secondary" role="status">
          <span className="spinner-border spinner-border-sm me-2" aria-hidden="true"></span>
          Die Rechnungsvorlagen werden geladen …
        </p>
      )}
      {vorlagen !== undefined && vorlage !== undefined && (
        <div className="row g-3">
          <div className="col-lg-4">
            <div className="list-group" role="group" aria-label="Rechnungsvorlagen">
              {vorlagen.map((eintrag) => {
                const aktiv = schluessel(eintrag) === schluessel(vorlage);
                return (
                  <button
                    key={schluessel(eintrag)}
                    type="button"
                    className={`list-group-item list-group-item-action d-flex justify-content-between align-items-center gap-2${aktiv ? " active" : ""}`}
                    aria-current={aktiv ? "true" : undefined}
                    onClick={() => setGewaehlt(schluessel(eintrag))}
                  >
                    <span>
                      {eintrag.bezeichnung}
                      {eintrag.praxiskuerzel !== undefined && (
                        <span className={`small ms-1 ${aktiv ? "" : "text-body-secondary"}`}>
                          ({eintrag.praxiskuerzel})
                        </span>
                      )}
                    </span>
                    <span
                      className={`badge rounded-pill ${eintrag.herkunft === "eigene" ? "text-bg-primary" : "text-bg-light border"}`}
                    >
                      {herkunftLabels[eintrag.herkunft]}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
          <div className="col-lg-8">
            <div className="d-flex flex-wrap align-items-center gap-2 mb-3">
              <h2 className="h5 mb-0 me-auto">
                {vorlage.bezeichnung}: {herkunftLabels[vorlage.herkunft]}
              </h2>
              {vorlage.herkunft === "eigene" && (
                <button
                  type="button"
                  className="btn btn-outline-danger"
                  disabled={arbeitet}
                  onClick={() => setDialog("zuruecksetzen")}
                >
                  <i className="fa-solid fa-rotate-left me-1" aria-hidden="true"></i>
                  Zurücksetzen
                </button>
              )}
              <button
                type="button"
                className="btn btn-outline-secondary"
                disabled={arbeitet}
                onClick={() => exportieren(vorlage)}
              >
                <i className="fa-solid fa-file-export me-1" aria-hidden="true"></i>
                Exportieren …
              </button>
              <button
                type="button"
                className="btn btn-primary"
                disabled={arbeitet}
                onClick={() => (vorlage.herkunft === "eigene" ? setDialog("importieren") : importieren(vorlage))}
              >
                {arbeitet ? (
                  <span className="spinner-border spinner-border-sm me-1" aria-hidden="true"></span>
                ) : (
                  <i className="fa-solid fa-file-import me-1" aria-hidden="true"></i>
                )}
                Importieren …
              </button>
            </div>
            <p className="small text-body-secondary mb-2">Vorschau mit Beispieldaten</p>
            {/* The Vorlage may neither run a script nor reach the app. */}
            <iframe
              key={`${schluessel(vorlage)}-${stand}`}
              className="card shadow-sm d-block rechnung"
              title="Vorschau der Rechnungsvorlage"
              sandbox=""
              src={rechnungsvorlageUrl(geltungVon(vorlage))}
            ></iframe>
          </div>
        </div>
      )}
      {dialog === "importieren" && vorlage !== undefined && (
        <ConfirmDialog
          title="Rechnungsvorlage ersetzen?"
          confirmLabel="Datei wählen und ersetzen"
          onConfirm={() => importieren(vorlage)}
          onCancel={() => setDialog(undefined)}
        >
          <p className="mb-0">
            Die eigene Vorlage „{vorlage.bezeichnung}“ wird durch die gewählte Datei ersetzt. Exportieren Sie sie
            vorher, wenn Sie sie behalten möchten.
          </p>
        </ConfirmDialog>
      )}
      {dialog === "zuruecksetzen" && vorlage !== undefined && (
        <ConfirmDialog
          title="Rechnungsvorlage zurücksetzen?"
          confirmLabel="Zurücksetzen"
          onConfirm={() => zuruecksetzen(vorlage)}
          onCancel={() => setDialog(undefined)}
        >
          <p className="mb-0">
            {vorlage.praxiskuerzel === undefined
              ? "Die allgemeine Vorlage wird wieder die Standardvorlage. Praxen ohne eigene Vorlage nutzen dann die Standardvorlage."
              : `Die eigene Vorlage wird entfernt. „${vorlage.bezeichnung}“ nutzt dann wieder die allgemeine Vorlage.`}{" "}
            Exportieren Sie die eigene Vorlage vorher, wenn Sie sie behalten möchten.
          </p>
        </ConfirmDialog>
      )}
      {meldung !== undefined && <Toast {...meldung} onClose={schliesseMeldung} />}
    </>
  );
}

function geltungVon(vorlage: Vorlage) {
  return vorlage.praxiskuerzel === undefined ? {} : { praxiskuerzel: vorlage.praxiskuerzel };
}
