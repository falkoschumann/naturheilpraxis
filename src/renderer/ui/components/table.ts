// Copyright (c) 2026 Falko Schumann. All rights reserved. MIT license.

import { type Row, type RowData, type SortingFn } from "@tanstack/react-table";

import { Währung } from "../../../shared/domain/waehrung";

export function sortPlainDate<TData extends RowData>(
  fieldName: string,
): SortingFn<TData> {
  return (rowA: Row<TData>, rowB: Row<TData>, _columnId: string) => {
    const dateA = (rowA.original as Record<string, unknown>)[
      fieldName
    ] as Temporal.PlainDate;
    const dateB = (rowB.original as Record<string, unknown>)[
      fieldName
    ] as Temporal.PlainDate;
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
}

export function sortWährung<TData extends RowData>(
  fieldName: string,
): SortingFn<TData> {
  return (rowA: Row<TData>, rowB: Row<TData>, _columnId: string) => {
    const dateA = (rowA.original as Record<string, unknown>)[
      fieldName
    ] as Währung;
    const dateB = (rowB.original as Record<string, unknown>)[
      fieldName
    ] as Währung;
    if (dateA == null && dateB != null) {
      return 1;
    } else if (dateA != null && dateB == null) {
      return -1;
    } else if (dateA != null && dateB != null) {
      return Währung.compare(dateA, dateB);
    } else {
      // dateA == null && dateB == null
      return 0;
    }
  };
}

export function filterGlobal<TData>(
  row: Row<TData>,
  _columnId: string,
  filterValues: string[],
) {
  if (filterValues.length === 0) {
    return true;
  }

  const cellValues = row.getVisibleCells().map((cell) => {
    const value = cell.getValue();
    if (value instanceof Temporal.PlainDate) {
      // WORKAROUND Temporal is very slow (Polyfill 4.5 sec and native 2 sec instead of 0.2 sec for ~9000 rows) so we format manually
      //return value.toLocaleString("de-DE", { dateStyle: "medium" });
      return `${value.day.toString().padStart(2, "0")}.${value.month.toString().padStart(2, "0")}.${value.year}`;
    }

    return String(value);
  });
  return filterValues.every((filterValue) =>
    cellValues.some((cellValue) =>
      cellValue.toLowerCase().includes(filterValue.toLowerCase()),
    ),
  );
}
