// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

import DefaultPageLayout from "../../layouts/default_page_layout";
import { usePatient } from "./patient_hook";
import { PatientComponent } from "./patient";
import { NimmPatientAufCommand } from "../../../../shared/domain/nimm_patient_auf_command";

// TODO link spouse and parent
// TODO add back link or link to Patientenkartei

export default function PatientenkarteikartePage() {
  const [result, nimmPatientAuf] = usePatient();

  const istAufnahme = result.patient == null;

  return (
    <DefaultPageLayout>
      <aside className="flex-shrink-0 container py-3">
        <h2 className="mb-3">
          {istAufnahme
            ? "Neuer Patient"
            : `${result.patient.nachname}, ${result.patient.vorname} (Nr. ${result.patient.nummer}), geboren am ${result.patient.geburtsdatum?.toLocaleString(undefined, { dateStyle: "medium" })}`}
        </h2>
        <ul className="nav nav-tabs">
          <li className="nav-item">
            <a className="nav-link active" aria-current="page" href="#">
              Patient
            </a>
          </li>
          <li className="nav-item">
            <a className={`nav-link ${istAufnahme ? "disabled" : ""}`} aria-disabled={istAufnahme} href="#">
              Leistungen
            </a>
          </li>
        </ul>
      </aside>
      <PatientComponent
        result={result}
        onAufnahme={(patient) => nimmPatientAuf(NimmPatientAufCommand.create({ patient }))}
      />
    </DefaultPageLayout>
  );
}
