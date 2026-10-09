// Copyright (c) 2026 Falko Schumann. MIT license.

import { useEffect, useId, useState, type FormEvent } from "react";

import type { NaturheilpraxisApi } from "../../../shared/application/naturheilpraxis-api.ts";
import type { DiagnosenErmittelnQueryResult } from "../../../shared/domain/behandlungsansicht.ts";
import type { PraxenErmittelnQueryResult } from "../../../shared/domain/praxenansicht.ts";
import type { Rechnungsposition } from "../../../shared/domain/rechnungsansicht.ts";
import { formatDatum, formatEuro, type Patientennummer } from "../../../shared/domain/value-objects.ts";
import { Dialog } from "../components/dialog.tsx";
import { SelectField } from "../components/select-field.tsx";
import { sende } from "../components/sende.ts";
import { TextField } from "../components/text-field.tsx";

type Kandidat = Omit<Rechnungsposition, "betrag">;

type Werte = Record<"praxiskuerzel" | "diagnosetext" | "rechnungstext", string>;

type Feld = keyof Werte | "leistungen";

// The draft to edit, as far as the dialog needs it.
export type Rechnungsentwurf = Readonly<{
  rechnungId: string;
  praxiskuerzel: string;
  diagnosetext: string;
  rechnungstext: string;
  positionen: readonly Kandidat[];
}>;

// Creates a Rechnung as draft or changes a draft. The dialog suggests the
// newest Diagnose, all Leistungen not yet billed and the Rechnungstext of the
// Praxis. The input is kept when the Rechnung cannot be saved.
export function RechnungDialog({
  api,
  patient,
  entwurf,
  onClose,
  onSaved,
}: {
  api: NaturheilpraxisApi;
  patient: Readonly<{ patientennummer: Patientennummer; praxiskuerzel: string; name: string }>;
  entwurf?: Rechnungsentwurf;
  onClose: () => void;
  onSaved: (rechnungId: string, message: string) => void;
}) {
  const bearbeiten = entwurf !== undefined;
  const [werte, setWerte] = useState<Werte>({
    praxiskuerzel: entwurf?.praxiskuerzel ?? patient.praxiskuerzel,
    diagnosetext: entwurf?.diagnosetext ?? "",
    rechnungstext: entwurf?.rechnungstext ?? "",
  });
  const [kandidaten, setKandidaten] = useState<readonly Kandidat[]>(entwurf?.positionen ?? []);
  const [ausgewaehlt, setAusgewaehlt] = useState<ReadonlySet<string>>(
    new Set(entwurf?.positionen.map((position) => position.leistungId)),
  );
  const [praxen, setPraxen] = useState<PraxenErmittelnQueryResult>([]);
  const [diagnosen, setDiagnosen] = useState<DiagnosenErmittelnQueryResult>([]);
  const [ungueltig, setUngueltig] = useState<ReadonlySet<Feld>>(new Set());
  const [fehler, setFehler] = useState<string>();
  const [speichert, setSpeichert] = useState(false);
  const diagnosewahlId = useId();
  const leistungenFehlerId = useId();

  const { patientennummer } = patient;
  useEffect(() => {
    let aktuell = true;
    void Promise.all([
      api.praxenErmitteln({ type: "praxen-ermitteln", parameters: {} }),
      api.diagnosenErmitteln({ type: "diagnosen-ermitteln", parameters: { patientennummer } }),
      api.nichtAbgerechneteLeistungenErmitteln({
        type: "nicht-abgerechnete-leistungen-ermitteln",
        parameters: { patientennummer },
      }),
    ]).then(
      ([praxen, diagnosen, nichtAbgerechnet]) => {
        if (!aktuell) {
          return;
        }
        setPraxen(praxen);
        setDiagnosen(diagnosen);
        setKandidaten((kandidaten) =>
          [...kandidaten, ...nichtAbgerechnet].toSorted((a, b) => a.datum.localeCompare(b.datum)),
        );
        if (!bearbeiten) {
          // A new Rechnung bills everything not yet billed, for the newest
          // Diagnose and with the text of the Praxis.
          setAusgewaehlt(new Set(nichtAbgerechnet.map((leistung) => leistung.leistungId)));
          setWerte((werte) => ({
            ...werte,
            diagnosetext: werte.diagnosetext || (diagnosen[0]?.text ?? ""),
            rechnungstext:
              werte.rechnungstext ||
              (praxen.find((praxis) => praxis.praxiskuerzel === werte.praxiskuerzel)?.rechnungstext ?? ""),
          }));
        }
      },
      () => setFehler("Die Angaben für die Rechnung konnten nicht geladen werden. Bitte versuchen Sie es erneut."),
    );
    return () => {
      aktuell = false;
    };
  }, [api, patientennummer, bearbeiten]);

  function aendern(name: keyof Werte, wert: string) {
    setWerte((werte) => ({ ...werte, [name]: wert }));
    setUngueltig((ungueltig) => new Set([...ungueltig].filter((feld) => feld !== name)));
  }

  function feld(name: keyof Werte) {
    return {
      name,
      value: werte[name],
      onChange: (wert: string) => aendern(name, wert),
      required: true,
      invalid: ungueltig.has(name),
    };
  }

  function waehleLeistungen(leistungIds: readonly string[], gewaehlt: boolean) {
    setAusgewaehlt((ausgewaehlt) => {
      const neu = new Set(ausgewaehlt);
      for (const leistungId of leistungIds) {
        if (gewaehlt) {
          neu.add(leistungId);
        } else {
          neu.delete(leistungId);
        }
      }
      return neu;
    });
    setUngueltig((ungueltig) => new Set([...ungueltig].filter((feld) => feld !== "leistungen")));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const leistungen = kandidaten
      .map((kandidat) => kandidat.leistungId)
      .filter((leistungId) => ausgewaehlt.has(leistungId));
    const fehlend: Feld[] = [
      ...(["praxiskuerzel", "diagnosetext"] as const).filter((name) => werte[name].trim() === ""),
      ...(leistungen.length === 0 ? (["leistungen"] as const) : []),
      ...(werte.rechnungstext.trim() === "" ? (["rechnungstext"] as const) : []),
    ];
    setUngueltig(new Set(fehlend));
    const [erstesFehlendes] = fehlend;
    if (erstesFehlendes !== undefined) {
      setFehler("Bitte prüfen Sie die markierten Felder.");
      const element = event.currentTarget.elements.namedItem(erstesFehlendes);
      if (element instanceof HTMLElement) {
        element.focus();
      } else if (element instanceof RadioNodeList) {
        (element[0] as HTMLElement | undefined)?.focus();
      }
      return;
    }

    setFehler(undefined);
    setSpeichert(true);
    const data = {
      praxiskuerzel: werte.praxiskuerzel,
      diagnosetext: werte.diagnosetext.trim(),
      rechnungstext: werte.rechnungstext.trim(),
      leistungen,
    };
    const rechnungId = entwurf?.rechnungId ?? crypto.randomUUID();
    const status = await sende(
      () =>
        bearbeiten
          ? api.rechnungAendern({ type: "rechnung-aendern", data: { rechnungId, ...data } })
          : api.rechnungErstellen({
              type: "rechnung-erstellen",
              data: { rechnungId, patientennummer, ...data },
            }),
      "Die Rechnung konnte nicht gespeichert werden. Bitte versuchen Sie es erneut.",
    );
    setSpeichert(false);
    if (status.success) {
      onSaved(
        rechnungId,
        bearbeiten
          ? "Der Rechnungsentwurf wurde gespeichert."
          : "Der Rechnungsentwurf wurde erstellt. Prüfen Sie ihn und versenden Sie ihn anschließend.",
      );
    } else {
      setFehler(status.errorMessage);
    }
  }

  const summe = kandidaten
    .filter((kandidat) => ausgewaehlt.has(kandidat.leistungId))
    .reduce((summe, kandidat) => summe + kandidat.anzahl * kandidat.einzelbetrag.cents, 0);
  const alleAusgewaehlt = kandidaten.length > 0 && kandidaten.every((kandidat) => ausgewaehlt.has(kandidat.leistungId));
  const leistungenUngueltig = ungueltig.has("leistungen");

  return (
    <Dialog
      title={bearbeiten ? "Rechnungsentwurf bearbeiten" : `Rechnung erstellen für ${patient.name}`}
      size="xl"
      onClose={onClose}
    >
      <form noValidate onSubmit={(event) => void handleSubmit(event)}>
        <div className="modal-body">
          {fehler !== undefined && (
            <div className="alert alert-danger" role="alert">
              <i className="fa-solid fa-circle-exclamation me-2" aria-hidden="true"></i>
              {fehler} Ihre Eingaben bleiben erhalten.
            </div>
          )}
          <div className="row g-3">
            <SelectField
              label="Praxis"
              className="col-md-6"
              options={[
                { value: "", label: "– bitte wählen –" },
                ...praxen.map((praxis) => ({
                  value: praxis.praxiskuerzel,
                  label: `${praxis.name} (${praxis.praxiskuerzel})`,
                })),
              ]}
              {...feld("praxiskuerzel")}
              onChange={(praxiskuerzel) => {
                aendern("praxiskuerzel", praxiskuerzel);
                const rechnungstext = praxen.find((praxis) => praxis.praxiskuerzel === praxiskuerzel)?.rechnungstext;
                if (rechnungstext !== undefined) {
                  aendern("rechnungstext", rechnungstext);
                }
              }}
            />
            <div className="col-md-6">
              <label htmlFor={diagnosewahlId} className="form-label">
                Diagnose übernehmen
              </label>
              <select
                id={diagnosewahlId}
                className="form-select"
                value=""
                onChange={(event) => {
                  const diagnose = diagnosen.find((diagnose) => diagnose.diagnoseId === event.target.value);
                  if (diagnose !== undefined) {
                    aendern("diagnosetext", diagnose.text);
                  }
                }}
              >
                <option value="">– auswählen –</option>
                {diagnosen.map((diagnose) => (
                  <option key={diagnose.diagnoseId} value={diagnose.diagnoseId}>
                    {formatDatum(diagnose.datum)}: {diagnose.text}
                  </option>
                ))}
              </select>
            </div>
            <TextField
              label="Diagnosetext auf der Rechnung"
              rows={2}
              data-autofocus
              invalidMessage="Bitte geben Sie eine Diagnose an. Sie muss auf der Rechnung stehen."
              {...feld("diagnosetext")}
            />
            <fieldset className="col-12" aria-describedby={leistungenUngueltig ? leistungenFehlerId : undefined}>
              <legend className="form-label required fs-6">Leistungen</legend>
              <div className={`table-responsive border rounded${leistungenUngueltig ? " border-danger" : ""}`}>
                <table className="table table-sm align-middle mb-0">
                  <thead>
                    <tr>
                      <th scope="col">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          aria-label="Alle Leistungen auswählen"
                          checked={alleAusgewaehlt}
                          onChange={(event) =>
                            waehleLeistungen(
                              kandidaten.map((kandidat) => kandidat.leistungId),
                              event.target.checked,
                            )
                          }
                        />
                      </th>
                      <th scope="col">Datum</th>
                      <th scope="col">Ziffer</th>
                      <th scope="col">Bezeichnung</th>
                      <th scope="col" className="text-end">
                        Betrag
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {kandidaten.length === 0 && (
                      <tr>
                        <td colSpan={5} className="text-center text-body-secondary py-3">
                          Es gibt keine nicht abgerechneten Leistungen.
                        </td>
                      </tr>
                    )}
                    {kandidaten.map((kandidat) => (
                      <tr key={kandidat.leistungId}>
                        <td>
                          <input
                            className="form-check-input"
                            type="checkbox"
                            name="leistungen"
                            aria-label={`${kandidat.bezeichnung} vom ${formatDatum(kandidat.datum)}`}
                            checked={ausgewaehlt.has(kandidat.leistungId)}
                            onChange={(event) => waehleLeistungen([kandidat.leistungId], event.target.checked)}
                          />
                        </td>
                        <td>{formatDatum(kandidat.datum)}</td>
                        <td>{kandidat.ziffer}</td>
                        <td>
                          {kandidat.bezeichnung}
                          {kandidat.anzahl > 1 && <span className="text-body-secondary"> ({kandidat.anzahl}×)</span>}
                        </td>
                        <td className="text-end text-nowrap">
                          {formatEuro({ cents: kandidat.anzahl * kandidat.einzelbetrag.cents })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr>
                      <th colSpan={4} className="text-end">
                        Rechnungsbetrag
                      </th>
                      <th className="text-end text-nowrap">{formatEuro({ cents: summe })}</th>
                    </tr>
                  </tfoot>
                </table>
              </div>
              {leistungenUngueltig && (
                <div id={leistungenFehlerId} className="text-danger small mt-1">
                  Bitte wählen Sie mindestens eine Leistung aus.
                </div>
              )}
            </fieldset>
            <TextField
              label="Rechnungstext"
              rows={2}
              help="Vorbelegt aus den Stammdaten der Praxis."
              invalidMessage="Bitte geben Sie einen Rechnungstext an."
              {...feld("rechnungstext")}
            />
          </div>
        </div>
        <div className="modal-footer">
          <span className="me-auto small text-body-secondary">
            Die Rechnung wird als Entwurf gespeichert. Rechnungsnummer und -datum werden beim Versand vergeben.
          </span>
          <button type="button" className="btn btn-outline-secondary" onClick={onClose}>
            Abbrechen
          </button>
          <button type="submit" className="btn btn-primary" disabled={speichert}>
            {speichert && <span className="spinner-border spinner-border-sm me-2" aria-hidden="true"></span>}
            {bearbeiten ? "Speichern" : "Entwurf erstellen"}
          </button>
        </div>
      </form>
    </Dialog>
  );
}
