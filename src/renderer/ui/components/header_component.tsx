// Copyright (c) 2026 Falko Schumann. All rights reserved. MIT license.

import { NavLink } from "react-router";

import logo from "../assets/logo.svg";
import { PATIENTENKARTEI_PAGE, START_PAGE } from "./pages";

export default function HeaderComponent() {
  return (
    <header className="flex-shrink-0">
      <nav className="navbar navbar-expand-lg">
        <div className="container">
          <a href={START_PAGE} className="navbar-brand">
            <img
              src={logo}
              width="24"
              height="24"
              alt="Naturheilpraxis Logo"
              className="d-inline-block me-1 align-text-top"
            />
            Naturheilpraxis
          </a>
          <button
            className="navbar-toggler"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#mainMenu"
            aria-controls="mainMenu"
            aria-expanded="false"
            aria-label="Hauptmenü ein-/ausblenden"
          >
            <span className="navbar-toggler-icon"></span>
          </button>
          <div className="collapse navbar-collapse" id="mainMenu">
            <ul className="navbar-nav me-auto mb-2 mb-lg-0">
              <li className="nav-item">
                <NavLink to={PATIENTENKARTEI_PAGE} className="nav-link">
                  Patienten
                </NavLink>
              </li>
            </ul>
          </div>
        </div>
      </nav>
    </header>
  );
}
