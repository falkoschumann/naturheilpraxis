// Copyright (c) 2026 Falko Schumann. All rights reserved. MIT license.

import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  type SortingState,
  useReactTable,
} from "@tanstack/react-table";
import { useEffect, useRef, useState } from "react";
import { useOutletContext } from "react-router";

import type { Leistung } from "../../../../../shared/domain/leistung";
import { LeistungenQuery, LeistungenQueryResult } from "../../../../../shared/domain/leistungen_query";
import { useMessageHandler } from "../../../components/message_handler_context";
import { useVirtualizer } from "@tanstack/react-virtual";
import { sortPlainDate, sortWährung } from "../../../components/table";

// TODO search
// TODO link to Rechnung

export type LeistungenContext = {
  patientennummer: number;
};

export function LeistungenComponent() {
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
    <main className="flex-grow-1 container overflow-hidden">
      <LeistungenTable data={result.leistungen} />
    </main>
  );
}

export default LeistungenComponent;

function LeistungenTable({ data }: { data: Leistung[] }) {
  "use no memo";

  const [sorting, setSorting] = useState<SortingState>([{ id: "datum", desc: true }]);

  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable({
    columns,
    data,
    state: { sorting },
    sortDescFirst: false,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onSortingChange: setSorting,
  });

  const { rows } = table.getRowModel();

  const parentRef = useRef<HTMLDivElement>(null);

  const virtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 41,
    overscan: 10,
  });

  const virtualRows = virtualizer.getVirtualItems();
  const firstVirtualRow = virtualRows[0];
  const lastVirtualRow = virtualRows[virtualRows.length - 1];
  const paddingTop = firstVirtualRow ? firstVirtualRow.start : 0;
  const paddingBottom = lastVirtualRow ? virtualizer.getTotalSize() - lastVirtualRow.end : 0;

  return (
    <div ref={parentRef} className="h-100 overflow-auto">
      <div style={{ height: `${virtualizer.getTotalSize()}px` }}>
        <table className="table table-hover mb-0">
          <thead className="sticky-top">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    scope="col"
                    className="text-nowrap"
                    style={{ width: `${header.column.getSize()}px` }}
                  >
                    <div
                      className={`d-flex align-items-center ${header.column.getCanSort() ? "user-select-none cursor-pointer" : ""}`}
                      onClick={header.column.getToggleSortingHandler()}
                      title={
                        header.column.getCanSort()
                          ? header.column.getNextSortingOrder() === "asc"
                            ? "Sort ascending"
                            : header.column.getNextSortingOrder() === "desc"
                              ? "Sort descending"
                              : "Clear sort"
                          : undefined
                      }
                    >
                      {flexRender(header.column.columnDef.header, header.getContext())}
                      {{
                        asc: <i className="fa-solid fa-sort-up ms-auto"></i>,
                        desc: <i className="fa-solid fa-sort-down ms-auto"></i>,
                      }[header.column.getIsSorted() as string] || <i className="fa-solid fa-sort ms-auto"></i>}
                    </div>
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {paddingTop > 0 ? (
              <tr>
                <td style={{ height: `${paddingTop}px` }} colSpan={table.getVisibleLeafColumns().length} />
              </tr>
            ) : null}
            {virtualRows.map((virtualRow) => {
              const row = rows[virtualRow.index]!;
              return (
                <tr
                  key={row.id}
                  style={{
                    height: `${virtualRow.size}px`,
                  }}
                >
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="text-nowrap">
                      <div className="text-truncate" style={{ width: `${cell.column.getSize()}px` }}>
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </div>
                    </td>
                  ))}
                </tr>
              );
            })}
            {paddingBottom > 0 ? (
              <tr>
                <td style={{ height: `${paddingBottom}px` }} colSpan={table.getVisibleLeafColumns().length} />
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  );
}

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
