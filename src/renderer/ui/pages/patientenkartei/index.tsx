// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

import { Temporal } from "@js-temporal/polyfill";
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  type Row,
  type SortingFn,
  type SortingState,
  useReactTable,
} from "@tanstack/react-table";
import { useVirtualizer } from "@tanstack/react-virtual";
import { useEffect, useRef, useState } from "react";
import { NavLink, useNavigate } from "react-router";

import type { Patient } from "../../../../shared/domain/patient";
import { PATIENTENKARTEIKARTE_PAGE } from "../../components/pages";
import DefaultPageLayout from "../../layouts/default_page_layout";
import { usePatienten } from "./patienten_hook";

export default function PatientenkarteiPage() {
  const [suchText, setSuchText] = useState("");
  const [result] = usePatienten();

  const navigate = useNavigate();

  function handlePatientClick(nummer: number) {
    const search = new URLSearchParams();
    search.set("nummer", nummer.toString());
    navigate({ pathname: PATIENTENKARTEIKARTE_PAGE, search: search.toString() });
  }

  return (
    <DefaultPageLayout>
      <aside className="flex-shrink-0 container">
        <div className="d-flex py-3">
          <h2>Patienten</h2>
          <div className="ms-auto">
            <form className="d-flex" role="search">
              <input
                className="form-control me-2"
                type="search"
                placeholder="Suche"
                aria-label="Suche"
                onChange={(e) => setSuchText(String(e.target.value))}
              />
              <button className="btn btn-outline-primary" type="submit">
                Suche
              </button>
            </form>
          </div>
        </div>
      </aside>
      <main className="flex-grow-1 container-fluid overflow-hidden">
        <PatientenTable data={result.patienten} suchText={suchText} onPatientSelect={handlePatientClick} />
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

function PatientenTable({
  data,
  suchText,
  onPatientSelect,
}: {
  data: Patient[];
  suchText: string;
  onPatientSelect: (nummer: number) => void;
}) {
  "use no memo";

  const [globalFilter, setGlobalFilter] = useState<string[]>([]);
  const [sorting, setSorting] = useState<SortingState>([{ id: "nummer", desc: true }]);

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
                  <th key={header.id} scope="col" className="text-nowrap">
                    <div
                      className={`d-flex align-items-center ${header.column.getCanSort() ? "user-select-none cursor-pointer" : ""}`}
                      style={{ width: `${header.column.getSize()}px` }}
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
                    cursor: "pointer",
                  }}
                  onClick={() => onPatientSelect(row.getValue("nummer"))}
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

const sortGeburtsdatumFn: SortingFn<Patient> = (rowA, rowB, _columnId) => {
  const dateA = rowA.original.geburtsdatum;
  const dateB = rowB.original.geburtsdatum;
  if (dateA == null && dateB != null) {
    return 1;
  } else if (dateA != null && dateB == null) {
    return -1;
  } else if (dateA != null && dateB != null) {
    return Temporal.PlainDate.compare(dateA, dateB);
  } else {
    // dateA == null && dateB == null
    return 0;
  }
};

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
    sortingFn: sortGeburtsdatumFn,
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

function customFilterFn(row: Row<Patient>, _columnId: string, filterValues: string[]) {
  if (filterValues.length === 0) {
    return true;
  }

  const cellValues = row.getVisibleCells().map((cell) => {
    const value = cell.getValue();
    if (cell.column.id === "geburtsdatum" && value != null) {
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
