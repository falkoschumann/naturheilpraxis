// Copyright (c) 2026 Falko Schumann. All rights reserved. MIT license.

import { type ChangeEvent, type MouseEvent, type SubmitEvent, useEffect, useReducer } from "react";
import { useOutletContext } from "react-router";

import { NimmPatientAufCommand } from "../../../../../shared/domain/nimm_patient_auf_command";
import type { PatientQueryResult } from "../../../../../shared/domain/patient_query";
import {
  aktualisiereFeld,
  bearbeitePatientendaten,
  brichBearbeitungAb,
  FormularZustand,
  initialisiereFormular,
  initialState,
  reducer,
  sendeFormular,
} from "./reducer";

export type PatientContext = {
  result: PatientQueryResult;
  onNimmPatientAuf: (command: NimmPatientAufCommand) => void;
};

export function PatientComponent() {
  const { result, onNimmPatientAuf } = useOutletContext<PatientContext>();
  const [state, dispatch] = useReducer(reducer, initialState);

  useEffect(() => {
    dispatch(initialisiereFormular(result.patient));
  }, [result.patient]);

  function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();

    if (state.zustand === FormularZustand.AUFNAHME) {
      dispatch(sendeFormular());
      onNimmPatientAuf(NimmPatientAufCommand.create({ patient: state.patient }));
    } else if (state.zustand === FormularZustand.ANZEIGE) {
      dispatch(bearbeitePatientendaten());
    } else if (state.zustand === FormularZustand.BEARBEITUNG) {
      dispatch(sendeFormular());
      // TODO speichere Änderungen
    }
  }

  function handleCancel(event: MouseEvent<HTMLButtonElement>) {
    event.preventDefault();

    dispatch(brichBearbeitungAb());
  }

  return (
    <>
      <main className="flex-grow-1 container overflow-y-auto">
        <form onSubmit={handleSubmit}>
          <div className="row g-3">
            <MultiSelect
              name="schluesselworte"
              label="Schlüsselworte"
              cols={12}
              isReadOnly={state.nurLesen}
              options={result.schlüsselworte}
              value={state.patient.schlüsselworte ?? []}
              onChange={(e) =>
                dispatch(
                  aktualisiereFeld({
                    schlüsselworte: Array.from(e.target.selectedOptions, (option) => option.value),
                  }),
                )
              }
            />
            <Input
              name="geburtsdatum"
              label="Geburtsdatum"
              type="date"
              isRequired
              isReadOnly={state.nurLesen}
              cols={4}
              value={state.patient.geburtsdatum?.toString() ?? ""}
              onChange={(e) => dispatch(aktualisiereFeld({ geburtsdatum: Temporal.PlainDate.from(e.target.value) }))}
            />
            <Input
              name="annahmejahr"
              label="Annahmejahr"
              type="number"
              isRequired
              isReadOnly={state.nurLesen}
              cols={4}
              value={String(state.patient.annahmejahr ?? "")}
              onChange={(e) => dispatch(aktualisiereFeld({ annahmejahr: Number(e.target.value) }))}
            />
            <Select
              name="praxis"
              label="Praxis"
              cols={4}
              isReadOnly={state.nurLesen}
              options={result.praxen}
              value={state.patient.praxis ?? ""}
              onChange={(e) => dispatch(aktualisiereFeld({ praxis: e.target.value }))}
            />
            <Select
              name="anrede"
              label="Anrede"
              cols={2}
              isReadOnly={state.nurLesen}
              options={result.anreden}
              value={state.patient.anrede ?? ""}
              onChange={(e) => dispatch(aktualisiereFeld({ anrede: e.target.value }))}
            />
            <Input
              name="titel"
              label="Titel"
              cols={2}
              isReadOnly={state.nurLesen}
              value={state.patient.titel ?? ""}
              onChange={(e) => dispatch(aktualisiereFeld({ titel: e.target.value }))}
            />
            <Input
              name="vorname"
              label="Vorname"
              isRequired
              cols={4}
              isReadOnly={state.nurLesen}
              value={state.patient.vorname ?? ""}
              onChange={(e) => dispatch(aktualisiereFeld({ vorname: e.target.value }))}
            />
            <Input
              name="nachname"
              label="Nachname"
              isRequired
              isReadOnly={state.nurLesen}
              cols={4}
              value={state.patient.nachname ?? ""}
              onChange={(e) => dispatch(aktualisiereFeld({ nachname: e.target.value }))}
            />
            <Input
              name="strasse"
              label="Straße"
              cols={4}
              isReadOnly={state.nurLesen}
              value={state.patient.straße ?? ""}
              onChange={(e) => dispatch(aktualisiereFeld({ straße: e.target.value }))}
            />
            <Input
              name="postleitzahl"
              label="Postleitzahl"
              cols={2}
              isReadOnly={state.nurLesen}
              value={state.patient.postleitzahl ?? ""}
              onChange={(e) => dispatch(aktualisiereFeld({ postleitzahl: e.target.value }))}
            />
            <Input
              name="wohnort"
              label="Wohnort"
              cols={3}
              isReadOnly={state.nurLesen}
              value={state.patient.wohnort ?? ""}
              onChange={(e) => dispatch(aktualisiereFeld({ wohnort: e.target.value }))}
            />
            <Input
              name="staat"
              label="Staat"
              cols={3}
              isReadOnly={state.nurLesen}
              value={state.patient.staat ?? ""}
              onChange={(e) => dispatch(aktualisiereFeld({ staat: e.target.value }))}
            />
            <Input
              name="telefon"
              label="Telefon"
              cols={3}
              isReadOnly={state.nurLesen}
              value={state.patient.telefon ?? ""}
              onChange={(e) => dispatch(aktualisiereFeld({ telefon: e.target.value }))}
            />
            <Input
              name="mobil"
              label="Mobil"
              cols={3}
              isReadOnly={state.nurLesen}
              value={state.patient.mobil ?? ""}
              onChange={(e) => dispatch(aktualisiereFeld({ mobil: e.target.value }))}
            />
            <Input
              name="eMail"
              label="E-Mail"
              cols={6}
              isReadOnly={state.nurLesen}
              value={state.patient.eMail ?? ""}
              onChange={(e) => dispatch(aktualisiereFeld({ eMail: e.target.value }))}
            />
            <Select
              name="familienstand"
              label="Familienstand"
              cols={2}
              isReadOnly={state.nurLesen}
              options={result.familienstände}
              value={state.patient.familienstand ?? ""}
              onChange={(e) => dispatch(aktualisiereFeld({ familienstand: e.target.value }))}
            />
            <Input
              name="partner"
              label="Partner"
              cols={5}
              isReadOnly={state.nurLesen}
              value={state.patient.partner ?? ""}
              onChange={(e) => dispatch(aktualisiereFeld({ partner: e.target.value }))}
            />
            <Input
              name="kinder"
              label="Kinder"
              cols={5}
              isReadOnly={state.nurLesen}
              value={state.patient.kinder ?? ""}
              onChange={(e) => dispatch(aktualisiereFeld({ kinder: e.target.value }))}
            />
            <Input
              name="staatsangehoeringkeit"
              label="Staatsangehörigkeit"
              cols={6}
              isReadOnly={state.nurLesen}
              value={state.patient.staatsangehörigkeit ?? ""}
              onChange={(e) => dispatch(aktualisiereFeld({ staatsangehörigkeit: e.target.value }))}
            />
            <Input
              name="beruf"
              label="Beruf"
              cols={6}
              isReadOnly={state.nurLesen}
              value={state.patient.beruf ?? ""}
              onChange={(e) => dispatch(aktualisiereFeld({ beruf: e.target.value }))}
            />
            <TextArea
              name="notizen"
              label="Notizen"
              cols={12}
              isReadOnly={state.nurLesen}
              value={state.patient.notizen ?? ""}
              onChange={(e) => dispatch(aktualisiereFeld({ notizen: e.target.value }))}
            />
          </div>
          <div className="form-text mb-3">* Erforderliche Angaben</div>
        </form>
      </main>
      <aside className="flex-shrink-0 container">
        <div className="btn-toolbar py-3" role="toolbar" aria-label="Aktionen für Patient">
          <div className="me-auto"></div>
          {state.zustand === FormularZustand.VERARBEITUNG && (
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          )}
          <button type="submit" className="btn btn-primary ms-2" disabled={state.sendenDeaktiviert}>
            {state.sendenText}
          </button>
          <button className="btn btn-secondary ms-2" disabled={state.abbrechenDeaktiviert} onClick={handleCancel}>
            Abbrechen
          </button>
        </div>
      </aside>
    </>
  );
}

function Input({
  name,
  label,
  type,
  isRequired,
  isReadOnly,
  cols,
  value,
  onChange,
}: {
  name: string;
  label: string;
  type?: string;
  isRequired?: boolean;
  isReadOnly?: boolean;
  cols: number;
  value: string;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
}) {
  return (
    <div className={`col-${cols}`}>
      <div className="form-floating">
        <input
          type={type || "text"}
          className={isReadOnly ? "form-control-plaintext" : "form-control"}
          id={name}
          name={name}
          placeholder={label}
          readOnly={isReadOnly}
          value={value}
          onChange={onChange}
        />
        <label htmlFor={name}>
          {label}
          {isRequired && "*"}
        </label>
      </div>
    </div>
  );
}

function TextArea({
  name,
  label,
  isRequired,
  isReadOnly,
  cols,
  value,
  onChange,
}: {
  name: string;
  label: string;
  isRequired?: boolean;
  isReadOnly?: boolean;
  cols: number;
  value: string;
  onChange: (e: ChangeEvent<HTMLTextAreaElement>) => void;
}) {
  return (
    <div className={`col-${cols}`}>
      <div className="form-floating">
        <textarea
          className={isReadOnly ? "form-control-plaintext" : "form-control"}
          id={name}
          name={name}
          style={{ height: "100px" }}
          placeholder={label}
          readOnly={isReadOnly}
          value={value}
          onChange={onChange}
        ></textarea>
        <label htmlFor={name}>
          {label}
          {isRequired && "*"}
        </label>
      </div>
    </div>
  );
}

function Select({
  name,
  label,
  isRequired,
  isReadOnly,
  cols,
  options,
  value,
  onChange,
}: {
  name: string;
  label: string;
  isRequired?: boolean;
  isReadOnly?: boolean;
  cols: number;
  options: string[];
  value: string;
  onChange: (e: ChangeEvent<HTMLSelectElement>) => void;
}) {
  if (isReadOnly) {
    return (
      <div className={`col-${cols}`}>
        <div className="form-floating">
          <input
            type="text"
            className="form-control-plaintext"
            id={name}
            name={name}
            placeholder={label}
            readOnly={isReadOnly}
            value={value}
          />
          <label htmlFor={name}>
            {label}
            {isRequired && "*"}
          </label>
        </div>
      </div>
    );
  }

  return (
    <div className={`col-${cols}`}>
      <div className="form-floating">
        <select className="form-select" id={name} name={name} value={value} onChange={onChange}>
          {options.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
        <label htmlFor={name}>
          {label}
          {isRequired && "*"}
        </label>
      </div>
    </div>
  );
}

function MultiSelect({
  name,
  label,
  cols,
  isReadOnly,
  options,
  value,
  onChange,
}: {
  name: string;
  label: string;
  cols: number;
  isReadOnly?: boolean;
  options: string[];
  value: string[];
  onChange: (e: ChangeEvent<HTMLSelectElement>) => void;
}) {
  if (isReadOnly) {
    return (
      <div className={`col-${cols}`}>
        {value.map((option) => (
          <span key={option} className="badge text-bg-primary me-2">
            {option}
          </span>
        ))}
      </div>
    );
  }

  return (
    <div className={`col-${cols}`}>
      <div>
        <label htmlFor={name} className="visually-hidden">
          {label}
        </label>
        <select
          className="form-select"
          id={name}
          name={name}
          multiple
          data-allow-clear
          value={value}
          onChange={onChange}
        >
          <option disabled hidden value="">
            Wählen Sie Optionen aus
          </option>
          {options.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
