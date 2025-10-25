// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

import { NavLink, Route, Routes } from "react-router";

import logo from "./assets/logo.svg";
import {
  LEISTUNGEN_PAGE,
  PATIENT_AUFNEHMEN_PAGE,
  PATIENTENKARTEI_PAGE,
  PATIENTENKARTEIKARTE_PAGE,
  RECHNUNGEN_PAGE,
  START_PAGE,
} from "./components/pages";
import PatientenkarteiPage from "./pages/patientenkartei";
import PatientenkarteikartePage from "./pages/patientenkarteikarte";
import StartseitePage from "./pages/startseite";

export default function App() {
  return (
    <>
      <Header />
      <Routes>
        <Route path={START_PAGE} element={<StartseitePage />} />
        <Route path={PATIENTENKARTEI_PAGE} element={<PatientenkarteiPage />} />
        <Route path={PATIENTENKARTEIKARTE_PAGE} element={<PatientenkarteikartePage />} />
        <Route path={PATIENT_AUFNEHMEN_PAGE} element={<PatientenkarteikartePage />} />
      </Routes>
    </>
  );
}

function Header() {
  return (
    <header>
      <nav className="navbar navbar-expand-lg">
        <div className="container-fluid">
          <a href={START_PAGE} className="navbar-brand">
            <img src={logo} className="me-2" width="32" height="32" alt="Logo" aria-hidden="true" />
            <span>Naturheilpraxis</span>
          </a>
          <button
            className="navbar-toggler"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#navbarSupportedContent"
            aria-controls="navbarSupportedContent"
            aria-expanded="false"
            aria-label="Toggle navigation"
          >
            <span className="navbar-toggler-icon"></span>
          </button>
          <div className="collapse navbar-collapse" id="navbarSupportedContent">
            <ul className="navbar-nav me-auto mb-2 mb-lg-0">
              <li className="nav-item">
                <NavLink to={PATIENTENKARTEI_PAGE} className="nav-link">
                  Patienten
                </NavLink>
              </li>
              <li className="nav-item">
                <NavLink to={LEISTUNGEN_PAGE} className="nav-link">
                  Leistungen
                </NavLink>
              </li>
              <li className="nav-item">
                <NavLink to={RECHNUNGEN_PAGE} className="nav-link">
                  Rechnungen
                </NavLink>
              </li>
            </ul>
          </div>
        </div>
      </nav>
    </header>
  );
}
