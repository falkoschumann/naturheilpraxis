// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

// @ts-expect-error TS7016
import Tags from "bootstrap5-tags";
import React, { useEffect } from "react";
import { useNavigate } from "react-router";

import { PATIENTENKARTEI_PAGE } from "./pages";

export default function Patientenkarteikarte() {
  const [status, setStatus] = React.useState<string>("new");
  const [schluesselworte, setSchluesselworte] = React.useState<string[]>(["Aktiv", "Weihnachtskarte"]);
  const [geburtsdatum, setGeburtsdatum] = React.useState<string>("");
  const [annahmejahr, setAnnahmejahr] = React.useState<string>(String(new Date().getFullYear()));
  const [praxis, setPraxis] = React.useState<string>("Praxis A");
  const [anrede, setAnrede] = React.useState<string>("");
  const [vorname, setVorname] = React.useState<string>("");
  const [nachname, setNachname] = React.useState<string>("");
  const [strasse, setStrasse] = React.useState<string>("");
  const [wohnort, setWohnort] = React.useState<string>("");
  const [postleitzahl, setPostleitzahl] = React.useState<string>("");
  const [staat, setStaat] = React.useState<string>("");
  const [staatsangehoerigkeit, setStaatsangehoerigkeit] = React.useState<string>("");
  const [titel, setTitel] = React.useState<string>("");
  const [beruf, setBeruf] = React.useState<string>("");
  const [telefon, setTelefon] = React.useState<string>("");
  const [mobil, setMobil] = React.useState<string>("");
  const [eMail, setEMail] = React.useState<string>("");
  const [familienstand, setFamilienstand] = React.useState<string>("");
  const [partnerVon, setPartnerVon] = React.useState<string>("");
  const [kindVon, setKindVon] = React.useState<string>("");
  const [memo, setMemo] = React.useState<string>("");
  const navigate = useNavigate();

  const canSubmit =
    status == "new" && geburtsdatum.trim() && annahmejahr.trim() && praxis.trim() && vorname.trim() && nachname.trim();

  useEffect(() => Tags.init(), []);

  function handleSchluesselworteChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const options = Array.from(e.target.selectedOptions, (option) => option.value);
    setSchluesselworte(options);
  }

  function handleGeburtsdatumChange(e: React.ChangeEvent<HTMLInputElement>) {
    setGeburtsdatum(e.target.value);
  }

  function handleAnnahmejahrChange(e: React.ChangeEvent<HTMLInputElement>) {
    setAnnahmejahr(e.target.value);
  }

  function handlePraxisChange(e: React.ChangeEvent<HTMLSelectElement>) {
    setPraxis(e.target.value);
  }

  function handleAnredeChange(e: React.ChangeEvent<HTMLSelectElement>) {
    setAnrede(e.target.value);
  }

  function handleVornameChange(e: React.ChangeEvent<HTMLInputElement>) {
    setVorname(e.target.value);
  }

  function handleNachnameChange(e: React.ChangeEvent<HTMLInputElement>) {
    setNachname(e.target.value);
  }

  function handleStrasseChange(e: React.ChangeEvent<HTMLInputElement>) {
    setStrasse(e.target.value);
  }

  function handleWohnortChange(e: React.ChangeEvent<HTMLInputElement>) {
    setWohnort(e.target.value);
  }

  function handlePostleitzahlChange(e: React.ChangeEvent<HTMLInputElement>) {
    setPostleitzahl(e.target.value);
  }

  function handleStaatChange(e: React.ChangeEvent<HTMLInputElement>) {
    setStaat(e.target.value);
  }

  function handleStaatsangehoerigkeitChange(e: React.ChangeEvent<HTMLInputElement>) {
    setStaatsangehoerigkeit(e.target.value);
  }

  function handleTitelChange(e: React.ChangeEvent<HTMLInputElement>) {
    setTitel(e.target.value);
  }

  function handleBerufChange(e: React.ChangeEvent<HTMLInputElement>) {
    setBeruf(e.target.value);
  }

  function handleTelefonChange(e: React.ChangeEvent<HTMLInputElement>) {
    setTelefon(e.target.value);
  }

  function handleMobilChange(e: React.ChangeEvent<HTMLInputElement>) {
    setMobil(e.target.value);
  }

  function handleEMailChange(e: React.ChangeEvent<HTMLInputElement>) {
    setEMail(e.target.value);
  }

  function handleFamilienstandChange(e: React.ChangeEvent<HTMLSelectElement>) {
    setFamilienstand(e.target.value);
  }

  function handlePartnerVonChange(e: React.ChangeEvent<HTMLInputElement>) {
    setPartnerVon(e.target.value);
  }

  function handleKindVonChange(e: React.ChangeEvent<HTMLInputElement>) {
    setKindVon(e.target.value);
  }

  function handleMemoChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    setMemo(e.target.value);
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setStatus("submitting");
    const result = await window.naturheilpraxis.nimmPatientAuf({
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
    setStatus("submitted");
    if (result.success) {
      navigate(`${PATIENTENKARTEI_PAGE}/#${result.nummer}`, { replace: true });
    }
  }

  function handleAbbrechen(event: React.MouseEvent<HTMLButtonElement>) {
    event.preventDefault();
    navigate(PATIENTENKARTEI_PAGE, { replace: true });
  }

  return (
    <main className="container my-4">
      <h2 className="mb-3">Neuer Patient</h2>
      <form onSubmit={handleSubmit}>
        <div className="row g-3">
          <MultiSelect
            name="schluesselworte"
            label="Schlüsselworte"
            cols={12}
            options={["Aktiv", "Unbekannt verzogen", "Exitus", "Geburtstagskarte", "Weihnachtskarte", "Kind"]}
            value={schluesselworte}
            onChange={handleSchluesselworteChange}
          />
          <Input
            name="geburtsdatum"
            label="Geburtsdatum"
            type="date"
            isRequired
            cols={4}
            value={geburtsdatum}
            onChange={handleGeburtsdatumChange}
          />
          <Input
            name="annahmejahr"
            label="Annahmejahr"
            type="number"
            isRequired
            cols={4}
            value={annahmejahr}
            onChange={handleAnnahmejahrChange}
          />
          <Select
            name="praxis"
            label="Praxis"
            cols={4}
            options={["Praxis A", "Praxis B", "Alle"]}
            value={praxis}
            onChange={handlePraxisChange}
          />
          <Select
            name="anrede"
            label="Anrede"
            cols={2}
            options={["Herr", "Frau", "Fräulein", "Mr", "Mrs", "Ms"]}
            value={anrede}
            onChange={handleAnredeChange}
          />
          <Input name="titel" label="Titel" cols={2} value={titel} onChange={handleTitelChange} />
          <Input name="vorname" label="Vorname" isRequired cols={4} value={vorname} onChange={handleVornameChange} />
          <Input
            name="nachname"
            label="Nachname"
            isRequired
            cols={4}
            value={nachname}
            onChange={handleNachnameChange}
          />
          <Input name="strasse" label="Straße" cols={4} value={strasse} onChange={handleStrasseChange} />
          <Input
            name="postleitzahl"
            label="Postleitzahl"
            cols={2}
            value={postleitzahl}
            onChange={handlePostleitzahlChange}
          />
          <Input name="wohnort" label="Wohnort" cols={3} value={wohnort} onChange={handleWohnortChange} />
          <Input name="staat" label="Staat" cols={3} value={staat} onChange={handleStaatChange} />
          <Input name="telefon" label="Telefon" cols={3} value={telefon} onChange={handleTelefonChange} />
          <Input name="mobil" label="Mobil" cols={3} value={mobil} onChange={handleMobilChange} />
          <Input name="eMail" label="E-Mail" cols={6} value={eMail} onChange={handleEMailChange} />
          <Select
            name="familienstand"
            label="Familienstand"
            cols={2}
            options={["", "ledig", "verheiratet", "getrennt", "geschieden", "verwitwet"]}
            value={familienstand}
            onChange={handleFamilienstandChange}
          />
          {/* TODO link spouse and parent */}
          <Input name="partnerVon" label="Partner von" cols={5} value={partnerVon} onChange={handlePartnerVonChange} />
          <Input name="kindVon" label="Kind von" cols={5} value={kindVon} onChange={handleKindVonChange} />
          <Input
            name="staatsangehoeringkeit"
            label="Staatsangehörigkeit"
            cols={6}
            value={staatsangehoerigkeit}
            onChange={handleStaatsangehoerigkeitChange}
          />
          <Input name="beruf" label="Beruf" cols={6} value={beruf} onChange={handleBerufChange} />
          <TextArea name="memo" label="Memo" cols={12} value={memo} onChange={handleMemoChange} />
        </div>
        <div className="form-text mb-3">* Erforderliche Angaben</div>
        <div className="btn-toolbar justify-content-end" role="toolbar" aria-label="Aktionen für Patient">
          {status === "submitting" && (
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          )}
          <button type="submit" className="btn btn-primary me-2" disabled={!canSubmit}>
            Nimm Patient auf
          </button>
          <button className="btn btn-secondary me-2" onClick={handleAbbrechen}>
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
  cols,
  value,
  onChange,
}: {
  name: string;
  label: string;
  type?: string;
  isRequired?: boolean;
  cols: number;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) {
  return (
    <div className={`col-${cols}`}>
      <div className="form-floating">
        <input
          type={type || "text"}
          className="form-control"
          id={name}
          name={name}
          placeholder={label}
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
  cols,
  value,
  onChange,
}: {
  name: string;
  label: string;
  isRequired?: boolean;
  cols: number;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
}) {
  return (
    <div className={`col-${cols}`}>
      <div className="form-floating">
        <textarea
          className="form-control"
          id={name}
          name={name}
          style={{ height: "100px" }}
          placeholder={label}
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
  cols,
  options,
  value,
  onChange,
}: {
  name: string;
  label: string;
  isRequired?: boolean;
  cols: number;
  options: string[];
  value: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
}) {
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
  options,
  value,
  onChange,
}: {
  name: string;
  label: string;
  cols: number;
  options: string[];
  value: string[];
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
}) {
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
