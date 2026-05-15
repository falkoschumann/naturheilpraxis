// Copyright (c) 2026 Falko Schumann. All rights reserved. MIT license.

import { createColumnHelper } from "@tanstack/react-table";
import { useEffect, useState } from "react";

import type { Rechnung } from "../../../../shared/domain/rechnung";
import { RechnungenQuery, RechnungenQueryResult } from "../../../../shared/domain/rechnungen_query";
import { SearchComponent } from "../../components/search_component";
import TableComponent from "../../components/table_component";
import { filterGlobal, sortPlainDate, sortWährung } from "../../components/table";
import { useMessageHandler } from "../../components/message_handler_context";
import DefaultPageLayout from "../../layouts/default_page_layout";

// TODO show initially only unbezahlte Rechnungen
// TODO store table state like search in query params

export function RechnungenPage() {
  const [suchtext, setSuchtext] = useState("");
  const messageHandler = useMessageHandler();
  const [result, setResult] = useState(RechnungenQueryResult.create());

  useEffect(() => {
    async function runAsync() {
      const result = await messageHandler.sucheRechnungen(RechnungenQuery.create());
      setResult(result);
    }

    void runAsync();
  }, [messageHandler]);

  return (
    <DefaultPageLayout>
      <aside className="flex-shrink-0 container">
        <div className="d-flex py-3">
          <h2>Rechnungen</h2>
          <div className="ms-auto">
            <SearchComponent suchtext={suchtext} setSuchtext={setSuchtext} />
          </div>
        </div>
      </aside>
      <main className="flex-grow-1 container-fluid overflow-hidden">
        <TableComponent
          columns={columns}
          data={result.rechnungen}
          initialSorting={[{ id: "datum", desc: true }]}
          globalFilterFn={filterGlobal}
          suchText={suchtext}
        />
      </main>
    </DefaultPageLayout>
  );
}

export default RechnungenPage;

const columnHelper = createColumnHelper<Rechnung>();
const columns = [
  columnHelper.accessor("praxis", { header: "Praxis", size: 100 }),
  columnHelper.accessor("nummer", { header: "Nummer", size: 120 }),
  columnHelper.accessor("datum", {
    header: "Datum",
    size: 100,
    cell: (info) => info?.getValue()?.toLocaleString("de-DE", { dateStyle: "medium" }),
    sortingFn: sortPlainDate,
  }),
  columnHelper.accessor("patientId", { header: "Patient", size: 60 }),
  columnHelper.accessor("nachname", { header: "Nachname", size: 120 }),
  columnHelper.accessor("vorname", { header: "Vorname", size: 120 }),
  columnHelper.accessor("geburtsdatum", {
    header: "Geburtsdatum",
    size: 140,
    cell: (info) => info?.getValue()?.toLocaleString("de-DE", { dateStyle: "medium" }),
    sortingFn: sortPlainDate,
  }),
  columnHelper.accessor("summe", { header: "Summe", size: 100, sortingFn: sortWährung }),
  columnHelper.accessor("rechnungstext", { header: "Rechnungstext", size: 250 }),
  columnHelper.accessor("kommentar", { header: "Kommentar", size: 250 }),
  columnHelper.accessor("zustand", { header: "Zustand", size: 100 }),
];
