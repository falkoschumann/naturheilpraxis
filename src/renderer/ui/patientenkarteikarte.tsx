// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

// @ts-expect-error TS7016
import Tags from "bootstrap5-tags";

import { useEffect } from "react";

export default function Patientenkarteikarte() {
  useEffect(() => Tags.init(), []);

  return (
    <main className="container my-4">
      <h2 className="mb-3">Mustermann, Max (42), geboren am 07.10.1984</h2>
      <form>
        <div>
          <div className="row g-3">
            <div className="col">
              <div className="mb-3">
                <label htmlFor="tags-input" className="visually-hidden">
                  Eigenschaften
                </label>
                <select
                  className="form-select"
                  id="tags-input"
                  name="tags[]"
                  multiple
                  value={["Aktiv", "Weihnachtskarte"]}
                  data-allow-clear
                >
                  <option disabled hidden value="">
                    Choose a tag...
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
          </div>
          <div className="row g-3">
            <div className="col">
              <div className="form-floating mb-3">
                <input type="date" className="form-control" id="geburtsdatum" name="geburtsdatum" />
                <label htmlFor="geburtsdatum">Geburtsdatum</label>
              </div>
            </div>
            <div className="col">
              <div className="form-floating mb-3">
                <input
                  type="number"
                  className="form-control"
                  id="annahmejahr"
                  name="annahmejahr"
                  placeholder="Annahmejahr"
                />
                <label htmlFor="annahmejahr">Annahmejahr</label>
              </div>
            </div>
            <div className="col">
              <div className="form-floating mb-3">
                <select className="form-select" id="praxis" name="praxis">
                  <option value="a">Praxis A</option>
                  <option value="b">Praxis B</option>
                </select>
                <label htmlFor="praxis">Praxis</label>
              </div>
            </div>
          </div>
          <div className="row g-3">
            <div className="col-2">
              <div className="form-floating mb-3">
                <select className="form-select" id="anrede" name="anrede">
                  <option value="herr">Herr</option>
                  <option value="frau">Frau</option>
                  <option value="fraeulein">Fräulein</option>
                  <option value="mr">Mr</option>
                  <option value="mrs">Mrs</option>
                  <option value="ms">Ms</option>
                </select>
                <label htmlFor="anrede">Anrede</label>
              </div>
            </div>
            <div className="col">
              <div className="form-floating mb-3">
                <input type="text" className="form-control" id="vorname" name="vorname" placeholder="Vorname" />
                <label htmlFor="vorname">Vorname</label>
              </div>
            </div>
            <div className="col">
              <div className="form-floating mb-3">
                <input type="text" className="form-control" id="nachname" name="nachname" placeholder="Nachname" />
                <label htmlFor="nachname">Nachname</label>
              </div>
            </div>
          </div>
          <div className="row g-3">
            <div className="col">
              <div className="form-floating mb-3">
                <input type="text" className="form-control" id="strasse" name="strasse" placeholder="Strasse" />
                <label htmlFor="strasse">Straße</label>
              </div>
            </div>
            <div className="col-2">
              <div className="form-floating mb-3">
                <input
                  type="text"
                  className="form-control"
                  id="hausnummer"
                  name="hausnummer"
                  placeholder="Hausnummer"
                />
                <label htmlFor="hausnummer">Hausnummer</label>
              </div>
            </div>
            <div className="col">
              <div className="form-floating mb-3">
                <input type="text" className="form-control" id="wohnort" name="wohnort" placeholder="Wwohnort" />
                <label htmlFor="wohnort">Wohnort</label>
              </div>
            </div>
            <div className="col-2">
              <div className="form-floating mb-3">
                <input
                  type="text"
                  className="form-control"
                  id="postleitzahl"
                  name="postleitzahl"
                  placeholder="Postleitzahl"
                />
                <label htmlFor="postleitzahl">Postleitzahl</label>
              </div>
            </div>
          </div>
          <div className="row g-3">
            <div className="col-3">
              <div className="form-floating mb-3">
                <input type="text" className="form-control" id="staat" name="staat" placeholder="Staat" />
                <label htmlFor="staat">Staat</label>
              </div>
            </div>
            <div className="col-3">
              <div className="form-floating mb-3">
                <input
                  type="text"
                  className="form-control"
                  id="staatsangehoerigkeit"
                  name="staatsangehoerigkeit"
                  placeholder="Staatsangehörigkeit"
                />
                <label htmlFor="staatsangehoerigkeit">Staatsangehörigkeit</label>
              </div>
            </div>
            <div className="col-2">
              <div className="form-floating mb-3">
                <input type="text" className="form-control" id="titel" name="titel" placeholder="Titel" />
                <label htmlFor="titel">Titel</label>
              </div>
            </div>
            <div className="col-4">
              <div className="form-floating mb-3">
                <input type="text" className="form-control" id="beruf" name="beruf" placeholder="Beruf" />
                <label htmlFor="beruf">Beruf</label>
              </div>
            </div>
          </div>
          <div className="row g-3">
            <div className="col-3">
              <div className="form-floating mb-3">
                <input type="tel" className="form-control" id="telefon" name="telefon" placeholder="Telefon" />
                <label htmlFor="telefon">Telefon</label>
              </div>
            </div>
            <div className="col-3">
              <div className="form-floating mb-3">
                <input
                  type="tel"
                  className="form-control"
                  id="mobiltelefon"
                  name="mobiltelefon"
                  placeholder="Mobiltelefon"
                />
                <label htmlFor="mobiltelefon">Mobiltelefon</label>
              </div>
            </div>
            <div className="col-6">
              <div className="form-floating mb-3">
                <input type="email" className="form-control" id="eMail" name="eMail" placeholder="E-Mail" />
                <label htmlFor="eMail">E-Mail</label>
              </div>
            </div>
          </div>
          <div className="row g-3">
            <div className="col-3">
              <div className="form-floating mb-3">
                <select className="form-select" id="familienstand" name="familienstand">
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
            <div className="col">
              <div className="form-floating mb-3">
                <input
                  type="text"
                  className="form-control"
                  id="partnerVon"
                  name="partnerVon"
                  placeholder="Partner von"
                />
                <label htmlFor="partnerVon">Partner von</label>
              </div>
            </div>
            <div className="col">
              <div className="form-floating mb-3">
                <input type="text" className="form-control" id="kindVon" name="kindVon" placeholder="Kind von" />
                <label htmlFor="kindVon">Kind von</label>
              </div>
            </div>
          </div>
          <div className="row g-3">
            <div className="col">
              <div className="form-floating mb-3">
                <textarea
                  className="form-control"
                  id="memo"
                  name="memo"
                  style={{ height: "100px" }}
                  placeholder="Memo"
                ></textarea>
                <label htmlFor="memo">Memo</label>
              </div>
            </div>
          </div>
        </div>
        <button type="submit" className="btn btn-primary">
          Sichern
        </button>
      </form>
    </main>
  );
}
