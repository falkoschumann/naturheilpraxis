// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

// @ts-expect-error TS7016
import Tags from "bootstrap5-tags";
import { type ChangeEvent, type FormEvent, type MouseEvent, useEffect, useReducer } from "react";
import { NavLink, useNavigate, useParams } from "react-router";

import { cancelled, done, found, init, reducer, submit, updated } from "../../../domain/patientenkarteikarte";
import { PATIENT_AUFNEHMEN_PAGE, PATIENTENKARTEIKARTE_PAGE } from "../../components/pages";

// TODO link spouse and parent

export default function PatientenkarteikartePage() {
  const [state, dispatch] = useReducer(reducer, { configuration: window.naturheilpraxis.configuration }, init);
  const { nummer } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    async function findPatient() {
      const result = await window.naturheilpraxis.patientenkartei({ nummer: Number(nummer) });
      void dispatch(found({ patient: result.patienten[0] }));
    }

    void findPatient();
  }, [nummer]);

  // Depending on the status, the tags component needs to be initialized
  useEffect(() => Tags.init(), [state.state]);

  function handleSchluesselworteChange(e: ChangeEvent<HTMLSelectElement>) {
    const options = Array.from(e.target.selectedOptions, (option) => option.value);
    dispatch(updated({ feld: "schluesselworte", wert: options }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formState = state.state;
    dispatch(submit());
    if (formState === "new") {
      const result = await window.naturheilpraxis.nimmPatientAuf(state.patient);
      if (result.isSuccess) {
        navigate(`${PATIENTENKARTEIKARTE_PAGE.replace(":nummer", String(result.nummer))}`);
        dispatch(done({ nummer: result.nummer }));
      }
    } else if (formState === "edit") {
      dispatch(done({}));
    }
  }

  function handleCancel(event: MouseEvent<HTMLButtonElement>) {
    event.preventDefault();
    void dispatch(cancelled());
  }

  return (
    <main className="container my-4">
      <h2 className="mb-3">
        {state.state === "new"
          ? "Neuer Patient"
          : `${state.patient.nachname}, ${state.patient.vorname} (Nr. ${state.patient.nummer}), geboren am ${new Date(state.patient.geburtsdatum).toLocaleDateString(undefined, { dateStyle: "medium" })}`}
      </h2>
      <form onSubmit={handleSubmit}>
        <div className="position-relative overflow-auto" style={{ height: "calc(100vh - 15.5rem)" }}>
          <div className="row g-3">
            <MultiSelect
              name="schluesselworte"
              label="Schlüsselworte"
              cols={12}
              isReadOnly={state.isReadOnly}
              options={state.configuration.schluesselworte}
              value={state.patient.schluesselworte ?? []}
              onChange={handleSchluesselworteChange}
            />
            <Input
              name="geburtsdatum"
              label="Geburtsdatum"
              type="date"
              isRequired
              isReadOnly={state.isReadOnly}
              cols={4}
              value={state.patient.geburtsdatum}
              onChange={(e) => dispatch(updated({ feld: "geburtsdatum", wert: e.target.value }))}
            />
            <Input
              name="annahmejahr"
              label="Annahmejahr"
              type="number"
              isRequired
              isReadOnly={state.isReadOnly}
              cols={4}
              value={String(state.patient.annahmejahr)}
              onChange={(e) => dispatch(updated({ feld: "annahmejahr", wert: e.target.value }))}
            />
            <Select
              name="praxis"
              label="Praxis"
              cols={4}
              isReadOnly={state.isReadOnly}
              options={state.configuration.praxis}
              value={state.patient.praxis}
              onChange={(e) => dispatch(updated({ feld: "praxis", wert: e.target.value }))}
            />
            <Select
              name="anrede"
              label="Anrede"
              cols={2}
              isReadOnly={state.isReadOnly}
              options={state.configuration.anrede}
              value={state.patient.anrede ?? ""}
              onChange={(e) => dispatch(updated({ feld: "anrede", wert: e.target.value }))}
            />
            <Input
              name="titel"
              label="Titel"
              cols={2}
              isReadOnly={state.isReadOnly}
              value={state.patient.titel ?? ""}
              onChange={(e) => dispatch(updated({ feld: "titel", wert: e.target.value }))}
            />
            <Input
              name="vorname"
              label="Vorname"
              isRequired
              cols={4}
              isReadOnly={state.isReadOnly}
              value={state.patient.vorname}
              onChange={(e) => dispatch(updated({ feld: "vorname", wert: e.target.value }))}
            />
            <Input
              name="nachname"
              label="Nachname"
              isRequired
              isReadOnly={state.isReadOnly}
              cols={4}
              value={state.patient.nachname}
              onChange={(e) => dispatch(updated({ feld: "nachname", wert: e.target.value }))}
            />
            <Input
              name="strasse"
              label="Straße"
              cols={4}
              isReadOnly={state.isReadOnly}
              value={state.patient.strasse ?? ""}
              onChange={(e) => dispatch(updated({ feld: "strasse", wert: e.target.value }))}
            />
            <Input
              name="postleitzahl"
              label="Postleitzahl"
              cols={2}
              isReadOnly={state.isReadOnly}
              value={state.patient.postleitzahl ?? ""}
              onChange={(e) => dispatch(updated({ feld: "postleitzahl", wert: e.target.value }))}
            />
            <Input
              name="wohnort"
              label="Wohnort"
              cols={3}
              isReadOnly={state.isReadOnly}
              value={state.patient.wohnort ?? ""}
              onChange={(e) => dispatch(updated({ feld: "wohnort", wert: e.target.value }))}
            />
            <Input
              name="staat"
              label="Staat"
              cols={3}
              isReadOnly={state.isReadOnly}
              value={state.patient.staat ?? ""}
              onChange={(e) => dispatch(updated({ feld: "staat", wert: e.target.value }))}
            />
            <Input
              name="telefon"
              label="Telefon"
              cols={3}
              isReadOnly={state.isReadOnly}
              value={state.patient.telefon ?? ""}
              onChange={(e) => dispatch(updated({ feld: "telefon", wert: e.target.value }))}
            />
            <Input
              name="mobil"
              label="Mobil"
              cols={3}
              isReadOnly={state.isReadOnly}
              value={state.patient.mobil ?? ""}
              onChange={(e) => dispatch(updated({ feld: "mobil", wert: e.target.value }))}
            />
            <Input
              name="eMail"
              label="E-Mail"
              cols={6}
              isReadOnly={state.isReadOnly}
              value={state.patient.eMail ?? ""}
              onChange={(e) => dispatch(updated({ feld: "eMail", wert: e.target.value }))}
            />
            <Select
              name="familienstand"
              label="Familienstand"
              cols={2}
              isReadOnly={state.isReadOnly}
              options={state.configuration.familienstand}
              value={state.patient.familienstand ?? ""}
              onChange={(e) => dispatch(updated({ feld: "familienstand", wert: e.target.value }))}
            />
            <Input
              name="partnerVon"
              label="Partner von"
              cols={5}
              isReadOnly={state.isReadOnly}
              value={state.patient.partnerVon ?? ""}
              onChange={(e) => dispatch(updated({ feld: "partnerVon", wert: e.target.value }))}
            />
            <Input
              name="kindVon"
              label="Kind von"
              cols={5}
              isReadOnly={state.isReadOnly}
              value={state.patient.kindVon ?? ""}
              onChange={(e) => dispatch(updated({ feld: "kindVon", wert: e.target.value }))}
            />
            <Input
              name="staatsangehoeringkeit"
              label="Staatsangehörigkeit"
              cols={6}
              isReadOnly={state.isReadOnly}
              value={state.patient.staatsangehoerigkeit ?? ""}
              onChange={(e) => dispatch(updated({ feld: "staatsangehoerigkeit", wert: e.target.value }))}
            />
            <Input
              name="beruf"
              label="Beruf"
              cols={6}
              isReadOnly={state.isReadOnly}
              value={state.patient.beruf ?? ""}
              onChange={(e) => dispatch(updated({ feld: "beruf", wert: e.target.value }))}
            />
            <TextArea
              name="memo"
              label="Memo"
              cols={12}
              isReadOnly={state.isReadOnly}
              value={state.patient.memo ?? ""}
              onChange={(e) => dispatch(updated({ feld: "memo", wert: e.target.value }))}
            />
          </div>
        </div>
        <div className="form-text mb-3">* Erforderliche Angaben</div>
        <div
          className="btn-toolbar justify-content-end align-items-center"
          role="toolbar"
          aria-label="Aktionen für Patient"
        >
          {state.state !== "new" && (
            <NavLink to={PATIENT_AUFNEHMEN_PAGE} className="btn btn-primary">
              Nimm Patient auf
            </NavLink>
          )}
          {state.state !== "new" && <button className="btn btn-primary ms-2">Erfasse Leistungen</button>}
          <div className="me-auto"></div>
          {state.state === "working" && (
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          )}
          <button type="submit" className="btn btn-primary ms-2" disabled={!state.canSubmit}>
            {state.submitButtonText}
          </button>
          <button className="btn btn-secondary ms-2" disabled={!state.canCancel} onClick={handleCancel}>
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
