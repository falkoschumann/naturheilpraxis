// Copyright (c) 2026 Falko Schumann. All rights reserved. MIT license.

import { createColumnHelper } from "@tanstack/react-table";
import { useEffect, useState } from "react";
import { useOutletContext } from "react-router";

import type { Diagnose } from "../../../../../shared/domain/diagnose";
import { DiagnosenQuery, DiagnosenQueryResult } from "../../../../../shared/domain/diagnosen_query";
import { useMessageHandler } from "../../../components/message_handler_context";
import { filterGlobal, sortPlainDate } from "../../../components/table";
import TableComponent from "../../../components/table_component";
import { SearchComponent } from "../../../components/search_component";

// TODO link to Rechnungen

export type DiagnosenContext = {
  patientennummer: number;
};

export function DiagnosenComponent() {
  const [suchtext, setSuchtext] = useState("");
  const { patientennummer } = useOutletContext<DiagnosenContext>();
  const messageHandler = useMessageHandler();
  const [result, setResult] = useState(DiagnosenQueryResult.create());

  useEffect(() => {
    async function runAsync() {
      const result = await messageHandler.sucheDiagnosen(DiagnosenQuery.create({ patientennummer }));
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
          data={result.diagnosen}
          initialSorting={[{ id: "datum", desc: true }]}
          globalFilterFn={filterGlobal}
          suchText={suchtext}
        />
      </main>
    </>
  );
}

export default DiagnosenComponent;

const columnHelper = createColumnHelper<Diagnose>();
const columns = [
  columnHelper.accessor("datum", {
    header: "Datum",
    size: 100,
    cell: (info) => info?.getValue()?.toLocaleString("de-DE", { dateStyle: "medium" }),
    sortingFn: sortPlainDate,
  }),
  columnHelper.accessor("beschreibung", { header: "Beschreibung", size: 600 }),
];
