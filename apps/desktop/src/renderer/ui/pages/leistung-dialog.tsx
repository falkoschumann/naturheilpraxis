// Copyright (c) 2026 Falko Schumann. MIT license.

import { useContext, useEffect, useId, useRef, useState, type FormEvent } from "react";

import type { NaturheilpraxisApi } from "../../../shared/application/naturheilpraxis-api.ts";
import type { Leistung } from "../../../shared/domain/entities.ts";
import type { GebuehrenErmittelnQueryResult } from "../../../shared/domain/gebuehrenansicht.ts";
import type { PraxenErmittelnQueryResult } from "../../../shared/domain/praxenansicht.ts";
import {
  formatEuro,
  formatEuroEingabe,
  parseEuro,
  type Patientennummer,
} from "../../../shared/domain/value-objects.ts";
import { Dialog } from "../components/dialog.tsx";
import { SelectField } from "../components/select-field.tsx";
import { sende } from "../components/sende.ts";
import { TextField } from "../components/text-field.tsx";
import { AktuellePraxisContext } from "../layouts/aktuelle-praxis.ts";
import { heute } from "./heute.ts";

type Werte = Record<"datum" | "praxiskuerzel" | "ziffer" | "anzahl" | "einzelbetrag" | "bezeichnung", string>;

type Feld = keyof Werte;

// Records a Leistung for a Patient or changes it. Without a Leistung the dialog
// records one, today and in the current Praxis unless chosen otherwise. The
// Ziffer fills in Bezeichnung and Betrag from the Gebührenverzeichnis.
export function LeistungDialog({
  api,
  patient,
  leistung,
  onClose,
  onSaved,
}: {
  api: NaturheilpraxisApi;
  patient: Readonly<{ patientennummer: Patientennummer; praxiskuerzel: string; name: string }>;
  leistung?: Leistung;
  onClose: () => void;
  // With weitere the dialog stays open for the next Leistung.
  onSaved: (message: string, weitere: boolean) => void;
}) {
  const bearbeiten = leistung !== undefined;
  const aktuellePraxis = useContext(AktuellePraxisContext);
  const [werte, setWerte] = useState<Werte>(() => ({
    datum: leistung?.datum ?? heute(),
    praxiskuerzel: leistung?.praxiskuerzel ?? aktuellePraxis ?? patient.praxiskuerzel,
    ziffer: leistung?.ziffer ?? "",
    anzahl: String(leistung?.anzahl ?? 1),
    einzelbetrag: leistung === undefined ? "" : formatEuroEingabe(leistung.einzelbetrag),
    bezeichnung: leistung?.bezeichnung ?? "",
  }));
  const [ungueltig, setUngueltig] = useState<ReadonlySet<Feld>>(new Set());
  const [hinweis, setHinweis] = useState("");
  const [praxen, setPraxen] = useState<PraxenErmittelnQueryResult>([]);
  const [gebuehren, setGebuehren] = useState<GebuehrenErmittelnQueryResult>([]);
  const [fehler, setFehler] = useState<string>();
  const [speichert, setSpeichert] = useState(false);
  const gebuehrenListeId = useId();
  const formular = useRef<HTMLFormElement>(null);

  useEffect(() => {
    let aktuell = true;
    void Promise.all([
      api.praxenErmitteln({ type: "praxen-ermitteln", parameters: {} }),
      api.gebuehrenErmitteln({ type: "gebuehren-ermitteln", parameters: {} }),
    ]).then(
      ([praxen, gebuehren]) => {
        if (aktuell) {
          setPraxen(praxen);
          setGebuehren(gebuehren);
        }
      },
      // Without the lists only the choice is missing; the form still works.
      () => undefined,
    );
    return () => {
      aktuell = false;
    };
  }, [api]);

  function aendern(name: Feld, wert: string) {
    setWerte((werte) => ({ ...werte, [name]: wert }));
    setUngueltig((ungueltig) => new Set([...ungueltig].filter((feld) => feld !== name)));
  }

  function zifferAendern(ziffer: string) {
    aendern("ziffer", ziffer);
    const gebuehr = gebuehren.find((gebuehr) => gebuehr.ziffer === ziffer.trim());
    if (gebuehr !== undefined) {
      setWerte((werte) => ({
        ...werte,
        bezeichnung: gebuehr.bezeichnung,
        einzelbetrag: formatEuroEingabe(gebuehr.betrag),
      }));
      setUngueltig(
        (ungueltig) => new Set([...ungueltig].filter((feld) => feld !== "bezeichnung" && feld !== "einzelbetrag")),
      );
      setHinweis("Bezeichnung und Betrag aus dem Gebührenverzeichnis übernommen – Sie können sie anpassen.");
    } else if (ziffer.trim() !== "") {
      setHinweis("Ziffer nicht im Gebührenverzeichnis – bitte Bezeichnung und Betrag selbst angeben.");
    } else {
      setHinweis("");
    }
  }

  function feld(name: Feld) {
    return {
      name,
      value: werte[name],
      onChange: (wert: string) => aendern(name, wert),
      required: true,
      invalid: ungueltig.has(name),
    };
  }

  const anzahl = /^\d+$/.test(werte.anzahl.trim()) ? Number(werte.anzahl) : undefined;
  const einzelbetrag = parseEuro(werte.einzelbetrag);
  const gesamt =
    anzahl !== undefined && anzahl >= 1 && einzelbetrag !== undefined
      ? formatEuro({ cents: anzahl * einzelbetrag.cents })
      : "–";

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const weitere = (event.nativeEvent as SubmitEvent).submitter?.getAttribute("name") === "weitere";
    const fehlend = (Object.keys(werte) as Feld[]).filter((name) => {
      switch (name) {
        case "anzahl":
          return anzahl === undefined || anzahl < 1;
        case "einzelbetrag":
          return einzelbetrag === undefined;
        default:
          return werte[name].trim() === "";
      }
    });
    setUngueltig(new Set(fehlend));
    const [erstesFehlendes] = fehlend;
    if (erstesFehlendes !== undefined || anzahl === undefined || einzelbetrag === undefined) {
      setFehler("Bitte prüfen Sie die markierten Felder.");
      const element = event.currentTarget.elements.namedItem(erstesFehlendes ?? "anzahl");
      if (element instanceof HTMLElement) {
        element.focus();
      }
      return;
    }

    setFehler(undefined);
    setSpeichert(true);
    const data = {
      praxiskuerzel: werte.praxiskuerzel,
      datum: werte.datum,
      ziffer: werte.ziffer.trim(),
      bezeichnung: werte.bezeichnung.trim(),
      anzahl,
      einzelbetrag,
    };
    const status = await sende(
      () =>
        bearbeiten
          ? api.leistungAendern({ type: "leistung-aendern", data: { leistungId: leistung.leistungId, ...data } })
          : api.leistungErbringen({
              type: "leistung-erbringen",
              data: { leistungId: crypto.randomUUID(), patientennummer: patient.patientennummer, ...data },
            }),
      "Die Leistung konnte nicht gespeichert werden. Bitte versuchen Sie es erneut.",
    );
    setSpeichert(false);
    if (!status.success) {
      setFehler(status.errorMessage);
      return;
    }

    onSaved(bearbeiten ? "Die Leistung wurde geändert." : `Die Leistung ${data.ziffer} wurde erfasst.`, weitere);
    if (weitere) {
      // Datum and Praxis stay for the next Leistung.
      setWerte((werte) => ({ ...werte, ziffer: "", anzahl: "1", einzelbetrag: "", bezeichnung: "" }));
      setHinweis("");
      const ziffer = formular.current?.elements.namedItem("ziffer");
      if (ziffer instanceof HTMLElement) {
        ziffer.focus();
      }
    }
  }

  return (
    <Dialog title={bearbeiten ? "Leistung bearbeiten" : `Leistung erfassen für ${patient.name}`} onClose={onClose}>
      <form ref={formular} noValidate onSubmit={(event) => void handleSubmit(event)}>
        <div className="modal-body">
          {fehler !== undefined && (
            <div className="alert alert-danger" role="alert">
              <i className="fa-solid fa-circle-exclamation me-2" aria-hidden="true"></i>
              {fehler} Ihre Eingaben bleiben erhalten.
            </div>
          )}
          <datalist id={gebuehrenListeId}>
            {gebuehren.map((gebuehr) => (
              <option key={gebuehr.ziffer} value={gebuehr.ziffer}>
                {gebuehr.bezeichnung} – {formatEuro(gebuehr.betrag)}
              </option>
            ))}
          </datalist>
          <div className="row g-3">
            <TextField label="Datum" type="date" className="col-md-5" {...feld("datum")} />
            <SelectField
              label="Praxis"
              className="col-md-7"
              options={[
                { value: "", label: "– bitte wählen –" },
                ...praxen.map((praxis) => ({
                  value: praxis.praxiskuerzel,
                  label: `${praxis.name} (${praxis.praxiskuerzel})`,
                })),
              ]}
              {...feld("praxiskuerzel")}
            />
            <TextField
              label="Gebührenziffer"
              className="col-md-5"
              list={gebuehrenListeId}
              autoComplete="off"
              data-autofocus={!bearbeiten || undefined}
              help="Ziffer eingeben oder aus dem Gebührenverzeichnis wählen."
              {...feld("ziffer")}
              onChange={zifferAendern}
            />
            <TextField
              label="Anzahl"
              type="number"
              min={1}
              step={1}
              className="col-md-3"
              data-autofocus={bearbeiten || undefined}
              invalidMessage="Die Anzahl muss eine ganze Zahl ab 1 sein."
              {...feld("anzahl")}
            />
            <TextField
              label="Einzelbetrag (€)"
              className="col-md-4"
              inputMode="decimal"
              invalidMessage="Bitte geben Sie einen Betrag wie 12,50 an."
              {...feld("einzelbetrag")}
            />
            <TextField label="Bezeichnung" {...feld("bezeichnung")} />
            <div className="col-12 d-flex justify-content-between align-items-center border-top pt-2">
              <span className="small text-body-secondary" aria-live="polite">
                {hinweis}
              </span>
              <span>
                Gesamt: <strong>{gesamt}</strong>
              </span>
            </div>
          </div>
        </div>
        <div className="modal-footer">
          <span className="me-auto small text-body-secondary">
            <span className="text-danger">*</span> Pflichtfeld
          </span>
          <button type="button" className="btn btn-outline-secondary" onClick={onClose}>
            Abbrechen
          </button>
          {!bearbeiten && (
            <button type="submit" name="weitere" className="btn btn-outline-primary" disabled={speichert}>
              Speichern und weitere erfassen
            </button>
          )}
          <button type="submit" className="btn btn-primary" disabled={speichert}>
            {speichert && <span className="spinner-border spinner-border-sm me-2" aria-hidden="true"></span>}
            {bearbeiten ? "Speichern" : "Leistung erfassen"}
          </button>
        </div>
      </form>
    </Dialog>
  );
}
