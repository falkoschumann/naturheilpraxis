// Copyright (c) 2026 Falko Schumann. MIT license.

import { useContext, useEffect, useState, type FormEvent } from "react";

import type { NaturheilpraxisApi } from "../../../shared/application/naturheilpraxis-api.ts";
import type { Diagnose } from "../../../shared/domain/entities.ts";
import type { PraxenErmittelnQueryResult } from "../../../shared/domain/praxenansicht.ts";
import type { Patientennummer } from "../../../shared/domain/value-objects.ts";
import { Dialog } from "../components/dialog.tsx";
import { SelectField } from "../components/select-field.tsx";
import { sende } from "../components/sende.ts";
import { TextField } from "../components/text-field.tsx";
import { AktuellePraxisContext } from "../layouts/aktuelle-praxis.ts";

type Werte = Record<"datum" | "praxiskuerzel" | "text", string>;

type Feld = keyof Werte;

const felder: readonly Feld[] = ["datum", "praxiskuerzel", "text"];

// Makes a Diagnose for a Patient or changes it. Without a Diagnose the dialog
// makes one, today and in the current Praxis unless chosen otherwise.
export function DiagnoseDialog({
  api,
  patient,
  diagnose,
  onClose,
  onSaved,
}: {
  api: NaturheilpraxisApi;
  patient: Readonly<{ patientennummer: Patientennummer; praxiskuerzel: string; name: string }>;
  diagnose?: Diagnose;
  onClose: () => void;
  onSaved: (message: string) => void;
}) {
  const bearbeiten = diagnose !== undefined;
  const aktuellePraxis = useContext(AktuellePraxisContext);
  const [werte, setWerte] = useState<Werte>(() => ({
    datum: diagnose?.datum ?? heute(),
    praxiskuerzel: diagnose?.praxiskuerzel ?? aktuellePraxis ?? patient.praxiskuerzel,
    text: diagnose?.text ?? "",
  }));
  const [ungueltig, setUngueltig] = useState<ReadonlySet<Feld>>(new Set());
  const [praxen, setPraxen] = useState<PraxenErmittelnQueryResult>([]);
  const [fehler, setFehler] = useState<string>();
  const [speichert, setSpeichert] = useState(false);

  useEffect(() => {
    let aktuell = true;
    api.praxenErmitteln({ type: "praxen-ermitteln", parameters: {} }).then(
      (praxen) => {
        if (aktuell) {
          setPraxen(praxen);
        }
      },
      () => undefined,
    );
    return () => {
      aktuell = false;
    };
  }, [api]);

  function feld(name: Feld) {
    return {
      name,
      value: werte[name],
      onChange: (wert: string) => {
        setWerte((werte) => ({ ...werte, [name]: wert }));
        setUngueltig((ungueltig) => new Set([...ungueltig].filter((feld) => feld !== name)));
      },
      required: true,
      invalid: ungueltig.has(name),
    };
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const fehlend = felder.filter((name) => werte[name].trim() === "");
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
    const data = { datum: werte.datum, praxiskuerzel: werte.praxiskuerzel, text: werte.text.trim() };
    const status = await sende(
      () =>
        bearbeiten
          ? api.diagnoseAendern({ type: "diagnose-aendern", data: { diagnoseId: diagnose.diagnoseId, ...data } })
          : api.diagnoseStellen({
              type: "diagnose-stellen",
              data: { diagnoseId: crypto.randomUUID(), patientennummer: patient.patientennummer, ...data },
            }),
      "Die Diagnose konnte nicht gespeichert werden. Bitte versuchen Sie es erneut.",
    );
    setSpeichert(false);
    if (status.success) {
      onSaved(bearbeiten ? "Die Diagnose wurde geändert." : "Die Diagnose wurde gestellt.");
    } else {
      setFehler(status.errorMessage);
    }
  }

  return (
    <Dialog title={bearbeiten ? "Diagnose bearbeiten" : `Diagnose stellen für ${patient.name}`} onClose={onClose}>
      <form noValidate onSubmit={(event) => void handleSubmit(event)}>
        <div className="modal-body">
          {fehler !== undefined && (
            <div className="alert alert-danger" role="alert">
              <i className="fa-solid fa-circle-exclamation me-2" aria-hidden="true"></i>
              {fehler} Ihre Eingaben bleiben erhalten.
            </div>
          )}
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
              label="Diagnose"
              rows={3}
              data-autofocus
              invalidMessage="Bitte beschreiben Sie die Diagnose."
              {...feld("text")}
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
            {bearbeiten ? "Speichern" : "Diagnose stellen"}
          </button>
        </div>
      </form>
    </Dialog>
  );
}

// Today in the local time zone as ISO date.
function heute(): string {
  const jetzt = new Date();
  const monat = String(jetzt.getMonth() + 1).padStart(2, "0");
  const tag = String(jetzt.getDate()).padStart(2, "0");
  return `${jetzt.getFullYear()}-${monat}-${tag}`;
}
