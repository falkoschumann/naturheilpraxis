// Copyright (c) 2026 Falko Schumann. All rights reserved. MIT license.

import { NavLink } from "react-router";

import logo from "../assets/logo.svg";
import { PATIENTENKARTEI_PAGE, START_PAGE } from "./pages";

export default function HeaderComponent() {
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
            </ul>
          </div>
        </div>
      </nav>
    </header>
  );
}
