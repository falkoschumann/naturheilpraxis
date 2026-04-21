// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

import { useEffect, useState } from "react";
import { NavLink, Outlet, useNavigate, useParams } from "react-router";

import type { NimmPatientAufCommand } from "../../../../shared/domain/nimm_patient_auf_command";
import { PatientQuery, PatientQueryResult } from "../../../../shared/domain/patient_query";
import { useMessageHandler } from "../../components/message_handler_context";
import {
  PATIENTENKARTEIKARTE_LEISTUNGEN_PAGE,
  PATIENTENKARTEIKARTE_PAGE,
  PATIENTENKARTEIKARTE_RECHNUNGEN_PAGE,
} from "../../components/pages";
import DefaultPageLayout from "../../layouts/default_page_layout";
import type { PatientContext } from "./patient";
import type { LeistungenContext } from "./leistungen";

// TODO hide tabs when new Patient
// TODO add back link or link to Patientenkartei
// TODO link spouse and parent

type PatientenkarteikarteContext = PatientContext & LeistungenContext;

export default function PatientenkarteikartePage() {
  const navigate = useNavigate();
  const { nummer } = useParams();
  const messageHandler = useMessageHandler();
  const [result, setResult] = useState(PatientQueryResult.create());

  const istAufnahme = result.patient?.nummer == null;

  useEffect(() => {
    async function runAsync() {
      const result = await messageHandler.suchePatient(PatientQuery.create({ nummer: Number(nummer) }));
      setResult(result);
    }

    void runAsync();
  }, [messageHandler, nummer]);

  async function handleNimmPatientAuf(command: NimmPatientAufCommand) {
    const status = await messageHandler.nimmPatientAuf(command);
    if (status.isSuccess) {
      const result = await messageHandler.suchePatient(PatientQuery.create({ nummer: Number(nummer) }));
      setResult(result);
    }
    return status;
  }

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
            <NavLink
              to={`${PATIENTENKARTEIKARTE_PAGE.replace(":nummer?", result.patient?.nummer?.toString() || "")}`}
              className="nav-link"
              end
            >
              Patient
            </NavLink>
          </li>
          <li className="nav-item">
            <NavLink
              to={`${PATIENTENKARTEIKARTE_LEISTUNGEN_PAGE.replace(":nummer", result.patient?.nummer?.toString() || "")}`}
              className={`nav-link ${istAufnahme ? "disabled" : ""}`}
              aria-disabled={istAufnahme}
            >
              Leistungen
            </NavLink>
          </li>
          <li className="nav-item">
            <NavLink
              to={`${PATIENTENKARTEIKARTE_RECHNUNGEN_PAGE.replace(":nummer", result.patient?.nummer?.toString() || "")}`}
              className={`nav-link ${istAufnahme ? "disabled" : ""}`}
              aria-disabled={istAufnahme}
            >
              Rechnungen
            </NavLink>
          </li>
        </ul>
      </aside>
      <Outlet
        context={
          {
            result,
            patientennummer: result.patient?.nummer || -1,
            onNimmPatientAuf: handleNimmPatientAuf,
          } satisfies PatientenkarteikarteContext
        }
      />
    </DefaultPageLayout>
  );
}
