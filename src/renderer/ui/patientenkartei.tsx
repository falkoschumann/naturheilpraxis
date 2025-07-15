// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

import { useEffect, useState } from "react";
import { NavLink, useNavigate } from "react-router";

import type { Patient } from "../../main/domain/naturheilpraxis";
import { PATIENT_AUFNEHMEN_PAGE, PATIENTENKARTEI_PAGE } from "./pages";

export default function Patientenkartei() {
  const [patienten, setPatienten] = useState<Patient[]>();
  const navigate = useNavigate();

  useEffect(() => {
    async function queryPatientenkartei() {
      const result = await window.naturheilpraxis.patientenkartei({});
      setPatienten(result.patienten);
    }

    void queryPatientenkartei();
  }, []);

  function handlePatientClick(nummer: number) {
    navigate(`${PATIENTENKARTEI_PAGE}/${nummer}`);
  }

  function handleStopPropagation(event: React.MouseEvent<HTMLElement>) {
    event.stopPropagation();
  }

  return (
    <main className="container-fluid my-4">
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
      <div style={{ height: "calc(100vh - 13.5rem)", overflowY: "auto" }}>
        <table className="table table-hover">
          <thead>
            <tr>
              <th scope="col" className="sticky-top">
                #
              </th>
              <th scope="col" className="sticky-top">
                Anrede
              </th>
              <th scope="col" className="sticky-top">
                Nachname
              </th>
              <th scope="col" className="sticky-top">
                Vorname
              </th>
              <th scope="col" className="sticky-top">
                Geburtsdatum
              </th>
              <th scope="col" className="sticky-top">
                Straße
              </th>
              <th scope="col" className="sticky-top">
                PLZ
              </th>
              <th scope="col" className="sticky-top">
                Wohnort
              </th>
              <th scope="col" className="sticky-top">
                Telefon
              </th>
              <th scope="col" className="sticky-top">
                Mobil
              </th>
              <th scope="col" className="sticky-top">
                E-Mail
              </th>
            </tr>
          </thead>
          <tbody>
            {!patienten && (
              <tr>
                <td colSpan={11}>
                  <div className="d-flex justify-content-center align-items-center">
                    <div className="spinner-border text-primary" role="status">
                      <span className="visually-hidden">Loading...</span>
                    </div>
                    <div className="ms-2">Lade Patienten ...</div>
                  </div>
                </td>
              </tr>
            )}
            {patienten?.map((patient: Patient) => (
              <tr id={String(patient.nummer)} key={patient.nummer} onClick={() => handlePatientClick(patient.nummer)}>
                <th scope="row">{patient.nummer}</th>
                <td>{patient.anrede}</td>
                <td>{patient.nachname}</td>
                <td>{patient.vorname}</td>
                <td>{new Date(patient.geburtsdatum).toLocaleDateString(undefined, { dateStyle: "medium" })}</td>
                <td>{patient.strasse}</td>
                <td>{patient.postleitzahl}</td>
                <td>{patient.wohnort}</td>
                <td>
                  <a href={`tel:${patient.telefon}`} onClick={handleStopPropagation}>
                    {patient.telefon}
                  </a>
                </td>
                <td>
                  <a href={`tel:${patient.mobil}`} onClick={handleStopPropagation}>
                    {patient.mobil}
                  </a>
                </td>
                <td>
                  <a href={`mailto:${patient.eMail}`} onClick={handleStopPropagation}>
                    {patient.eMail}
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="btn-toolbar mt-3" role="toolbar" aria-label="Aktionen für Patienten">
        <NavLink to={PATIENT_AUFNEHMEN_PAGE} type="button" className="btn btn-primary">
          Nimm Patient auf
        </NavLink>
      </div>
    </main>
  );
}
