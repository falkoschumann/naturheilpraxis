// Copyright (c) 2026 Falko Schumann. All rights reserved. MIT license.

import { createColumnHelper } from "@tanstack/react-table";
import { useEffect, useState } from "react";
import { useOutletContext } from "react-router";

import type { Rechnung } from "../../../../../shared/domain/rechnung";
import { RechnungenQuery, RechnungenQueryResult } from "../../../../../shared/domain/rechnungen_query";
import { useMessageHandler } from "../../../components/message_handler_context";
import { filterGlobal, sortPlainDate, sortWährung } from "../../../components/table";
import TableComponent from "../../../components/table_component";
import { SearchComponent } from "../../../components/search_component";

export type RechnungenContext = {
  patientennummer: number;
};

export function RechnungenComponent() {
  const [suchtext, setSuchtext] = useState("");
  const { patientennummer } = useOutletContext<RechnungenContext>();
  const messageHandler = useMessageHandler();
  const [result, setResult] = useState(RechnungenQueryResult.create());

  useEffect(() => {
    async function runAsync() {
      const result = await messageHandler.sucheRechnungen(RechnungenQuery.create({ patientennummer }));
      setResult(result);
    }

    void runAsync();
  }, [messageHandler, patientennummer]);

  return (
    <>
      <aside className="flex-shrink-0 container">
        <div className="d-flex py-3">
          <div className="ms-auto">
            <SearchComponent suchtext={suchtext} setSuchtext={setSuchtext} />
          </div>
        </div>
      </aside>
      <main className="flex-grow-1 container overflow-hidden">
        <TableComponent
          columns={columns}
          data={result.rechnungen}
          initialSorting={[{ id: "datum", desc: true }]}
          globalFilterFn={filterGlobal}
          suchText={suchtext}
        />
      </main>
    </>
  );
}

export default RechnungenComponent;

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
  columnHelper.accessor("summe", { header: "Summe", size: 100, sortingFn: sortWährung }),
  columnHelper.accessor("rechnungstext", { header: "Rechnungstext", size: 250 }),
  columnHelper.accessor("kommentar", { header: "Kommentar", size: 250 }),
  columnHelper.accessor("zustand", { header: "Zustand", size: 100 }),
];
