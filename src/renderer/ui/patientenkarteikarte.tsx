// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

// @ts-expect-error TS7016
import Tags from "bootstrap5-tags";
import { type ChangeEvent, type FormEvent, type MouseEvent, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router";

import { PATIENTENKARTEI_PAGE } from "./pages";
import type { NimmPatientAufCommand, Patient } from "../../main/domain/naturheilpraxis";

type Status = "new" | "view" | "edit" | "working";

export default function Patientenkarteikarte() {
  const { nummer } = useParams();
  const [patient, setPatient] = useState<Patient | null>();
  const navigate = useNavigate();

  useEffect(() => {
    async function findPatient() {
      if (nummer != null) {
        const result = await window.naturheilpraxis.patientenkartei({ nummer: Number(nummer) });
        setPatient(result.patienten[0]);
      } else {
        setPatient(null);
      }
    }

    void findPatient();
  }, [nummer]);

  async function handleSubmit(command: NimmPatientAufCommand) {
    const result = await window.naturheilpraxis.nimmPatientAuf(command);
    if (result.success) {
      // TODO naviagte to Patentienkartei?
      //  navigate(`${PATIENTENKARTEI_PAGE}/#${result.nummer}`, { replace: true });
    }
  }

  function handleCancel() {
    navigate(PATIENTENKARTEI_PAGE, { replace: true });
  }

  return (
    <main className="container my-4">
      <h2 className="mb-3">
        {patient
          ? `${patient.nachname}, ${patient.vorname} (Nr. ${nummer}), geboren am ${new Date(patient.geburtsdatum).toLocaleDateString(undefined, { dateStyle: "medium" })}`
          : "Neuer Patient"}
      </h2>
      {patient !== undefined && <Form patient={patient} onSubmit={handleSubmit} onCancel={handleCancel} />}
    </main>
  );
}

function Form({
  patient,
  onSubmit,
  onCancel,
}: {
  patient: Patient | null;
  onSubmit: (command: NimmPatientAufCommand) => Promise<void>;
  onCancel: () => void;
}) {
  const configuration = window.app.getConfiguration();

  const [status, setStatus] = useState<Status>(patient ? "view" : "new");
  const [schluesselworte, setSchluesselworte] = useState<string[]>(
    patient?.schluesselworte ?? configuration.defaultSchluesselworte,
  );
  const [geburtsdatum, setGeburtsdatum] = useState<string>(patient?.geburtsdatum ?? "");
  const [annahmejahr, setAnnahmejahr] = useState<string>(String(patient?.annahmejahr ?? new Date().getFullYear()));
  const [praxis, setPraxis] = useState<string>(patient?.praxis ?? "Praxis");
  const [anrede, setAnrede] = useState<string>(patient?.anrede ?? "");
  const [vorname, setVorname] = useState<string>(patient?.vorname ?? "");
  const [nachname, setNachname] = useState<string>(patient?.nachname ?? "");
  const [strasse, setStrasse] = useState<string>(patient?.strasse ?? "");
  const [wohnort, setWohnort] = useState<string>(patient?.wohnort ?? "");
  const [postleitzahl, setPostleitzahl] = useState<string>(patient?.postleitzahl ?? "");
  const [staat, setStaat] = useState<string>(patient?.staat ?? "");
  const [staatsangehoerigkeit, setStaatsangehoerigkeit] = useState<string>(patient?.staatsangehoerigkeit ?? "");
  const [titel, setTitel] = useState<string>(patient?.titel ?? "");
  const [beruf, setBeruf] = useState<string>(patient?.beruf ?? "");
  const [telefon, setTelefon] = useState<string>(patient?.telefon ?? "");
  const [mobil, setMobil] = useState<string>(patient?.mobil ?? "");
  const [eMail, setEMail] = useState<string>(patient?.eMail ?? "");
  const [familienstand, setFamilienstand] = useState<string>(patient?.familienstand ?? "");
  const [partnerVon, setPartnerVon] = useState<string>(patient?.partnerVon ?? "");
  const [kindVon, setKindVon] = useState<string>(patient?.kindVon ?? "");
  const [memo, setMemo] = useState<string>(patient?.memo ?? "");

  const canSubmit = useMemo(
    () =>
      geburtsdatum.trim() &&
      annahmejahr.trim() &&
      praxis.trim() &&
      vorname.trim() &&
      nachname.trim() &&
      status !== "working",
    [geburtsdatum, annahmejahr, praxis, vorname, nachname, status],
  );

  const isReadOnly = useMemo(() => status !== "new" && status !== "edit", [status]);
  const submitText = useMemo(() => {
    switch (status) {
      case "new":
        return "Aufnehmen";
      case "view":
        return "Bearbeiten";
      default:
        return "Speichern";
    }
  }, [status]);

  useEffect(() => Tags.init(), [status]);

  function handleSchluesselworteChange(e: ChangeEvent<HTMLSelectElement>) {
    const options = Array.from(e.target.selectedOptions, (option) => option.value);
    setSchluesselworte(options);
  }

  function handleGeburtsdatumChange(e: ChangeEvent<HTMLInputElement>) {
    setGeburtsdatum(e.target.value);
  }

  function handleAnnahmejahrChange(e: ChangeEvent<HTMLInputElement>) {
    setAnnahmejahr(e.target.value);
  }

  function handlePraxisChange(e: ChangeEvent<HTMLSelectElement>) {
    setPraxis(e.target.value);
  }

  function handleAnredeChange(e: ChangeEvent<HTMLSelectElement>) {
    setAnrede(e.target.value);
  }

  function handleVornameChange(e: ChangeEvent<HTMLInputElement>) {
    setVorname(e.target.value);
  }

  function handleNachnameChange(e: ChangeEvent<HTMLInputElement>) {
    setNachname(e.target.value);
  }

  function handleStrasseChange(e: ChangeEvent<HTMLInputElement>) {
    setStrasse(e.target.value);
  }

  function handleWohnortChange(e: ChangeEvent<HTMLInputElement>) {
    setWohnort(e.target.value);
  }

  function handlePostleitzahlChange(e: ChangeEvent<HTMLInputElement>) {
    setPostleitzahl(e.target.value);
  }

  function handleStaatChange(e: ChangeEvent<HTMLInputElement>) {
    setStaat(e.target.value);
  }

  function handleStaatsangehoerigkeitChange(e: ChangeEvent<HTMLInputElement>) {
    setStaatsangehoerigkeit(e.target.value);
  }

  function handleTitelChange(e: ChangeEvent<HTMLInputElement>) {
    setTitel(e.target.value);
  }

  function handleBerufChange(e: ChangeEvent<HTMLInputElement>) {
    setBeruf(e.target.value);
  }

  function handleTelefonChange(e: ChangeEvent<HTMLInputElement>) {
    setTelefon(e.target.value);
  }

  function handleMobilChange(e: ChangeEvent<HTMLInputElement>) {
    setMobil(e.target.value);
  }

  function handleEMailChange(e: ChangeEvent<HTMLInputElement>) {
    setEMail(e.target.value);
  }

  function handleFamilienstandChange(e: ChangeEvent<HTMLSelectElement>) {
    setFamilienstand(e.target.value);
  }

  function handlePartnerVonChange(e: ChangeEvent<HTMLInputElement>) {
    setPartnerVon(e.target.value);
  }

  function handleKindVonChange(e: ChangeEvent<HTMLInputElement>) {
    setKindVon(e.target.value);
  }

  function handleMemoChange(e: ChangeEvent<HTMLTextAreaElement>) {
    setMemo(e.target.value);
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    switch (status) {
      case "view":
        setStatus("edit");
        break;
      case "new":
        setStatus("working");
        void save();
        break;
      case "edit":
        setStatus("working");
        void save();
        break;
    }

    async function save() {
      await onSubmit({
        nachname,
        vorname,
        geburtsdatum,
        annahmejahr: Number(annahmejahr),
        praxis,
        anrede,
        strasse,
        wohnort,
        postleitzahl,
        staat,
        staatsangehoerigkeit,
        titel,
        beruf,
        telefon,
        mobil,
        eMail,
        familienstand,
        partnerVon,
        kindVon,
        memo,
        schluesselworte,
      });
      setStatus("view");
    }
  }

  function handleCancel(event: MouseEvent<HTMLButtonElement>) {
    event.preventDefault();
    onCancel();
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="position-relative overflow-auto" style={{ height: "calc(100vh - 15.5rem)" }}>
        <div className="row g-3">
          <MultiSelect
            name="schluesselworte"
            label="Schlüsselworte"
            cols={12}
            isReadOnly={isReadOnly}
            options={configuration.schluesselworte}
            value={schluesselworte}
            onChange={handleSchluesselworteChange}
          />
          <Input
            name="geburtsdatum"
            label="Geburtsdatum"
            type="date"
            isRequired
            isReadOnly={isReadOnly}
            cols={4}
            value={geburtsdatum}
            onChange={handleGeburtsdatumChange}
          />
          <Input
            name="annahmejahr"
            label="Annahmejahr"
            type="number"
            isRequired
            isReadOnly={isReadOnly}
            cols={4}
            value={annahmejahr}
            onChange={handleAnnahmejahrChange}
          />
          <Select
            name="praxis"
            label="Praxis"
            cols={4}
            isReadOnly={isReadOnly}
            options={configuration.praxis}
            value={praxis}
            onChange={handlePraxisChange}
          />
          <Select
            name="anrede"
            label="Anrede"
            cols={2}
            isReadOnly={isReadOnly}
            options={configuration.anrede}
            value={anrede}
            onChange={handleAnredeChange}
          />
          <Input
            name="titel"
            label="Titel"
            cols={2}
            isReadOnly={isReadOnly}
            value={titel}
            onChange={handleTitelChange}
          />
          <Input
            name="vorname"
            label="Vorname"
            isRequired
            cols={4}
            isReadOnly={isReadOnly}
            value={vorname}
            onChange={handleVornameChange}
          />
          <Input
            name="nachname"
            label="Nachname"
            isRequired
            isReadOnly={isReadOnly}
            cols={4}
            value={nachname}
            onChange={handleNachnameChange}
          />
          <Input
            name="strasse"
            label="Straße"
            cols={4}
            isReadOnly={isReadOnly}
            value={strasse}
            onChange={handleStrasseChange}
          />
          <Input
            name="postleitzahl"
            label="Postleitzahl"
            cols={2}
            isReadOnly={isReadOnly}
            value={postleitzahl}
            onChange={handlePostleitzahlChange}
          />
          <Input
            name="wohnort"
            label="Wohnort"
            cols={3}
            isReadOnly={isReadOnly}
            value={wohnort}
            onChange={handleWohnortChange}
          />
          <Input
            name="staat"
            label="Staat"
            cols={3}
            isReadOnly={isReadOnly}
            value={staat}
            onChange={handleStaatChange}
          />
          <Input
            name="telefon"
            label="Telefon"
            cols={3}
            isReadOnly={isReadOnly}
            value={telefon}
            onChange={handleTelefonChange}
          />
          <Input
            name="mobil"
            label="Mobil"
            cols={3}
            isReadOnly={isReadOnly}
            value={mobil}
            onChange={handleMobilChange}
          />
          <Input
            name="eMail"
            label="E-Mail"
            cols={6}
            isReadOnly={isReadOnly}
            value={eMail}
            onChange={handleEMailChange}
          />
          <Select
            name="familienstand"
            label="Familienstand"
            cols={2}
            isReadOnly={isReadOnly}
            options={configuration.familienstand}
            value={familienstand}
            onChange={handleFamilienstandChange}
          />
          <Input
            name="partnerVon"
            label="Partner von"
            cols={5}
            isReadOnly={isReadOnly}
            value={partnerVon}
            onChange={handlePartnerVonChange}
          />
          <Input
            name="kindVon"
            label="Kind von"
            cols={5}
            isReadOnly={isReadOnly}
            value={kindVon}
            onChange={handleKindVonChange}
          />
          <Input
            name="staatsangehoeringkeit"
            label="Staatsangehörigkeit"
            cols={6}
            isReadOnly={isReadOnly}
            value={staatsangehoerigkeit}
            onChange={handleStaatsangehoerigkeitChange}
          />
          <Input
            name="beruf"
            label="Beruf"
            cols={6}
            isReadOnly={isReadOnly}
            value={beruf}
            onChange={handleBerufChange}
          />
          <TextArea
            name="memo"
            label="Memo"
            cols={12}
            isReadOnly={isReadOnly}
            value={memo}
            onChange={handleMemoChange}
          />
        </div>
      </div>
      <div className="form-text mb-3">* Erforderliche Angaben</div>
      <div
        className="btn-toolbar justify-content-end align-items-center"
        role="toolbar"
        aria-label="Aktionen für Patient"
      >
        {status !== "new" && <button className="btn btn-primary me-auto">Erfasse Leistungen</button>}
        {status === "working" && (
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        )}
        <button type="submit" className="btn btn-primary ms-2" disabled={!canSubmit}>
          {submitText}
        </button>
        <button className="btn btn-secondary ms-2" onClick={handleCancel}>
          Abbrechen
        </button>
      </div>
    </form>
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
