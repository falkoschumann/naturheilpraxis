// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

import { useEffect, useState } from "react";
import { NavLink } from "react-router";
import type { Patient } from "../../main/domain/naturheilpraxis";

export default function Patientenkartei() {
  const [patienten, setPatienten] = useState([]);

  useEffect(() => {
    async function queryPatientenkartei() {
      const result = await window.naturheilpraxis.patientenkartei({});
      setPatienten(result.patienten);
    }

    void queryPatientenkartei();
  });

  return (
    <main className="container my-4">
      <div className="d-flex">
        <h2 className="mb-3">Patienten</h2>
        <div className="ms-auto">
          <form className="d-flex" role="search">
            <input className="form-control me-2" type="search" placeholder="Suche" aria-label="Suche" />
            <button className="btn btn-outline-primary" type="submit">
              Suche
            </button>
          </form>
        </div>
      </div>
      <table className="table table-hover">
        <thead>
          <tr>
            <th scope="col">#</th>
            <th scope="col">Anrede</th>
            <th scope="col">Nachname</th>
            <th scope="col">Vorname</th>
            <th scope="col">Geburtsdatum</th>
            <th scope="col">Straße</th>
            <th scope="col">PLZ</th>
            <th scope="col">Wohnort</th>
            <th scope="col">Telefon</th>
            <th scope="col">Mobil</th>
            <th scope="col">E-Mail</th>
          </tr>
        </thead>
        <tbody>
          {patienten.map((patient: Patient) => (
            <tr key={patient.nummer}>
              <th scope="row">{patient.nummer}</th>
              <td>{patient.anrede}</td>
              <td>{patient.nachname}</td>
              <td>{patient.vorname}</td>
              <td>{new Date(patient.geburtsdatum).toLocaleDateString(undefined, { dateStyle: "medium" })}</td>
              <td>{patient.strasse}</td>
              <td>{patient.postleitzahl}</td>
              <td>{patient.wohnort}</td>
              <td>
                <a href={`tel:${patient.telefon}`}>{patient.telefon}</a>
              </td>
              <td>
                <a href={`tel:${patient.mobil}`}>{patient.mobil}</a>
              </td>
              <td>
                <a href={`mailto:${patient.eMail}`}>{patient.eMail}</a>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="btn-toolbar" role="toolbar" aria-label="Aktionen für Patienten">
        <NavLink to="/patient" type="button" className="btn btn-primary">
          Nimm Patient auf
        </NavLink>
      </div>
    </main>
  );
}
