// Copyright (c) 2026 Falko Schumann. MIT license.

import {
  createColumnHelper,
  createSortedRowModel,
  rowSortingFeature,
  sortFn_basic,
  tableFeatures,
  useTable,
  type ColumnDef,
  type RowData,
  type SortFn,
} from "@tanstack/react-table";
import { useWindowVirtualizer } from "@tanstack/react-virtual";
import { useLayoutEffect, useRef, useState, type ReactNode } from "react";

const features = tableFeatures({
  rowSortingFeature,
  sortedRowModel: createSortedRowModel(),
  sortFns: { basic: sortFn_basic },
});

export type DataTableFeatures = typeof features;

export type DataTableColumns<TData extends RowData> = ColumnDef<DataTableFeatures, TData, unknown>[];

export function createDataTableColumnHelper<TData extends RowData>() {
  return createColumnHelper<DataTableFeatures, TData>();
}

// Texts are sorted like in a German dictionary, umlauts included. Numbers in
// texts are compared by their value, like in Rechnungsnummern.
const sortierung = new Intl.Collator("de-DE", { numeric: true });

export function textVergleich<TData extends RowData>(): SortFn<DataTableFeatures, TData> {
  return (a, b, spalte) => sortierung.compare(a.getValue<string>(spalte), b.getValue<string>(spalte));
}

// The width and the alignment of a column stay the same while other rows
// become visible.
export type Spaltenlayout = Readonly<Record<string, Readonly<{ breite: string; className?: string }>>>;

// Every row has the same height, so the rows are not measured. The cells do
// not wrap to keep the height.
const zeilenhoehe = 41;

// A table that renders only its visible rows, so that it stays fast with
// thousands of rows. Each column sorts the rows by its header, ascending,
// descending and back to the order of the data.
export function DataTable<TData extends RowData>({
  columns,
  data,
  layout,
  getRowId,
  hinweis,
}: {
  columns: DataTableColumns<TData>;
  data: readonly TData[];
  layout: Spaltenlayout;
  getRowId: (zeile: TData) => string;
  // Shown instead of the rows, like a loading or an empty state.
  hinweis?: ReactNode;
}) {
  const table = useTable({
    features,
    columns,
    data: data as TData[],
    getRowId,
    sortDescFirst: false,
  });
  const rows = table.getRowModel().rows;

  // The page scrolls, so the rows start below everything above the table.
  const tabellenkoerper = useRef<HTMLTableSectionElement>(null);
  const [abstandOben, setAbstandOben] = useState(0);
  const ohneZeilen = hinweis !== undefined;
  useLayoutEffect(() => {
    const top = tabellenkoerper.current?.getBoundingClientRect().top ?? 0;
    setAbstandOben(top + window.scrollY);
  }, [ohneZeilen]);
  const virtualizer = useWindowVirtualizer({
    count: ohneZeilen ? 0 : rows.length,
    estimateSize: () => zeilenhoehe,
    getItemKey: (index) => rows[index]?.id ?? index,
    overscan: 10,
    scrollMargin: abstandOben,
  });
  const sichtbar = virtualizer.getVirtualItems();
  const fuellungOben = (sichtbar[0]?.start ?? abstandOben) - abstandOben;
  const fuellungUnten = virtualizer.getTotalSize() - ((sichtbar.at(-1)?.end ?? abstandOben) - abstandOben);
  const spaltenanzahl = columns.length;

  return (
    <table className="table table-hover align-middle mb-0 sticky-table data-table">
      <colgroup>
        {table.getAllLeafColumns().map((column) => (
          <col key={column.id} style={{ width: layout[column.id]?.breite }} />
        ))}
      </colgroup>
      <thead>
        {table.getHeaderGroups().map((gruppe) => (
          <tr key={gruppe.id}>
            {gruppe.headers.map((header) => (
              <th
                key={header.id}
                scope="col"
                className={layout[header.column.id]?.className}
                aria-sort={ariaSort(header.column.getIsSorted())}
              >
                <button
                  type="button"
                  className="btn btn-link p-0 fw-bold text-reset text-decoration-none text-nowrap"
                  onClick={header.column.getToggleSortingHandler()}
                >
                  <table.FlexRender header={header} />
                  <i className={`fa-solid ${sortierIcon(header.column.getIsSorted())} ms-1`} aria-hidden="true"></i>
                </button>
              </th>
            ))}
          </tr>
        ))}
      </thead>
      <tbody ref={tabellenkoerper}>
        {ohneZeilen && (
          <tr>
            <td colSpan={spaltenanzahl} className="text-center text-body-secondary py-4 text-wrap">
              {hinweis}
            </td>
          </tr>
        )}
        {fuellungOben > 0 && (
          <tr aria-hidden="true">
            <td colSpan={spaltenanzahl} className="p-0 border-0" style={{ height: fuellungOben }}></td>
          </tr>
        )}
        {sichtbar.map((item) => {
          const row = rows[item.index];
          if (row === undefined) {
            return null;
          }
          return (
            <tr key={row.id} style={{ height: zeilenhoehe }}>
              {row.getAllCells().map((cell) => (
                <td key={cell.id} className={layout[cell.column.id]?.className}>
                  <table.FlexRender cell={cell} />
                </td>
              ))}
            </tr>
          );
        })}
        {fuellungUnten > 0 && (
          <tr aria-hidden="true">
            <td colSpan={spaltenanzahl} className="p-0 border-0" style={{ height: fuellungUnten }}></td>
          </tr>
        )}
      </tbody>
    </table>
  );
}

function ariaSort(sortiert: false | "asc" | "desc"): "ascending" | "descending" | "none" {
  return sortiert === "asc" ? "ascending" : sortiert === "desc" ? "descending" : "none";
}

function sortierIcon(sortiert: false | "asc" | "desc"): string {
  return sortiert === "asc" ? "fa-sort-up" : sortiert === "desc" ? "fa-sort-down" : "fa-sort text-body-tertiary";
}
