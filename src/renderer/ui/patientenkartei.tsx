// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

import { NavLink } from "react-router";

export default function Patientenkartei() {
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
            <th scope="col">Nachnahme</th>
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
          <tr>
            <th scope="row">1</th>
            <td>Herr</td>
            <td>Otto</td>
            <td>Mark</td>
            <td>01.01.1980</td>
            <td>Stadtstraße 18</td>
            <td>52156</td>
            <td>Köln</td>
            <td>
              <a href="tel:0123-1234567">0123 1234567</a>
            </td>
            <td>
              <a href="tel:0177-9876543">0177 9876543</a>
            </td>
            <td>
              <a href="mailto:otto.mark@example.com">otto.mark@example.com</a>
            </td>
          </tr>
          <tr>
            <th scope="row">2</th>
            <td>Herr</td>
            <td>Thornton</td>
            <td>Jacob</td>
            <td>05.07.2001</td>
            <td>Homburgstraße 95</td>
            <td>37619</td>
            <td>Bodenwerder</td>
            <td>
              <a href="tel:0123-1234567">0123 1234567</a>
            </td>
            <td>
              <a href="tel:0177-9876543">0177 9876543</a>
            </td>
            <td>
              <a href="mailto:jacob.thornton@example.com">jacob.thornton@example.com</a>
            </td>
          </tr>
          <tr>
            <th scope="row">3</th>
            <td>Herr</td>
            <td>Doe</td>
            <td>John</td>
            <td>15.03.1995</td>
            <td>Stadtstraße 18</td>
            <td>52156</td>
            <td>Köln</td>
            <td>
              <a href="tel:0123-1234567">0123 1234567</a>
            </td>
            <td>
              <a href="tel:0177-9876543">0177 9876543</a>
            </td>
            <td>
              <a href="mailto:john.doe@example.com">john.doe@example.com</a>
            </td>
          </tr>
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
