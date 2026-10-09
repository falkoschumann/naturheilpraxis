// Copyright (c) 2026 Falko Schumann. MIT license.

import { useState, type FormEvent } from "react";

import type { CommandStatus, NaturheilpraxisApi } from "../../../shared/application/naturheilpraxis-api.ts";
import type { Gebuehr } from "../../../shared/domain/entities.ts";
import { parseEuro, type Euro } from "../../../shared/domain/value-objects.ts";
import { Dialog } from "../components/dialog.tsx";
import { TextField } from "../components/text-field.tsx";

type Werte = Record<"ziffer" | "betrag" | "bezeichnung", string>;

type Feld = keyof Werte;

const betragHinweis = "Bitte geben Sie einen Betrag wie 12,50 an.";

// Creates a Gebühr or changes it. Without a Gebühr the dialog creates one. The
// input is kept when the Gebühr cannot be saved.
export function GebuehrDialog({
  api,
  gebuehr,
  onClose,
  onSaved,
}: {
  api: NaturheilpraxisApi;
  gebuehr?: Gebuehr;
  onClose: () => void;
  onSaved: (message: string) => void;
}) {
  const bearbeiten = gebuehr !== undefined;
  const [werte, setWerte] = useState<Werte>({
    ziffer: gebuehr?.ziffer ?? "",
    betrag: gebuehr === undefined ? "" : betragAlsEingabe(gebuehr.betrag),
    bezeichnung: gebuehr?.bezeichnung ?? "",
  });
  const [ungueltig, setUngueltig] = useState<ReadonlySet<Feld>>(new Set());
  const [fehler, setFehler] = useState<string>();
  const [speichert, setSpeichert] = useState(false);

  function feld(name: Feld) {
    return {
      name,
      value: werte[name],
      onChange: (value: string) => {
        setWerte((werte) => ({ ...werte, [name]: value }));
        setUngueltig((ungueltig) => {
          const neu = new Set(ungueltig);
          neu.delete(name);
          return neu;
        });
      },
      required: true,
      invalid: ungueltig.has(name),
    };
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const betrag = parseEuro(werte.betrag);
    const fehlend = (["ziffer", "betrag", "bezeichnung"] as const).filter((name) =>
      name === "betrag" ? betrag === undefined : werte[name].trim() === "",
    );
    setUngueltig(new Set(fehlend));
    const [erstesFehlendes] = fehlend;
    if (erstesFehlendes !== undefined || betrag === undefined) {
      setFehler("Bitte prüfen Sie die markierten Felder.");
      const element = event.currentTarget.elements.namedItem(erstesFehlendes ?? "betrag");
      if (element instanceof HTMLElement) {
        element.focus();
      }
      return;
    }

    setFehler(undefined);
    setSpeichert(true);
    const data: Gebuehr = { ziffer: werte.ziffer.trim(), bezeichnung: werte.bezeichnung.trim(), betrag };
    let status: CommandStatus;
    try {
      status = bearbeiten
        ? await api.gebuehrAendern({ type: "gebuehr-aendern", data })
        : await api.gebuehrAnlegen({ type: "gebuehr-anlegen", data });
    } catch {
      status = {
        success: false,
        errorMessage: "Die Gebühr konnte nicht gespeichert werden. Bitte versuchen Sie es erneut.",
      };
    }
    setSpeichert(false);
    if (status.success) {
      onSaved(bearbeiten ? "Die Gebühr wurde geändert." : "Die Gebühr wurde angelegt.");
    } else {
      setFehler(status.errorMessage);
    }
  }

  return (
    <Dialog title={bearbeiten ? `Gebühr ${gebuehr.ziffer} bearbeiten` : "Gebühr anlegen"} onClose={onClose}>
      <form noValidate onSubmit={(event) => void handleSubmit(event)}>
        <div className="modal-body">
          {fehler !== undefined && (
            <div className="alert alert-danger" role="alert">
              <i className="fa-solid fa-circle-exclamation me-2" aria-hidden="true"></i>
              {fehler} Ihre Eingaben bleiben erhalten.
            </div>
          )}
          <div className="row g-3">
            <TextField
              label="Ziffer"
              className="col-md-4"
              {...feld("ziffer")}
              readOnly={bearbeiten}
              data-autofocus={!bearbeiten || undefined}
              help={bearbeiten ? "Die Ziffer kann nicht geändert werden." : "Meist aus der GebüH, z. B. 20.1."}
            />
            <TextField
              label="Betrag (€)"
              className="col-md-8"
              inputMode="decimal"
              invalidMessage={betragHinweis}
              {...feld("betrag")}
            />
            <TextField label="Bezeichnung" rows={2} data-autofocus={bearbeiten || undefined} {...feld("bezeichnung")} />
            {bearbeiten && (
              <p className="col-12 small text-body-secondary mb-0">
                Bereits erfasste Leistungen behalten ihre Bezeichnung und ihren Betrag.
              </p>
            )}
          </div>
        </div>
        <div className="modal-footer">
          <span className="me-auto small text-body-secondary">
            <span className="text-danger">*</span> Pflichtfeld
          </span>
          <button type="button" className="btn btn-outline-secondary" onClick={onClose}>
            Abbrechen
          </button>
          <button type="submit" className="btn btn-primary" disabled={speichert}>
            {speichert && <span className="spinner-border spinner-border-sm me-2" aria-hidden="true"></span>}
            {bearbeiten ? "Speichern" : "Gebühr anlegen"}
          </button>
        </div>
      </form>
    </Dialog>
  );
}

// Shows the amount without currency sign, as it is typed.
function betragAlsEingabe(betrag: Euro): string {
  return (betrag.cents / 100).toFixed(2).replace(".", ",");
}
