// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

// @ts-expect-error TS7016
import Tags from "bootstrap5-tags";
import React, { useEffect } from "react";

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
    const command = {
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
    };
    await window.naturheilpraxis.nimmPatientAuf(command);
    setStatus("submitted");
  }

  return (
    <main className="container my-4">
      <h2 className="mb-3">Neuer Patient</h2>
      <form onSubmit={handleSubmit}>
        <div className="row g-3">
          <div className="col-12">
            <div>
              <label htmlFor="schluesselworte" className="visually-hidden">
                Eigenschaften
              </label>
              <select
                className="form-select"
                id="schluesselworte"
                name="schluesselworte"
                multiple
                data-allow-clear
                value={schluesselworte}
                onChange={handleSchluesselworteChange}
              >
                <option disabled hidden value="">
                  Wählen Sie Eigenschaften aus
                </option>
                <option value="Aktiv">Aktiv</option>
                <option value="Unbekannt verzogen">Unbekannt verzogen</option>
                <option value="Exitus">Exitus</option>
                <option value="Geburtstagskarte">Geburtstagskarte</option>
                <option value="Weihnachtskarte">Weihnachtskarte</option>
                <option value="Kind">Kind</option>
              </select>
            </div>
          </div>
          <div className="col-4">
            <div className="form-floating">
              <input
                type="date"
                className="form-control"
                id="geburtsdatum"
                name="geburtsdatum"
                value={geburtsdatum}
                onChange={handleGeburtsdatumChange}
              />
              <label htmlFor="geburtsdatum">Geburtsdatum*</label>
            </div>
          </div>
          <div className="col-4">
            <div className="form-floating">
              <input
                type="number"
                className="form-control"
                id="annahmejahr"
                name="annahmejahr"
                placeholder="Annahmejahr"
                value={annahmejahr}
                onChange={handleAnnahmejahrChange}
              />
              <label htmlFor="annahmejahr">Annahmejahr*</label>
            </div>
          </div>
          <div className="col-4">
            <div className="form-floating">
              <select className="form-select" id="praxis" name="praxis" value={praxis} onChange={handlePraxisChange}>
                <option value="Praxis A">Praxis A</option>
                <option value="Praxis B">Praxis B</option>
                <option value="Alle">Alle</option>
              </select>
              <label htmlFor="praxis">Praxis*</label>
            </div>
          </div>
          <div className="col-2">
            <div className="form-floating">
              <select className="form-select" id="anrede" name="anrede" value={anrede} onChange={handleAnredeChange}>
                <option value=""></option>
                <option value="Herr">Herr</option>
                <option value="Frau">Frau</option>
                <option value="Fraeulein">Fräulein</option>
                <option value="Mr">Mr</option>
                <option value="Mrs">Mrs</option>
                <option value="Ms">Ms</option>
              </select>
              <label htmlFor="anrede">Anrede</label>
            </div>
          </div>
          <div className="col-5">
            <div className="form-floating">
              <input
                type="text"
                className="form-control"
                id="vorname"
                name="vorname"
                placeholder="Vorname"
                value={vorname}
                onChange={handleVornameChange}
              />
              <label htmlFor="vorname">Vorname*</label>
            </div>
          </div>
          <div className="col-5">
            <div className="form-floating">
              <input
                type="text"
                className="form-control"
                id="nachname"
                name="nachname"
                placeholder="Nachname"
                value={nachname}
                onChange={handleNachnameChange}
              />
              <label htmlFor="nachname">Nachname*</label>
            </div>
          </div>
          <div className="col-4">
            <div className="form-floating">
              <input
                type="text"
                className="form-control"
                id="strasse"
                name="strasse"
                placeholder="Strasse"
                value={strasse}
                onChange={handleStrasseChange}
              />
              <label htmlFor="strasse">Straße</label>
            </div>
          </div>
          <div className="col-2">
            <div className="form-floating">
              <input
                type="text"
                className="form-control"
                id="postleitzahl"
                name="postleitzahl"
                placeholder="Postleitzahl"
                value={postleitzahl}
                onChange={handlePostleitzahlChange}
              />
              <label htmlFor="postleitzahl">Postleitzahl</label>
            </div>
          </div>
          <div className="col-4">
            <div className="form-floating">
              <input
                type="text"
                className="form-control"
                id="wohnort"
                name="wohnort"
                placeholder="Wwohnort"
                value={wohnort}
                onChange={handleWohnortChange}
              />
              <label htmlFor="wohnort">Wohnort</label>
            </div>
          </div>
          <div className="col-2">
            <div className="form-floating">
              <input
                type="text"
                className="form-control"
                id="staat"
                name="staat"
                placeholder="Staat"
                value={staat}
                onChange={handleStaatChange}
              />
              <label htmlFor="staat">Staat</label>
            </div>
          </div>
          <div className="col-3">
            <div className="form-floating">
              <input
                type="text"
                className="form-control"
                id="staatsangehoerigkeit"
                name="staatsangehoerigkeit"
                placeholder="Staatsangehörigkeit"
                value={staatsangehoerigkeit}
                onChange={handleStaatsangehoerigkeitChange}
              />
              <label htmlFor="staatsangehoerigkeit">Staatsangehörigkeit</label>
            </div>
          </div>
          <div className="col-3">
            <div className="form-floating">
              <input
                type="text"
                className="form-control"
                id="titel"
                name="titel"
                placeholder="Titel"
                value={titel}
                onChange={handleTitelChange}
              />
              <label htmlFor="titel">Titel</label>
            </div>
          </div>
          <div className="col-5">
            <div className="form-floating">
              <input
                type="text"
                className="form-control"
                id="beruf"
                name="beruf"
                placeholder="Beruf"
                value={beruf}
                onChange={handleBerufChange}
              />
              <label htmlFor="beruf">Beruf</label>
            </div>
          </div>
          <div className="col-3">
            <div className="form-floating">
              <input
                type="tel"
                className="form-control"
                id="telefon"
                name="telefon"
                placeholder="Telefon"
                value={telefon}
                onChange={handleTelefonChange}
              />
              <label htmlFor="telefon">Telefon</label>
            </div>
          </div>
          <div className="col-3">
            <div className="form-floating">
              <input
                type="tel"
                className="form-control"
                id="mobil"
                name="mobil"
                placeholder="Mobil"
                value={mobil}
                onChange={handleMobilChange}
              />
              <label htmlFor="mobil">Mobil</label>
            </div>
          </div>
          <div className="col-6">
            <div className="form-floating">
              <input
                type="email"
                className="form-control"
                id="eMail"
                name="eMail"
                placeholder="E-Mail"
                value={eMail}
                onChange={handleEMailChange}
              />
              <label htmlFor="eMail">E-Mail</label>
            </div>
          </div>
          <div className="col-4">
            <div className="form-floating">
              <select
                className="form-select"
                id="familienstand"
                name="familienstand"
                value={familienstand}
                onChange={handleFamilienstandChange}
              >
                <option value=""></option>
                <option value="ledig">Ledig</option>
                <option value="verheiratet">Verheiratet</option>
                <option value="getrennt">Getrennt</option>
                <option value="geschieden">Geschieden</option>
                <option value="verwitwet">Verwitwet</option>
              </select>
              <label htmlFor="familienstand">Familienstand</label>
            </div>
          </div>
          {/* TODO link spouse and parent */}
          <div className="col-4">
            <div className="form-floating">
              <input
                type="text"
                className="form-control"
                id="partnerVon"
                name="partnerVon"
                placeholder="Partner von"
                value={partnerVon}
                onChange={handlePartnerVonChange}
              />
              <label htmlFor="partnerVon">Partner von</label>
            </div>
          </div>
          <div className="col-4">
            <div className="form-floating">
              <input
                type="text"
                className="form-control"
                id="kindVon"
                name="kindVon"
                placeholder="Kind von"
                value={kindVon}
                onChange={handleKindVonChange}
              />
              <label htmlFor="kindVon">Kind von</label>
            </div>
          </div>
          <div className="col-12">
            <div className="form-floating">
              <textarea
                className="form-control"
                id="memo"
                name="memo"
                style={{ height: "100px" }}
                placeholder="Memo"
                value={memo}
                onChange={handleMemoChange}
              ></textarea>
              <label htmlFor="memo">Memo</label>
            </div>
          </div>
        </div>
        <div className="form-text mb-3">* Erforderliche Angaben</div>
        <div className="btn-toolbar" role="toolbar" aria-label="Aktionen für Patient">
          <button type="submit" className="btn btn-primary me-2" disabled={!canSubmit}>
            Nimm Patient auf
          </button>
          {status === "submitting" && (
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          )}
        </div>
      </form>
    </main>
  );
}
