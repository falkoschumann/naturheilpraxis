// Copyright (c) 2026 Falko Schumann. All rights reserved. MIT license.

import { type Row } from "@tanstack/react-table";

import { Währung } from "../../../shared/domain/waehrung";

export function getPlainDate(columnId: string) {
  return (rowData: unknown): unknown =>
    (
      (rowData as Record<string, unknown>)[columnId] as Temporal.PlainDate
    )?.toLocaleString("de-DE", {
      dateStyle: "medium",
    });
}

export function getWährung(columnId: string) {
  return (rowData: unknown): unknown =>
    ((rowData as Record<string, unknown>)[columnId] as Währung)?.toString();
}

export function sortPlainDate<TData>(
  rowA: Row<TData>,
  rowB: Row<TData>,
  columnId: string,
) {
  const valueA = (rowA.original as Record<string, unknown>)[columnId] as
    | Temporal.PlainDate
    | undefined;
  const valueB = (rowB.original as Record<string, unknown>)[columnId] as
    | Temporal.PlainDate
    | undefined;
  if (valueA != null && valueB != null) {
    return Temporal.PlainDateTime.compare(valueA, valueB);
  } else if (valueA == null && valueB != null) {
    return 1;
  } else if (valueA != null && valueB == null) {
    return -1;
  } else {
    return 0;
  }
}

export function sortWährung<TData>(
  rowA: Row<TData>,
  rowB: Row<TData>,
  columnId: string,
) {
  const valueA = rowA.getValue(columnId) as Währung;
  const valueB = rowB.getValue(columnId) as Währung;
  if (valueA == null && valueB == null) {
    return 0;
  } else if (valueA == null && valueB != null) {
    return 1;
  } else if (valueA != null && valueB == null) {
    return -1;
  } else {
    return Währung.compare(valueA, valueB);
  }
}

export function filterGlobal<TData>(
  row: Row<TData>,
  columnId: string,
  filterValue: string[],
) {
  if (filterValue.length === 0) {
    return true;
  }

  const value = String(row.getValue(columnId)).toLowerCase();
  return filterValue.some((filter) => value.includes(filter.toLowerCase()));
}
