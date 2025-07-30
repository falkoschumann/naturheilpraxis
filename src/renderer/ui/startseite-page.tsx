// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

import { NavLink } from "react-router";

import { PATIENT_AUFNEHMEN_PAGE, PATIENTENKARTEI_PAGE } from "./pages";

export default function StartseitePage() {
  return (
    <main className="container my-4">
      <h2>Naturheilpraxis</h2>
      <div className="my-5 d-grid gap-2 col-4">
        <NavLink to={PATIENTENKARTEI_PAGE} className="btn btn-primary" type="button">
          Patientenkartei
        </NavLink>
        <NavLink to={PATIENT_AUFNEHMEN_PAGE} className="btn btn-primary" type="button">
          Nimm Patient auf
        </NavLink>
      </div>
    </main>
  );
}
