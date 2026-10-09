// Copyright (c) 2026 Falko Schumann. MIT license.

import { useCallback, useEffect, useState } from "react";
import { Link, NavLink, Outlet, useLocation } from "react-router";

import type { NaturheilpraxisApi } from "../../../shared/application/naturheilpraxis-api.ts";
import type { PraxenErmittelnQueryResult } from "../../../shared/domain/praxenansicht.ts";
import { Toast } from "../components/toast.tsx";
import { AktuellePraxisContext } from "./aktuelle-praxis.ts";

const stammdaten = ["/praxen", "/gebuehren"];

// The choice of the current Praxis is a preference of this computer.
const aktuellePraxisSchluessel = "naturheilpraxis.aktuellePraxis";

export function MainLayout({ api }: { api: NaturheilpraxisApi }) {
  const { pathname } = useLocation();
  const stammdatenAktiv = stammdaten.some((pfad) => pathname.startsWith(pfad));
  const [praxen, setPraxen] = useState<PraxenErmittelnQueryResult>([]);
  const [gewaehltePraxis, setGewaehltePraxis] = useState(leseAktuellePraxis);
  const [meldung, setMeldung] = useState<string>();

  // The Praxen can change on the Praxen page, so they are loaded again on
  // every navigation.
  useEffect(() => {
    let aktuell = true;
    api.praxenErmitteln({ type: "praxen-ermitteln", parameters: {} }).then(
      (praxen) => {
        if (aktuell) {
          setPraxen(praxen);
        }
      },
      () => undefined,
    );
    return () => {
      aktuell = false;
    };
  }, [api, pathname]);

  const aktuellePraxis = praxen.some((praxis) => praxis.praxiskuerzel === gewaehltePraxis)
    ? gewaehltePraxis
    : praxen[0]?.praxiskuerzel;

  function waehlePraxis(praxiskuerzel: string) {
    setGewaehltePraxis(praxiskuerzel);
    speichereAktuellePraxis(praxiskuerzel);
    const name = praxen.find((praxis) => praxis.praxiskuerzel === praxiskuerzel)?.name ?? praxiskuerzel;
    setMeldung(`Neue Einträge werden jetzt in der Praxis „${name}“ erfasst.`);
  }

  const schliesseMeldung = useCallback(() => setMeldung(undefined), []);

  return (
    <AktuellePraxisContext value={aktuellePraxis}>
      <nav className="navbar navbar-expand bg-primary" data-bs-theme="dark" aria-label="Hauptnavigation">
        <div className="container-fluid">
          <Link className="navbar-brand" to="/patienten">
            <i className="fa-solid fa-leaf me-2" aria-hidden="true"></i>
            Naturheilpraxis
          </Link>
          <ul className="navbar-nav me-auto">
            <li className="nav-item">
              <NavLink className="nav-link" to="/patienten">
                <i className="fa-solid fa-address-card me-1" aria-hidden="true"></i>
                Patienten
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink className="nav-link" to="/abrechnung">
                <i className="fa-solid fa-file-invoice-dollar me-1" aria-hidden="true"></i>
                Abrechnung
              </NavLink>
            </li>
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
                <li>
                  <NavLink className="dropdown-item" to="/gebuehren">
                    Gebührenverzeichnis
                  </NavLink>
                </li>
              </ul>
            </li>
          </ul>
          {praxen.length > 0 && (
            <div className="d-flex align-items-center gap-2">
              <label htmlFor="aktuelle-praxis" className="text-white small text-nowrap">
                Aktuelle Praxis
              </label>
              <select
                id="aktuelle-praxis"
                className="form-select form-select-sm"
                data-bs-theme="light"
                value={aktuellePraxis}
                onChange={(event) => waehlePraxis(event.target.value)}
              >
                {praxen.map((praxis) => (
                  <option key={praxis.praxiskuerzel} value={praxis.praxiskuerzel}>
                    {praxis.name}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      </nav>
      <main className="container-xl py-4">
        <Outlet />
      </main>
      {meldung !== undefined && <Toast message={meldung} onClose={schliesseMeldung} />}
    </AktuellePraxisContext>
  );
}

// The storage of the browser may be unavailable; then the first Praxis is the
// current one.
function leseAktuellePraxis(): string | undefined {
  try {
    return localStorage.getItem(aktuellePraxisSchluessel) ?? undefined;
  } catch {
    return undefined;
  }
}

function speichereAktuellePraxis(praxiskuerzel: string): void {
  try {
    localStorage.setItem(aktuellePraxisSchluessel, praxiskuerzel);
  } catch {
    // The choice is kept for this session only.
  }
}
