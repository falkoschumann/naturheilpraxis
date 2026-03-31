// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

import { createColumnHelper, flexRender, getCoreRowModel, useReactTable } from "@tanstack/react-table";
import { useVirtualizer } from "@tanstack/react-virtual";
import { useRef } from "react";
import { NavLink, useNavigate } from "react-router";

import type { Patient } from "../../../../shared/domain/patient";
import { PATIENTENKARTEIKARTE_PAGE } from "../../components/pages";
import DefaultPageLayout from "../../layouts/default_page_layout";
import { usePatienten } from "./patienten_hook";

// TODO use sorting with getSortedRowModel
// TODO sort by number desc by default

export default function PatientenkarteiPage() {
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
              <input className="form-control me-2" type="search" placeholder="Suche" aria-label="Suche" />
              <button className="btn btn-outline-primary" type="submit">
                Suche
              </button>
            </form>
          </div>
        </div>
      </aside>
      <main className="flex-grow-1 container-fluid overflow-hidden">
        <PatientenTable data={result.patienten} onPatientSelect={handlePatientClick} />
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

function PatientenTable({ data, onPatientSelect }: { data: Patient[]; onPatientSelect: (nummer: number) => void }) {
  // WORKAROUND see https://github.com/TanStack/table/issues/6137
  "use no memo";

  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable({ data, columns, getCoreRowModel: getCoreRowModel() });

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
            {table.getHeaderGroups().map((hg) => (
              <tr key={hg.id}>
                {hg.headers.map((header) => (
                  <th key={header.id} scope="col" className="text-nowrap">
                    {flexRender(header.column.columnDef.header, header.getContext())}
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
                      <div className="text-truncate" style={{ width: cell.column.getSize() }}>
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

const columnHelper = createColumnHelper<Patient>();
const columns = [
  columnHelper.accessor("nummer", { header: "#", size: 80 }),
  columnHelper.accessor("anrede", { header: "Anrede", size: 80 }),
  columnHelper.accessor("nachname", { header: "Nachname", size: 120 }),
  columnHelper.accessor("vorname", { header: "Vorname", size: 120 }),
  columnHelper.accessor("geburtsdatum", {
    header: "Geburtsdatum",
    size: 100,
    cell: (info) => info?.getValue()?.toLocaleString(undefined, { dateStyle: "medium" }),
  }),
  columnHelper.accessor("strasse", { header: "Straße", size: 200 }),
  columnHelper.accessor("postleitzahl", { header: "PLZ", size: 80 }),
  columnHelper.accessor("wohnort", { header: "Wohnort", size: 120 }),
  columnHelper.accessor("telefon", {
    header: "Telefon",
    size: 100,
    cell: (info) => (
      <a href={`tel:${info.getValue()}`} onClick={(event) => event.stopPropagation()}>
        {info.getValue()}
      </a>
    ),
  }),
  columnHelper.accessor("mobil", {
    header: "Mobil",
    size: 100,
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
