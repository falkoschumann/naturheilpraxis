// Copyright (c) 2026 Falko Schumann. All rights reserved. MIT license.

import { createColumnHelper } from "@tanstack/react-table";
import { useEffect, useState } from "react";
import { useOutletContext } from "react-router";

import type { Leistung } from "../../../../../shared/domain/leistung";
import { LeistungenQuery, LeistungenQueryResult } from "../../../../../shared/domain/leistungen_query";
import { useMessageHandler } from "../../../components/message_handler_context";
import { filterGlobal, sortPlainDate, sortWährung } from "../../../components/table";
import TableComponent from "../../../components/table_component";
import { SearchComponent } from "../../../components/search_component";

// TODO link to Rechnung

export type LeistungenContext = {
  patientennummer: number;
};

export function LeistungenComponent() {
  const [suchtext, setSuchtext] = useState("");
  const { patientennummer } = useOutletContext<LeistungenContext>();
  const messageHandler = useMessageHandler();
  const [result, setResult] = useState(LeistungenQueryResult.create());

  useEffect(() => {
    async function runAsync() {
      const result = await messageHandler.sucheLeistungen(LeistungenQuery.create({ patientennummer }));
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
          data={result.leistungen}
          initialSorting={[{ id: "datum", desc: true }]}
          globalFilterFn={filterGlobal}
          suchText={suchtext}
        />
      </main>
    </>
  );
}

export default LeistungenComponent;

const columnHelper = createColumnHelper<Leistung>();
const columns = [
  columnHelper.accessor("praxis", { header: "Praxis", size: 100 }),
  columnHelper.accessor("datum", {
    header: "Datum",
    size: 100,
    cell: (info) => info?.getValue()?.toLocaleString("de-DE", { dateStyle: "medium" }),
    sortingFn: sortPlainDate<Leistung>("datum"),
  }),
  columnHelper.accessor("gebührenziffer", { header: "Ziffer", size: 80 }),
  columnHelper.accessor("beschreibung", { header: "Beschreibung", size: 200 }),
  columnHelper.accessor("einzelpreis", {
    header: "Einzelpreis",
    size: 100,
    cell: (info) => info?.getValue()?.toString(),
    sortingFn: sortWährung<Leistung>("einzelpreis"),
  }),
  columnHelper.accessor("anzahl", { header: "Anzahl", size: 80 }),
  columnHelper.accessor("summe", {
    header: "Summe",
    size: 100,
    cell: (info) => info?.getValue()?.toString(),
    sortingFn: sortWährung<Leistung>("summe"),
  }),
  columnHelper.accessor("kommentar", { header: "Kommentar", size: 200 }),
  columnHelper.accessor("rechnungsnummer", { header: "Rechnung", size: 120 }),
];
