// Copyright (c) 2026 Falko Schumann. All rights reserved. MIT license.

import {
  type ColumnDef,
  type FilterFnOption,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  type SortingState,
  useReactTable,
} from "@tanstack/react-table";
import { useVirtualizer } from "@tanstack/react-virtual";
import { useEffect, useRef, useState } from "react";

export function TableComponent<TData>({
  columns,
  data,
  initialSorting = [],
  globalFilterFn,
  suchText = "",
  onSelectRow,
}: {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  columns: ColumnDef<TData, any>[];
  data: TData[];
  initialSorting?: SortingState;
  globalFilterFn?: FilterFnOption<TData>;
  suchText?: string;
  onSelectRow?: (row: TData) => void;
}) {
  "use no memo";

  const [globalFilter, setGlobalFilter] = useState<string[]>([]);
  const [sorting, setSorting] = useState<SortingState>(initialSorting);

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
    globalFilterFn,
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
                    cursor: onSelectRow != null ? "pointer" : undefined,
                  }}
                  onClick={() => onSelectRow?.(row.original)}
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

export default TableComponent;
