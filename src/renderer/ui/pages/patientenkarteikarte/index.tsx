// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

// @ts-expect-error TS7016
import Tags from "bootstrap5-tags";
import { type ChangeEvent, type FormEvent, type MouseEvent, useEffect } from "react";
import { NavLink, useNavigate, useParams } from "react-router";

import { FormularZustand } from "../../../domain/patientenkarteikarte";
import { PATIENT_AUFNEHMEN_PAGE, PATIENTENKARTEIKARTE_PAGE } from "../../components/pages";
import { usePatientenkarteikarte } from "../../../application/naturheilpraxis_service";

// TODO link spouse and parent

export default function PatientenkarteikartePage() {
  const navigate = useNavigate();
  const { nummer } = useParams();
  const { state, handleFeldAktualisiert, handleSendeFormular, handleAbbrechen } = usePatientenkarteikarte({
    nummer: nummer != null ? Number(nummer) : undefined,
  });

  function handleSchluesselworteChange(e: ChangeEvent<HTMLSelectElement>) {
    const options = Array.from(e.target.selectedOptions, (option) => option.value);
    handleFeldAktualisiert("schluesselworte", options);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await handleSendeFormular();
  }

  function handleCancel(event: MouseEvent<HTMLButtonElement>) {
    event.preventDefault();
    handleAbbrechen();
  }

  // Depending on the status, the tags component needs to be initialized
  useEffect(() => Tags.init(), [state.formularZustand]);

  useEffect(() => {
    if (state.patient.nummer == null) {
      return;
    }

    navigate(`${PATIENTENKARTEIKARTE_PAGE.replace(":nummer", String(state.patient.nummer))}`);
  }, [navigate, state.patient.nummer]);

  return (
    <main className="container my-4">
      <h2 className="mb-3">
        {state.formularZustand === FormularZustand.AUFNEHMEN
          ? "Neuer Patient"
          : `${state.patient.nachname}, ${state.patient.vorname} (Nr. ${state.patient.nummer}), geboren am ${state.patient.geburtsdatum!.toLocaleString(undefined, { dateStyle: "medium" })}`}
      </h2>
      <form onSubmit={handleSubmit}>
        <div className="position-relative overflow-auto" style={{ height: "calc(100vh - 15.5rem)" }}>
          <div className="row g-3">
            <MultiSelect
              name="schluesselworte"
              label="Schlüsselworte"
              cols={12}
              isReadOnly={state.istSchreibgeschuetzt}
              options={state.schluesselworte}
              value={state.patient.schluesselworte ?? []}
              onChange={handleSchluesselworteChange}
            />
            <Input
              name="geburtsdatum"
              label="Geburtsdatum"
              type="date"
              isRequired
              isReadOnly={state.istSchreibgeschuetzt}
              cols={4}
              value={state.patient.geburtsdatum?.toString() ?? ""}
              onChange={(e) => handleFeldAktualisiert("geburtsdatum", e.target.value)}
            />
            <Input
              name="annahmejahr"
              label="Annahmejahr"
              type="number"
              isRequired
              isReadOnly={state.istSchreibgeschuetzt}
              cols={4}
              value={String(state.patient.annahmejahr)}
              onChange={(e) => handleFeldAktualisiert("annahmejahr", e.target.value)}
            />
            <Select
              name="praxis"
              label="Praxis"
              cols={4}
              isReadOnly={state.istSchreibgeschuetzt}
              options={state.praxis}
              value={state.patient.praxis ?? ""}
              onChange={(e) => handleFeldAktualisiert("praxis", e.target.value)}
            />
            <Select
              name="anrede"
              label="Anrede"
              cols={2}
              isReadOnly={state.istSchreibgeschuetzt}
              options={state.anrede}
              value={state.patient.anrede ?? ""}
              onChange={(e) => handleFeldAktualisiert("anrede", e.target.value)}
            />
            <Input
              name="titel"
              label="Titel"
              cols={2}
              isReadOnly={state.istSchreibgeschuetzt}
              value={state.patient.titel ?? ""}
              onChange={(e) => handleFeldAktualisiert("titel", e.target.value)}
            />
            <Input
              name="vorname"
              label="Vorname"
              isRequired
              cols={4}
              isReadOnly={state.istSchreibgeschuetzt}
              value={state.patient.vorname ?? ""}
              onChange={(e) => handleFeldAktualisiert("vorname", e.target.value)}
            />
            <Input
              name="nachname"
              label="Nachname"
              isRequired
              isReadOnly={state.istSchreibgeschuetzt}
              cols={4}
              value={state.patient.nachname ?? ""}
              onChange={(e) => handleFeldAktualisiert("nachname", e.target.value)}
            />
            <Input
              name="strasse"
              label="Straße"
              cols={4}
              isReadOnly={state.istSchreibgeschuetzt}
              value={state.patient.strasse ?? ""}
              onChange={(e) => handleFeldAktualisiert("strasse", e.target.value)}
            />
            <Input
              name="postleitzahl"
              label="Postleitzahl"
              cols={2}
              isReadOnly={state.istSchreibgeschuetzt}
              value={state.patient.postleitzahl ?? ""}
              onChange={(e) => handleFeldAktualisiert("postleitzahl", e.target.value)}
            />
            <Input
              name="wohnort"
              label="Wohnort"
              cols={3}
              isReadOnly={state.istSchreibgeschuetzt}
              value={state.patient.wohnort ?? ""}
              onChange={(e) => handleFeldAktualisiert("wohnort", e.target.value)}
            />
            <Input
              name="staat"
              label="Staat"
              cols={3}
              isReadOnly={state.istSchreibgeschuetzt}
              value={state.patient.staat ?? ""}
              onChange={(e) => handleFeldAktualisiert("staat", e.target.value)}
            />
            <Input
              name="telefon"
              label="Telefon"
              cols={3}
              isReadOnly={state.istSchreibgeschuetzt}
              value={state.patient.telefon ?? ""}
              onChange={(e) => handleFeldAktualisiert("telefon", e.target.value)}
            />
            <Input
              name="mobil"
              label="Mobil"
              cols={3}
              isReadOnly={state.istSchreibgeschuetzt}
              value={state.patient.mobil ?? ""}
              onChange={(e) => handleFeldAktualisiert("mobil", e.target.value)}
            />
            <Input
              name="eMail"
              label="E-Mail"
              cols={6}
              isReadOnly={state.istSchreibgeschuetzt}
              value={state.patient.eMail ?? ""}
              onChange={(e) => handleFeldAktualisiert("eMail", e.target.value)}
            />
            <Select
              name="familienstand"
              label="Familienstand"
              cols={2}
              isReadOnly={state.istSchreibgeschuetzt}
              options={state.familienstand}
              value={state.patient.familienstand ?? ""}
              onChange={(e) => handleFeldAktualisiert("familienstand", e.target.value)}
            />
            <Input
              name="partnerVon"
              label="Partner von"
              cols={5}
              isReadOnly={state.istSchreibgeschuetzt}
              value={state.patient.partnerVon ?? ""}
              onChange={(e) => handleFeldAktualisiert("partnerVon", e.target.value)}
            />
            <Input
              name="kindVon"
              label="Kind von"
              cols={5}
              isReadOnly={state.istSchreibgeschuetzt}
              value={state.patient.kindVon ?? ""}
              onChange={(e) => handleFeldAktualisiert("kindVon", e.target.value)}
            />
            <Input
              name="staatsangehoeringkeit"
              label="Staatsangehörigkeit"
              cols={6}
              isReadOnly={state.istSchreibgeschuetzt}
              value={state.patient.staatsangehoerigkeit ?? ""}
              onChange={(e) => handleFeldAktualisiert("staatsangehoerigkeit", e.target.value)}
            />
            <Input
              name="beruf"
              label="Beruf"
              cols={6}
              isReadOnly={state.istSchreibgeschuetzt}
              value={state.patient.beruf ?? ""}
              onChange={(e) => handleFeldAktualisiert("beruf", e.target.value)}
            />
            <TextArea
              name="memo"
              label="Memo"
              cols={12}
              isReadOnly={state.istSchreibgeschuetzt}
              value={state.patient.memo ?? ""}
              onChange={(e) => handleFeldAktualisiert("memo", e.target.value)}
            />
          </div>
        </div>
        <div className="form-text mb-3">* Erforderliche Angaben</div>
        <div
          className="btn-toolbar justify-content-end align-items-center"
          role="toolbar"
          aria-label="Aktionen für Patient"
        >
          {state.formularZustand !== FormularZustand.AUFNEHMEN && (
            <NavLink to={PATIENT_AUFNEHMEN_PAGE} className="btn btn-primary">
              Nimm Patient auf
            </NavLink>
          )}
          {state.formularZustand !== FormularZustand.AUFNEHMEN && (
            <button className="btn btn-primary ms-2">Erfasse Leistungen</button>
          )}
          <div className="me-auto"></div>
          {state.formularZustand === FormularZustand.VERARBEITEN && (
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          )}
          <button type="submit" className="btn btn-primary ms-2" disabled={!state.kannAbschicken}>
            {state.sendenText}
          </button>
          <button className="btn btn-secondary ms-2" disabled={!state.kannAbbrechen} onClick={handleCancel}>
            Abbrechen
          </button>
        </div>
      </form>
    </main>
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
    if (!isReadOnly) {
      Tags.init();
    }
  }, [isReadOnly]);

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
