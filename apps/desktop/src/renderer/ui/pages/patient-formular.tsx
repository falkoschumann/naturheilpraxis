// Copyright (c) 2026 Falko Schumann. MIT license.

import { useEffect, useState } from "react";

import type { NaturheilpraxisApi } from "../../../shared/application/naturheilpraxis-api.ts";
import type { Patient } from "../../../shared/domain/entities.ts";
import type { PatientenErmittelnQueryResult } from "../../../shared/domain/patientenansicht.ts";
import type { PraxenErmittelnQueryResult } from "../../../shared/domain/praxenansicht.ts";
import type { Patientennummer } from "../../../shared/domain/value-objects.ts";
import { SelectField } from "../components/select-field.tsx";
import { TextField } from "../components/text-field.tsx";

export type PatientWerte = Record<
  | "praxiskuerzel"
  | "aufnahmejahr"
  | "anrede"
  | "titel"
  | "vorname"
  | "nachname"
  | "geburtsdatum"
  | "beruf"
  | "familienstand"
  | "staatsangehoerigkeit"
  | "partnerVon"
  | "kindVon"
  | "strasse"
  | "zusatz"
  | "postleitzahl"
  | "ort"
  | "staat"
  | "telefon"
  | "mobiltelefon"
  | "email"
  | "website"
  | "schluesselworte"
  | "notizen",
  string
>;

export type PatientFeld = keyof PatientWerte;

const pflichtfelder: readonly PatientFeld[] = ["praxiskuerzel", "aufnahmejahr", "vorname", "nachname", "geburtsdatum"];

const anschriftfelder: readonly PatientFeld[] = ["strasse", "zusatz", "postleitzahl", "ort", "staat"];

// An Anschrift is optional, but when given it needs these fields.
const anschriftPflichtfelder: readonly PatientFeld[] = ["strasse", "postleitzahl", "ort"];

export function patientWerteAus(patient: Patient | undefined, praxiskuerzel = ""): PatientWerte {
  return {
    praxiskuerzel: patient?.praxiskuerzel ?? praxiskuerzel,
    aufnahmejahr: String(patient?.aufnahmejahr ?? new Date().getFullYear()),
    anrede: patient?.name.anrede ?? "",
    titel: patient?.name.titel ?? "",
    vorname: patient?.name.vorname ?? "",
    nachname: patient?.name.nachname ?? "",
    geburtsdatum: patient?.geburtsdatum ?? "",
    beruf: patient?.beruf ?? "",
    familienstand: patient?.familienstand ?? "",
    staatsangehoerigkeit: patient?.staatsangehoerigkeit ?? "",
    partnerVon: patient?.partnerVon === undefined ? "" : String(patient.partnerVon),
    kindVon: patient?.kindVon === undefined ? "" : String(patient.kindVon),
    strasse: patient?.anschrift?.strasse ?? "",
    zusatz: patient?.anschrift?.zusatz ?? "",
    postleitzahl: patient?.anschrift?.postleitzahl ?? "",
    ort: patient?.anschrift?.ort ?? "",
    staat: patient?.anschrift?.staat ?? "",
    telefon: patient?.kontakt?.telefon ?? "",
    mobiltelefon: patient?.kontakt?.mobiltelefon ?? "",
    email: patient?.kontakt?.email ?? "",
    website: patient?.kontakt?.website ?? "",
    schluesselworte: patient?.schluesselworte?.join(", ") ?? "",
    notizen: patient?.notizen ?? "",
  };
}

// Returns the invalid fields in the order of the form.
export function pruefePatientWerte(werte: PatientWerte): PatientFeld[] {
  const leer = (feld: PatientFeld) => werte[feld].trim() === "";
  const anschriftAngegeben = anschriftfelder.some((feld) => !leer(feld));
  const ungueltig = new Set<PatientFeld>([
    ...pflichtfelder.filter(leer),
    ...(anschriftAngegeben ? anschriftPflichtfelder.filter(leer) : []),
  ]);
  if (!/^\d{4}$/.test(werte.aufnahmejahr.trim())) {
    ungueltig.add("aufnahmejahr");
  }
  return (Object.keys(werte) as PatientFeld[]).filter((feld) => ungueltig.has(feld));
}

// Empty optional fields are left out of the Patient. The Patientennummer is
// not part of the form.
export function patientAus(werte: PatientWerte): Omit<Patient, "patientennummer"> {
  const text = (feld: PatientFeld) => {
    const wert = werte[feld].trim();
    return wert === "" ? undefined : wert;
  };
  const nummer = (feld: PatientFeld) => (text(feld) === undefined ? undefined : Number(text(feld)));
  const anschrift = ohneLeere({
    strasse: text("strasse"),
    zusatz: text("zusatz"),
    postleitzahl: text("postleitzahl"),
    ort: text("ort"),
    staat: text("staat"),
  });
  const kontakt = ohneLeere({
    telefon: text("telefon"),
    mobiltelefon: text("mobiltelefon"),
    email: text("email"),
    website: text("website"),
  });
  const schluesselworte = werte.schluesselworte
    .split(",")
    .map((wort) => wort.trim())
    .filter((wort) => wort !== "");
  return ohneLeere({
    praxiskuerzel: werte.praxiskuerzel,
    aufnahmejahr: Number(werte.aufnahmejahr),
    geburtsdatum: werte.geburtsdatum,
    name: ohneLeere({
      anrede: text("anrede"),
      titel: text("titel"),
      vorname: werte.vorname.trim(),
      nachname: werte.nachname.trim(),
    }),
    anschrift: Object.keys(anschrift).length === 0 ? undefined : anschrift,
    kontakt: Object.keys(kontakt).length === 0 ? undefined : kontakt,
    beruf: text("beruf"),
    familienstand: text("familienstand"),
    staatsangehoerigkeit: text("staatsangehoerigkeit"),
    notizen: text("notizen"),
    partnerVon: nummer("partnerVon"),
    kindVon: nummer("kindVon"),
    schluesselworte: schluesselworte.length === 0 ? undefined : schluesselworte,
  }) as Omit<Patient, "patientennummer">;
}

function ohneLeere<T extends Record<string, unknown>>(werte: T): T {
  return Object.fromEntries(Object.entries(werte).filter(([, wert]) => wert !== undefined)) as T;
}

// Keeps the input of the form and marks the invalid fields when checked.
export function usePatientWerte(anfang: () => PatientWerte) {
  const [werte, setWerte] = useState(anfang);
  const [ungueltig, setUngueltig] = useState<ReadonlySet<PatientFeld>>(new Set());

  return {
    werte,
    ungueltig,
    aendern(feld: PatientFeld, wert: string) {
      setWerte((werte) => ({ ...werte, [feld]: wert }));
      setUngueltig((ungueltig) => new Set([...ungueltig].filter((name) => name !== feld)));
    },
    // Focuses the first invalid field of the form.
    pruefen(form: HTMLFormElement): boolean {
      const fehler = pruefePatientWerte(werte);
      setUngueltig(new Set(fehler));
      const [erstes] = fehler;
      if (erstes === undefined) {
        return true;
      }
      const element = form.elements.namedItem(erstes);
      if (element instanceof HTMLElement) {
        element.focus();
      }
      return false;
    },
    zuruecksetzen(neu: PatientWerte) {
      setWerte(neu);
      setUngueltig(new Set());
    },
  };
}

// The Praxen and the Patienten to choose from in the form.
export function useAuswahllisten(api: NaturheilpraxisApi) {
  const [praxen, setPraxen] = useState<PraxenErmittelnQueryResult>([]);
  const [patienten, setPatienten] = useState<PatientenErmittelnQueryResult>([]);

  useEffect(() => {
    let aktuell = true;
    void Promise.all([
      api.praxenErmitteln({ type: "praxen-ermitteln", parameters: {} }),
      api.patientenErmitteln({ type: "patienten-ermitteln", parameters: {} }),
    ]).then(
      ([praxen, patienten]) => {
        if (aktuell) {
          setPraxen(praxen);
          setPatienten(patienten);
        }
      },
      // Without the lists only the choice is missing; the form still works.
      () => undefined,
    );
    return () => {
      aktuell = false;
    };
  }, [api]);

  return { praxen, patienten };
}

// The fields of a Patient, grouped like the Karteikarte on paper.
export function PatientFormular({
  werte,
  ungueltig,
  onChange,
  patientennummer,
  praxen,
  patienten,
  autoFocus = false,
}: {
  werte: PatientWerte;
  ungueltig: ReadonlySet<PatientFeld>;
  onChange: (feld: PatientFeld, wert: string) => void;
  patientennummer?: Patientennummer;
  praxen: PraxenErmittelnQueryResult;
  patienten: PatientenErmittelnQueryResult;
  autoFocus?: boolean;
}) {
  function feld(name: PatientFeld) {
    return {
      name,
      value: werte[name],
      onChange: (wert: string) => onChange(name, wert),
      required: pflichtfelder.includes(name),
      invalid: ungueltig.has(name),
    };
  }

  const angehoerige = [
    { value: "", label: "– keine Angabe –" },
    ...patienten
      .filter((patient) => patient.patientennummer !== patientennummer)
      .toSorted((a, b) => `${a.nachname}, ${a.vorname}`.localeCompare(`${b.nachname}, ${b.vorname}`, "de"))
      .map((patient) => ({
        value: String(patient.patientennummer),
        label: `${patient.nachname}, ${patient.vorname} (Nr. ${patient.patientennummer})`,
      })),
  ];

  return (
    <>
      <fieldset className="mb-4">
        <legend className="fs-6 fw-semibold border-bottom pb-1">Aufnahme</legend>
        <div className="row g-3">
          <div className="col-md-3">
            <span className="form-label d-block">Patientennummer</span>
            <span className="form-control-plaintext">{patientennummer ?? "wird bei der Aufnahme vergeben"}</span>
          </div>
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
            help={praxen.length === 0 ? "Legen Sie zuerst unter Stammdaten eine Praxis an." : undefined}
            {...feld("praxiskuerzel")}
          />
          <TextField
            label="Aufnahmejahr"
            className="col-md-3"
            inputMode="numeric"
            invalidMessage="Bitte geben Sie das Aufnahmejahr vierstellig an, z. B. 2026."
            {...feld("aufnahmejahr")}
          />
        </div>
      </fieldset>
      <fieldset className="mb-4">
        <legend className="fs-6 fw-semibold border-bottom pb-1">Person</legend>
        <div className="row g-3">
          <SelectField
            label="Anrede"
            className="col-md-2"
            options={["", "Frau", "Herr", "Divers"].map((anrede) => ({ value: anrede, label: anrede || "–" }))}
            {...feld("anrede")}
          />
          <TextField label="Titel" className="col-md-2" {...feld("titel")} />
          <TextField
            label="Vorname"
            className="col-md-4"
            data-autofocus={autoFocus || undefined}
            {...feld("vorname")}
          />
          <TextField label="Nachname" className="col-md-4" {...feld("nachname")} />
          <TextField label="Geburtsdatum" type="date" className="col-md-4" {...feld("geburtsdatum")} />
          <TextField label="Beruf" className="col-md-4" {...feld("beruf")} />
          <TextField label="Familienstand" className="col-md-4" {...feld("familienstand")} />
          <TextField label="Staatsangehörigkeit" className="col-md-4" {...feld("staatsangehoerigkeit")} />
          <SelectField label="Partner von" className="col-md-4" options={angehoerige} {...feld("partnerVon")} />
          <SelectField label="Kind von" className="col-md-4" options={angehoerige} {...feld("kindVon")} />
        </div>
      </fieldset>
      <fieldset className="mb-4">
        <legend className="fs-6 fw-semibold border-bottom pb-1">
          Anschrift <span className="fw-normal small text-body-secondary">– für den Rechnungsversand erforderlich</span>
        </legend>
        <div className="row g-3">
          <TextField label="Straße und Hausnummer" className="col-md-8" {...feld("strasse")} />
          <TextField label="Adresszusatz" className="col-md-4" {...feld("zusatz")} />
          <TextField label="Postleitzahl" className="col-md-3" {...feld("postleitzahl")} />
          <TextField label="Ort" className="col-md-5" {...feld("ort")} />
          <TextField label="Staat" className="col-md-4" help="Leer lassen für Deutschland." {...feld("staat")} />
        </div>
      </fieldset>
      <fieldset className="mb-4">
        <legend className="fs-6 fw-semibold border-bottom pb-1">Kontakt</legend>
        <div className="row g-3">
          <TextField label="Telefon" type="tel" className="col-md-6" {...feld("telefon")} />
          <TextField label="Mobiltelefon" type="tel" className="col-md-6" {...feld("mobiltelefon")} />
          <TextField label="E-Mail" type="email" className="col-md-6" {...feld("email")} />
          <TextField label="Website" type="url" className="col-md-6" {...feld("website")} />
        </div>
      </fieldset>
      <fieldset>
        <legend className="fs-6 fw-semibold border-bottom pb-1">Sonstiges</legend>
        <div className="row g-3">
          <TextField
            label="Schlüsselworte"
            help="Mehrere Schlüsselworte durch Komma trennen. Sie helfen bei der Suche."
            {...feld("schluesselworte")}
          />
          <TextField label="Notizen" rows={3} {...feld("notizen")} />
        </div>
      </fieldset>
    </>
  );
}
