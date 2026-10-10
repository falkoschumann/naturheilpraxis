// Copyright (c) 2026 Falko Schumann. MIT license.

import { useState } from "react";

import type { DatabaseApi, DatabaseStatus } from "../../../shared/application/database-api.ts";

type Aktion = "anlegen" | "oeffnen" | "erneut";

// Shown as long as no database is open: on the first start and when the
// database opened last is missing.
export function StartPage({
  database,
  status,
  onOpened,
}: {
  database: DatabaseApi;
  status: DatabaseStatus;
  onOpened: (status: DatabaseStatus) => void;
}) {
  const [fehler, setFehler] = useState(status.errorMessage);
  const [laeuft, setLaeuft] = useState<Aktion>();
  // Like the menu of the main process, named like the file menu of the system.
  const dateimenue = navigator.userAgent.includes("Macintosh") ? "Ablage" : "Datei";

  async function ausfuehren(aktion: Aktion, waehle: () => Promise<DatabaseStatus>) {
    setLaeuft(aktion);
    let ergebnis: DatabaseStatus;
    try {
      ergebnis = await waehle();
    } catch {
      ergebnis = { errorMessage: "Die Datenbank konnte nicht geöffnet werden. Bitte versuchen Sie es erneut." };
    }
    setLaeuft(undefined);
    if (ergebnis.filename !== undefined) {
      onOpened(ergebnis);
      return;
    }
    // A canceled dialog keeps the message shown before.
    if (ergebnis.errorMessage !== undefined) {
      setFehler(ergebnis.errorMessage);
    }
  }

  return (
    <main className="container py-5" style={{ maxWidth: "40rem" }}>
      <h1 className="h3 mb-3">Willkommen bei Naturheilpraxis</h1>
      <p>
        Wählen Sie, wo die Daten Ihrer Praxen und Patienten gespeichert werden. Legen Sie eine neue Datenbank an oder
        öffnen Sie eine vorhandene, zum Beispiel auf einem Netzlaufwerk. Beim nächsten Start öffnet die Anwendung diese
        Datenbank wieder. Über das Menü <em>{dateimenue}</em> können Sie später eine andere wählen.
      </p>
      {fehler !== undefined && (
        <div className="alert alert-danger d-flex align-items-start gap-2" role="alert">
          <i className="fa-solid fa-circle-exclamation mt-1" aria-hidden="true"></i>
          <div className="flex-grow-1">
            {fehler}
            {status.retryFilename !== undefined && (
              <div className="mt-2">
                <button
                  type="button"
                  className="btn btn-sm btn-outline-danger"
                  disabled={laeuft !== undefined}
                  onClick={() => void ausfuehren("erneut", () => database.reopenDatabase())}
                >
                  <Symbol laeuft={laeuft === "erneut"} icon="fa-rotate-right" />
                  Erneut versuchen
                </button>
              </div>
            )}
          </div>
        </div>
      )}
      <div className="d-flex flex-wrap gap-2">
        <button
          type="button"
          className="btn btn-primary"
          autoFocus
          disabled={laeuft !== undefined}
          onClick={() => void ausfuehren("anlegen", () => database.createDatabase())}
        >
          <Symbol laeuft={laeuft === "anlegen"} icon="fa-file-circle-plus" />
          Neue Datenbank anlegen…
        </button>
        <button
          type="button"
          className="btn btn-outline-primary"
          disabled={laeuft !== undefined}
          onClick={() => void ausfuehren("oeffnen", () => database.openDatabase())}
        >
          <Symbol laeuft={laeuft === "oeffnen"} icon="fa-folder-open" />
          Vorhandene Datenbank öffnen…
        </button>
      </div>
    </main>
  );
}

function Symbol({ laeuft, icon }: { laeuft: boolean; icon: string }) {
  return laeuft ? (
    <span className="spinner-border spinner-border-sm me-2" aria-hidden="true"></span>
  ) : (
    <i className={`fa-solid ${icon} me-2`} aria-hidden="true"></i>
  );
}
