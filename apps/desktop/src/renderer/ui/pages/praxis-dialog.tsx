// Copyright (c) 2026 Falko Schumann. MIT license.

import { useState, type FormEvent } from "react";

import type { CommandStatus, NaturheilpraxisApi } from "../../../shared/application/naturheilpraxis-api.ts";
import type { Praxis } from "../../../shared/domain/entities.ts";
import { Dialog } from "../components/dialog.tsx";
import { TextField } from "../components/text-field.tsx";

type Werte = Record<
  | "praxiskuerzel"
  | "name"
  | "strasse"
  | "zusatz"
  | "postleitzahl"
  | "ort"
  | "staat"
  | "telefon"
  | "mobiltelefon"
  | "email"
  | "website"
  | "rechnungstext",
  string
>;

type Feld = keyof Werte;

const pflichtfelder: readonly Feld[] = ["praxiskuerzel", "name", "strasse", "postleitzahl", "ort"];

// Creates a Praxis or changes its data. Without a Praxis the dialog creates
// one. The input is kept when the Praxis cannot be saved.
export function PraxisDialog({
  api,
  praxis,
  onClose,
  onSaved,
}: {
  api: NaturheilpraxisApi;
  praxis?: Praxis;
  onClose: () => void;
  onSaved: (message: string) => void;
}) {
  const bearbeiten = praxis !== undefined;
  const [werte, setWerte] = useState<Werte>(() => werteAus(praxis));
  const [ungueltig, setUngueltig] = useState<ReadonlySet<Feld>>(new Set());
  const [fehler, setFehler] = useState<string>();
  const [speichert, setSpeichert] = useState(false);

  function feld(name: Feld) {
    return {
      name,
      value: werte[name],
      onChange: (value: string) => {
        setWerte((werte) => ({ ...werte, [name]: value }));
        if (ungueltig.has(name)) {
          setUngueltig((ungueltig) => {
            const neu = new Set(ungueltig);
            neu.delete(name);
            return neu;
          });
        }
      },
      required: pflichtfelder.includes(name),
      invalid: ungueltig.has(name),
    };
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const fehlend = pflichtfelder.filter((name) => werte[name].trim() === "");
    setUngueltig(new Set(fehlend));
    const [erstesFehlendes] = fehlend;
    if (erstesFehlendes !== undefined) {
      setFehler("Bitte prüfen Sie die markierten Felder.");
      const element = event.currentTarget.elements.namedItem(erstesFehlendes);
      if (element instanceof HTMLElement) {
        element.focus();
      }
      return;
    }

    setFehler(undefined);
    setSpeichert(true);
    const data = praxisAus(werte);
    let status: CommandStatus;
    try {
      status = bearbeiten
        ? await api.praxisdatenAendern({ type: "praxisdaten-aendern", data })
        : await api.praxisAnlegen({ type: "praxis-anlegen", data });
    } catch {
      status = {
        success: false,
        errorMessage: "Die Praxis konnte nicht gespeichert werden. Bitte versuchen Sie es erneut.",
      };
    }
    setSpeichert(false);
    if (status.success) {
      onSaved(bearbeiten ? "Die Praxisdaten wurden geändert." : "Die Praxis wurde angelegt.");
    } else {
      setFehler(status.errorMessage);
    }
  }

  const titel = bearbeiten ? "Praxis bearbeiten" : "Praxis anlegen";
  return (
    <Dialog title={titel} onClose={onClose}>
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
              label="Praxiskürzel"
              className="col-md-4"
              {...feld("praxiskuerzel")}
              readOnly={bearbeiten}
              data-autofocus={!bearbeiten || undefined}
              help={bearbeiten ? "Das Kürzel kann nicht geändert werden." : "Kurz und eindeutig, z. B. PARK."}
              style={{ textTransform: "uppercase" }}
            />
            <TextField label="Name" className="col-md-8" data-autofocus={bearbeiten || undefined} {...feld("name")} />
            <TextField label="Straße und Hausnummer" className="col-md-6" {...feld("strasse")} />
            <TextField label="Adresszusatz" className="col-md-6" {...feld("zusatz")} />
            <TextField label="Postleitzahl" className="col-md-3" {...feld("postleitzahl")} />
            <TextField label="Ort" className="col-md-5" {...feld("ort")} />
            <TextField label="Staat" className="col-md-4" {...feld("staat")} />
            <TextField label="Telefon" type="tel" className="col-md-6" {...feld("telefon")} />
            <TextField label="Mobiltelefon" type="tel" className="col-md-6" {...feld("mobiltelefon")} />
            <TextField label="E-Mail" type="email" className="col-md-6" {...feld("email")} />
            <TextField label="Website" type="url" className="col-md-6" {...feld("website")} />
            <TextField
              label="Rechnungstext"
              rows={3}
              help="Wird in neue Rechnungen dieser Praxis übernommen."
              {...feld("rechnungstext")}
            />
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
            {bearbeiten ? "Speichern" : "Praxis anlegen"}
          </button>
        </div>
      </form>
    </Dialog>
  );
}

function werteAus(praxis?: Praxis): Werte {
  return {
    praxiskuerzel: praxis?.praxiskuerzel ?? "",
    name: praxis?.name ?? "",
    strasse: praxis?.anschrift.strasse ?? "",
    zusatz: praxis?.anschrift.zusatz ?? "",
    postleitzahl: praxis?.anschrift.postleitzahl ?? "",
    ort: praxis?.anschrift.ort ?? "",
    staat: praxis?.anschrift.staat ?? "",
    telefon: praxis?.kontakt?.telefon ?? "",
    mobiltelefon: praxis?.kontakt?.mobiltelefon ?? "",
    email: praxis?.kontakt?.email ?? "",
    website: praxis?.kontakt?.website ?? "",
    rechnungstext: praxis?.rechnungstext ?? "",
  };
}

// Empty optional fields are left out of the Praxis.
function praxisAus(werte: Werte): Praxis {
  const kontakt = ohneLeere({
    telefon: werte.telefon,
    mobiltelefon: werte.mobiltelefon,
    email: werte.email,
    website: werte.website,
  });
  return ohneLeere({
    praxiskuerzel: werte.praxiskuerzel.trim().toUpperCase(),
    name: werte.name.trim(),
    anschrift: ohneLeere({
      strasse: werte.strasse,
      zusatz: werte.zusatz,
      postleitzahl: werte.postleitzahl,
      ort: werte.ort,
      staat: werte.staat,
    }) as Praxis["anschrift"],
    kontakt: Object.keys(kontakt).length === 0 ? undefined : kontakt,
    rechnungstext: werte.rechnungstext,
  }) as Praxis;
}

function ohneLeere<T extends Record<string, unknown>>(werte: T): Partial<T> {
  return Object.fromEntries(
    Object.entries(werte)
      .map(([key, value]) => [key, typeof value === "string" ? value.trim() : value])
      .filter(([, value]) => value !== undefined && value !== ""),
  ) as Partial<T>;
}
