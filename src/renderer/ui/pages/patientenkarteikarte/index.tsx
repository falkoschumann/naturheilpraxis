// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

import { Outlet, useNavigate } from "react-router";

import { PATIENTENKARTEIKARTE_LEISTUNGEN_PAGE, PATIENTENKARTEIKARTE_PAGE } from "../../components/pages";
import DefaultPageLayout from "../../layouts/default_page_layout";
import { usePatient } from "./patient_hook";

// TODO link spouse and parent
// TODO add back link or link to Patientenkartei

export default function PatientenkarteikartePage() {
  const navigate = useNavigate();
  const [result, nimmPatientAuf] = usePatient();

  const istAufnahme = result.patient?.nummer == null;

  return (
    <DefaultPageLayout>
      <aside className="flex-shrink-0 container py-3">
        <div className="mb-3 d-flex align-items-center">
          <h2>
            {istAufnahme
              ? "Neuer Patient"
              : `${result.patient.nachname}, ${result.patient.vorname} (Nr. ${result.patient.nummer}), geboren am ${result.patient.geburtsdatum?.toLocaleString(undefined, { dateStyle: "medium" })}`}
          </h2>
          <button className="ms-auto btn btn-sm btn-secondary" onClick={() => navigate(-1)}>
            Zurück
          </button>
        </div>
        <ul className="nav nav-tabs">
          <li className="nav-item">
            <a
              className="nav-link active"
              aria-current="page"
              href={`${PATIENTENKARTEIKARTE_PAGE.replace(":nummer?", result.patient?.nummer?.toString() || "")}`}
            >
              Patient
            </a>
          </li>
          <li className="nav-item">
            <a
              className={`nav-link ${istAufnahme ? "disabled" : ""}`}
              aria-disabled={istAufnahme}
              href={`${PATIENTENKARTEIKARTE_LEISTUNGEN_PAGE.replace(":nummer", result.patient?.nummer?.toString() || "")}`}
            >
              Leistungen
            </a>
          </li>
        </ul>
      </aside>
      <Outlet context={{ result, nimmPatientAuf }} />
    </DefaultPageLayout>
  );
}
