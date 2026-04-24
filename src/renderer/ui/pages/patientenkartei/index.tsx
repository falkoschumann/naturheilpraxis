// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

import { createColumnHelper } from "@tanstack/react-table";
import { useEffect, useState } from "react";
import { NavLink, useNavigate } from "react-router";

import type { Patient } from "../../../../shared/domain/patient";
import { PatientenQueryResult } from "../../../../shared/domain/patienten_query";
import { PATIENTENKARTEIKARTE_PAGE } from "../../components/pages";
import { useMessageHandler } from "../../components/message_handler_context";
import { filterGlobal, sortPlainDate } from "../../components/table";
import TableComponent from "../../components/table_component";
import DefaultPageLayout from "../../layouts/default_page_layout";
import { PatientQuery } from "../../../../shared/domain/patient_query";
import { SearchComponent } from "../../components/search_component";

// TODO store table state like search in query params

export function PatientenkarteiPage() {
  const [suchtext, setSuchtext] = useState("");
  const messageHandler = useMessageHandler();
  const [result, setResult] = useState(PatientenQueryResult.create());

  useEffect(() => {
    async function runAsync() {
      const result = await messageHandler.suchePatienten(PatientQuery.create());
      setResult(result);
    }

    void runAsync();
  }, [messageHandler]);

  const navigate = useNavigate();

  function handlePatientClick(patient: Patient) {
    navigate({ pathname: PATIENTENKARTEIKARTE_PAGE.replace(":nummer?", patient.nummer!.toString()) });
  }

  return (
    <DefaultPageLayout>
      <aside className="flex-shrink-0 container">
        <div className="d-flex py-3">
          <h2>Patienten</h2>
          <div className="ms-auto">
            <SearchComponent suchtext={suchtext} setSuchtext={setSuchtext} />
          </div>
        </div>
      </aside>
      <main className="flex-grow-1 container-fluid overflow-hidden">
        <TableComponent
          columns={columns}
          data={result.patienten}
          initialSorting={[{ id: "geburtsdatum", desc: true }]}
          globalFilterFn={filterGlobal}
          suchText={suchtext}
          onSelectRow={handlePatientClick}
        />
      </main>
      <aside className="flex-shrink-0 container">
        <div className="btn-toolbar py-3" role="toolbar" aria-label="Aktionen für Patienten">
          <NavLink to={PATIENTENKARTEIKARTE_PAGE} type="button" className="btn btn-primary">
            Nimm Patient auf
          </NavLink>
        </div>
      </aside>
    </DefaultPageLayout>
  );
}

export default PatientenkarteiPage;

const columnHelper = createColumnHelper<Patient>();
const columns = [
  columnHelper.accessor("nummer", { header: "#", size: 60 }),
  columnHelper.accessor("anrede", { header: "Anrede", size: 80 }),
  columnHelper.accessor("nachname", { header: "Nachname", size: 120 }),
  columnHelper.accessor("vorname", { header: "Vorname", size: 120 }),
  columnHelper.accessor("geburtsdatum", {
    header: "Geburtsdatum",
    size: 140,
    cell: (info) => info?.getValue()?.toLocaleString("de-DE", { dateStyle: "medium" }),
    sortingFn: sortPlainDate<Patient>("geburtsdatum"),
  }),
  columnHelper.accessor("straße", { header: "Straße", size: 250 }),
  columnHelper.accessor("postleitzahl", { header: "PLZ", size: 80 }),
  columnHelper.accessor("wohnort", { header: "Wohnort", size: 140 }),
  columnHelper.accessor("telefon", {
    header: "Telefon",
    size: 140,
    cell: (info) => (
      <a href={`tel:${info.getValue()}`} onClick={(event) => event.stopPropagation()}>
        {info.getValue()}
      </a>
    ),
  }),
  columnHelper.accessor("mobil", {
    header: "Mobil",
    size: 140,
    cell: (info) => (
      <a href={`tel:${info.getValue()}`} onClick={(event) => event.stopPropagation()}>
        {info.getValue()}
      </a>
    ),
  }),
  columnHelper.accessor("eMail", {
    header: "E-Mail",
    size: 250,
    cell: (info) => (
      <a href={`mailto:${info.getValue()}`} onClick={(event) => event.stopPropagation()}>
        {info.getValue()}
      </a>
    ),
  }),
];
