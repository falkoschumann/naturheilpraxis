// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

import { NavLink } from "react-router";

import { PATIENTENKARTEI_PAGE, PATIENTENKARTEIKARTE_PAGE } from "../../components/pages";
import DefaultPageLayout from "../../layouts/default_page_layout";

export default function StartseitePage() {
  return (
    <DefaultPageLayout>
      <main className="container my-4">
        <h2>Naturheilpraxis</h2>
        <div className="my-5 d-grid gap-2 col-4">
          <NavLink to={PATIENTENKARTEI_PAGE} className="btn btn-primary" type="button">
            Patientenkartei
          </NavLink>
          <NavLink to={PATIENTENKARTEIKARTE_PAGE} className="btn btn-primary" type="button">
            Nimm Patient auf
          </NavLink>
        </div>
      </main>
    </DefaultPageLayout>
  );
}
