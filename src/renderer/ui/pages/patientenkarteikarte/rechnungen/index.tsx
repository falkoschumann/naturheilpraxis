// Copyright (c) 2026 Falko Schumann. All rights reserved. MIT license.

import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  type Row,
  type SortingState,
  useReactTable,
} from "@tanstack/react-table";
import { useVirtualizer } from "@tanstack/react-virtual";
import { useEffect, useRef, useState } from "react";
import { useOutletContext } from "react-router";

import type { Rechnung } from "../../../../../shared/domain/rechnung";
import { RechnungenQuery, RechnungenQueryResult } from "../../../../../shared/domain/rechnungen_query";
import { useMessageHandler } from "../../../components/message_handler_context";
import { sortPlainDate, sortWährung } from "../../../components/table";

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
            <form className="d-flex" role="search" onSubmit={(event) => event.preventDefault()}>
              <input
                className="form-control me-2"
                type="search"
                placeholder="Suche"
                aria-label="Suche"
                value={suchtext}
                onChange={(e) => setSuchtext(String(e.target.value))}
              />
              <button className="btn btn-outline-primary" type="submit">
                Suche
              </button>
            </form>
          </div>
        </div>
      </aside>
      <main className="flex-grow-1 container overflow-hidden">
        <RechnungenTable data={result.rechnungen} suchText={suchtext} />
      </main>
    </>
  );
}

export default RechnungenComponent;

function RechnungenTable({ data, suchText }: { data: Rechnung[]; suchText: string }) {
  "use no memo";

  const [globalFilter, setGlobalFilter] = useState<string[]>([]);
  const [sorting, setSorting] = useState<SortingState>([{ id: "datum", desc: true }]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      const filter = suchText
        .split(/\s+/)
        .map((wort) => wort.trim())
        .filter((wort) => wort.length > 0);
      setGlobalFilter(filter);
    }, 400);

    return () => clearTimeout(timeoutId);
  }, [suchText]);

  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable({
    columns,
    data,
    state: { globalFilter, sorting },
    sortDescFirst: false,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    globalFilterFn: customFilterFn,
    onGlobalFilterChange: setGlobalFilter,
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

const columnHelper = createColumnHelper<Rechnung>();
const columns = [
  columnHelper.accessor("praxis", { header: "Praxis", size: 100 }),
  columnHelper.accessor("nummer", { header: "Nummer", size: 120 }),
  columnHelper.accessor("datum", {
    header: "Datum",
    size: 100,
    cell: (info) => info?.getValue()?.toLocaleString("de-DE", { dateStyle: "medium" }),
    sortingFn: sortPlainDate<Rechnung>("datum"),
  }),
  columnHelper.accessor("summe", { header: "Summe", size: 100, sortingFn: sortWährung<Rechnung>("summe") }),
  columnHelper.accessor("rechnungstext", { header: "Rechnungstext", size: 250 }),
  columnHelper.accessor("kommentar", { header: "Kommentar", size: 250 }),
  columnHelper.accessor("bezahlt", {
    header: "Bezahlt",
    size: 80,
    cell: (info) =>
      info.getValue() ? (
        <i className="fa-regular fa-circle-check text-success"></i>
      ) : (
        <i className="fa-regular fa-circle"></i>
      ),
  }),
  columnHelper.accessor("gutschrift", {
    header: "Gutschrift",
    size: 80,
    cell: (info) =>
      info.getValue() ? <i className="fa-regular fa-circle-check"></i> : <i className="fa-regular fa-circle"></i>,
  }),
];

function customFilterFn(row: Row<Rechnung>, _columnId: string, filterValues: string[]) {
  if (filterValues.length === 0) {
    return true;
  }

  const cellValues = row.getVisibleCells().map((cell) => {
    const value = cell.getValue();
    if (cell.column.id === "datum" && value != null) {
      const date = value as Temporal.PlainDate;
      // WORKAROUND Temporal is very slow (Polyfill 4.5 sec and native 2 sec instead of 0.2 sec for ~9000 rows) so we format manually
      //return date.toLocaleString("de-DE", { dateStyle: "medium" });
      return `${date.day.toString().padStart(2, "0")}.${date.month.toString().padStart(2, "0")}.${date.year}`;
    }

    return String(value);
  });
  return filterValues.every((filterValue) =>
    cellValues.some((cellValue) => cellValue.toLowerCase().includes(filterValue.toLowerCase())),
  );
}
