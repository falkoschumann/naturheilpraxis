// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

import { Temporal } from "@js-temporal/polyfill";
// @ts-expect-error TS7016
import Tags from "bootstrap5-tags";
import { type ChangeEvent, type FormEvent, type MouseEvent, useEffect, useReducer } from "react";
import { NavLink, useParams } from "react-router";

import { useNimmPatientAuf } from "../../../application/nimm_patient_auf_command_handler";
import { usePatient } from "../../../application/patient_query_handler";
import { useSettings } from "../../../application/settings_service";
import { PATIENTENKARTEIKARTE_PAGE } from "../../components/pages";
import DefaultPageLayout from "../../layouts/default_page_layout";
import {
  aktualisiereFeld,
  bearbeitePatientendaten,
  brichBearbeitungAb,
  FormularZustand,
  initialisierePatientendaten,
  initialState,
  reducer,
  sendeFormular,
  verarbeitungAbgeschlossen,
  zeigePatientendatenAn,
} from "./reducer";
import type { Patient } from "../../../../shared/domain/patient";
import { NimmPatientAufCommand } from "../../../../shared/domain/nimm_patient_auf_command"; // TODO link spouse and parent

// TODO link spouse and parent
// TODO add back link or link to Patientenkartei

export default function PatientenkarteikartePage() {
  const params = useParams();
  const nummer = params.nummer != null ? Number(params.nummer) : undefined;
  const [result] = usePatient({ nummer });
  const nimmPatientAuf = useNimmPatientAuf();
  const [state, dispatch] = useReducer(reducer, initialState);
  const [settings] = useSettings();

  useEffect(() => {
    if (result.patient == null) {
      dispatch(
        initialisierePatientendaten({
          annahmejahr: Temporal.Now.plainDateISO().year,
          praxis: settings.praxis[0],
          schluesselworte: settings.standardSchluesselworte,
        }),
      );
    } else {
      dispatch(zeigePatientendatenAn(result.patient));
    }
  }, [result.patient, settings.praxis, settings.standardSchluesselworte]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (state.zustand === FormularZustand.AUFNAHME) {
      dispatch(sendeFormular());
      // Patient in state should be complete here
      const status = await nimmPatientAuf(NimmPatientAufCommand.create(state.patient as Patient));
      if (status.isSuccess) {
        dispatch(verarbeitungAbgeschlossen({ nummer: status.result!.nummer }));
      }
    } else if (state.zustand === FormularZustand.ANZEIGE) {
      dispatch(bearbeitePatientendaten());
    } else if (state.zustand === FormularZustand.BEARBEITUNG) {
      dispatch(sendeFormular());
      // TODO speichere Änderungen
      dispatch(verarbeitungAbgeschlossen());
    }
  }

  function handleCancel(event: MouseEvent<HTMLButtonElement>) {
    event.preventDefault();

    dispatch(brichBearbeitungAb());
  }

  return (
    <DefaultPageLayout>
      <main className="container my-4">
        <h2 className="mb-3">
          {state.zustand === FormularZustand.AUFNAHME
            ? "Neuer Patient"
            : `${state.patient.nachname}, ${state.patient.vorname} (Nr. ${state.patient.nummer}), geboren am ${state.patient.geburtsdatum?.toLocaleString(undefined, { dateStyle: "medium" })}`}
        </h2>
        <form onSubmit={handleSubmit}>
          <div className="position-relative overflow-auto" style={{ height: "calc(100vh - 15.5rem)" }}>
            <div className="row g-3">
              <MultiSelect
                name="schluesselworte"
                label="Schlüsselworte"
                cols={12}
                isReadOnly={state.nurLesen}
                options={settings.schluesselworte}
                value={state.patient.schluesselworte ?? []}
                onChange={(e) =>
                  dispatch(
                    aktualisiereFeld({
                      schluesselworte: Array.from(e.target.selectedOptions, (option) => option.value),
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
                options={settings.praxis}
                value={state.patient.praxis ?? ""}
                onChange={(e) => dispatch(aktualisiereFeld({ praxis: e.target.value }))}
              />
              <Select
                name="anrede"
                label="Anrede"
                cols={2}
                isReadOnly={state.nurLesen}
                options={settings.anrede}
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
                value={state.patient.strasse ?? ""}
                onChange={(e) => dispatch(aktualisiereFeld({ strasse: e.target.value }))}
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
                options={settings.familienstand}
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
                value={state.patient.staatsangehoerigkeit ?? ""}
                onChange={(e) => dispatch(aktualisiereFeld({ staatsangehoerigkeit: e.target.value }))}
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
          </div>
          <div className="form-text mb-3">* Erforderliche Angaben</div>
          <div
            className="btn-toolbar justify-content-end align-items-center"
            role="toolbar"
            aria-label="Aktionen für Patient"
          >
            {state.zustand !== FormularZustand.AUFNAHME && (
              <NavLink to={PATIENTENKARTEIKARTE_PAGE} className="btn btn-primary">
                Nimm Patient auf
              </NavLink>
            )}
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
        </form>
      </main>
    </DefaultPageLayout>
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
  useEffect(() => {
    if (!isReadOnly && value.length > 0) {
      Tags.init();
    }
  }, [isReadOnly, value]);

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
