// Copyright (c) 2026 Falko Schumann. MIT license.

import { Link, NavLink, Outlet, useLocation } from "react-router";

const stammdaten = ["/praxen"];

export function MainLayout() {
  const { pathname } = useLocation();
  const stammdatenAktiv = stammdaten.some((pfad) => pathname.startsWith(pfad));

  return (
    <>
      <nav className="navbar navbar-expand bg-primary" data-bs-theme="dark" aria-label="Hauptnavigation">
        <div className="container-fluid">
          <Link className="navbar-brand" to="/">
            <i className="fa-solid fa-leaf me-2" aria-hidden="true"></i>
            Naturheilpraxis
          </Link>
          <ul className="navbar-nav me-auto">
            <li className="nav-item dropdown">
              <a
                className={`nav-link dropdown-toggle${stammdatenAktiv ? " active" : ""}`}
                href="#"
                role="button"
                data-bs-toggle="dropdown"
                aria-expanded="false"
              >
                <i className="fa-solid fa-gear me-1" aria-hidden="true"></i>
                Stammdaten
              </a>
              <ul className="dropdown-menu">
                <li>
                  <NavLink className="dropdown-item" to="/praxen">
                    Praxen
                  </NavLink>
                </li>
              </ul>
            </li>
          </ul>
        </div>
      </nav>
      <main className="container-xl py-4">
        <Outlet />
      </main>
    </>
  );
}
