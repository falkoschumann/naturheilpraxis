// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

import { NavLink, Route, Routes } from "react-router";

import Patientenkarteikarte from "./patientenkarteikarte";
import Patientenkartei from "./patientenkartei";
import logo from "./logo.svg";

export default function App() {
  return (
    <>
      <AppHeader />
      <Routes>
        <Route path="/patienten" element={<Patientenkartei />} />
        <Route path="/patient" element={<Patientenkarteikarte />} />
      </Routes>
    </>
  );
}

function AppHeader() {
  return (
    <header>
      <nav className="navbar navbar-expand-lg">
        <div className="container">
          <a href="/" className="navbar-brand">
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
                <NavLink to="/patienten" className="nav-link">
                  Patienten
                </NavLink>
              </li>
              <li className="nav-item">
                <NavLink to="/leistungen" className="nav-link">
                  Leistungen
                </NavLink>
              </li>
              <li className="nav-item">
                <NavLink to="/rechnungen" className="nav-link">
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
