// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

import { createColumnHelper, flexRender, getCoreRowModel, type Table, useReactTable } from "@tanstack/react-table";
import { type RefObject, useEffect, useRef, useState } from "react";
import { NavLink, useNavigate } from "react-router";

import type { Patient } from "../../main/domain/naturheilpraxis";
import { PATIENT_AUFNEHMEN_PAGE, PATIENTENKARTEI_PAGE } from "./pages";
import { useVirtualizer } from "@tanstack/react-virtual";

const columnHelper = createColumnHelper<Patient>();
const columns = [
  columnHelper.accessor("nummer", { header: "#", size: 80 }),
  columnHelper.accessor("anrede", { header: "Anrede", size: 80 }),
  columnHelper.accessor("nachname", { header: "Nachname" }),
  columnHelper.accessor("vorname", { header: "Vorname" }),
  columnHelper.accessor("geburtsdatum", {
    header: "Geburtsdatum",
    cell: (info) => new Date(info.getValue()).toLocaleDateString(undefined, { dateStyle: "medium" }),
  }),
  columnHelper.accessor("strasse", { header: "Straße" }),
  columnHelper.accessor("postleitzahl", { header: "PLZ", size: 80 }),
  columnHelper.accessor("wohnort", { header: "Wohnort" }),
  columnHelper.accessor("telefon", {
    header: "Telefon",
    cell: (info) => (
      <a href={`tel:${info.getValue()}`} onClick={(event) => event.stopPropagation()}>
        {info.getValue()}
      </a>
    ),
  }),
  columnHelper.accessor("mobil", {
    header: "Mobil",
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

export default function Patientenkartei() {
  const tableContainerRef = useRef<HTMLDivElement>(null);
  const [data, setData] = useState<Patient[]>([]);
  const table = useReactTable({ data, columns, getCoreRowModel: getCoreRowModel() });

  useEffect(() => {
    async function queryPatientenkartei() {
      const result = await window.naturheilpraxis.patientenkartei({});
      setData(result.patienten);
    }

    void queryPatientenkartei();
  }, []);

  return (
    <main className="container-fluid my-4">
      <div className="d-flex">
        <h2 className="mb-3">Patienten</h2>
        <div className="ms-auto">
          <form className="d-flex" role="search">
            <input className="form-control me-2" type="search" placeholder="Suche" aria-label="Suche" />
            <button className="btn btn-outline-primary" type="submit">
              Suche
            </button>
          </form>
        </div>
      </div>
      <div
        ref={tableContainerRef}
        className="position-relative overflow-auto"
        style={{ height: "calc(100vh - 13.5rem)" }}
      >
        <table className="d-grid table table-hover">
          <thead className="d-grid sticky-top">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id} className="d-flex w-100">
                {headerGroup.headers.map((header) => (
                  <th key={header.id} scope="col" className="d-flex" style={{ width: header.getSize() }}>
                    {flexRender(header.column.columnDef.header, header.getContext())}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <TableBody table={table} tableContainerRef={tableContainerRef} />
        </table>
      </div>
      <div className="btn-toolbar mt-3" role="toolbar" aria-label="Aktionen für Patienten">
        <NavLink to={PATIENT_AUFNEHMEN_PAGE} type="button" className="btn btn-primary">
          Nimm Patient auf
        </NavLink>
      </div>
    </main>
  );
}

function TableBody({
  table,
  tableContainerRef,
}: {
  table: Table<Patient>;
  tableContainerRef: RefObject<HTMLDivElement | null>;
}) {
  const { rows } = table.getRowModel();
  const virtualizer = useVirtualizer<HTMLDivElement, HTMLTableRowElement>({
    count: rows.length,
    estimateSize: () => 41,
    getScrollElement: () => tableContainerRef.current,
    measureElement:
      typeof window !== "undefined" && navigator.userAgent.indexOf("Firefox") === -1
        ? (element) => element?.getBoundingClientRect().height
        : undefined,
    overscan: 5,
  });

  const navigate = useNavigate();

  function handlePatientClick(nummer: number) {
    navigate(`${PATIENTENKARTEI_PAGE}/${nummer}`);
  }

  return (
    <tbody className="d-grid position-relative" style={{ height: `${virtualizer.getTotalSize()}px` }}>
      {virtualizer.getVirtualItems().map((virtualRow) => {
        const row = rows[virtualRow.index];
        return (
          <tr
            key={row.id}
            data-index={virtualRow.index}
            ref={(node) => virtualizer.measureElement(node)}
            className="d-flex position-absolute w-100"
            style={{ transform: `translateY(${virtualRow.start}px)` }}
            onClick={() => handlePatientClick(row.getValue("nummer"))}
          >
            {row.getVisibleCells().map((cell) => (
              <td key={cell.id} className="d-flex" style={{ width: cell.column.getSize() }}>
                {flexRender(cell.column.columnDef.cell, cell.getContext())}
              </td>
            ))}
          </tr>
        );
      })}
    </tbody>
  );
}
