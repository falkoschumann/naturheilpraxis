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

export function sortPlainDate<TData>(
  rowA: Row<TData>,
  rowB: Row<TData>,
  columnId: string,
) {
  const valueA = (rowA.original as Record<string, unknown>)[columnId];
  const valueB = (rowB.original as Record<string, unknown>)[columnId];
  if (valueA == null && valueB == null) {
    return 0;
  } else if (valueA == null && valueB != null) {
    return 1;
  } else if (valueA != null && valueB == null) {
    return -1;
  } else {
    const dateTimeA = valueA as Temporal.PlainDateTime;
    const dateTimeB = valueB as Temporal.PlainDateTime;
    return Temporal.PlainDateTime.compare(dateTimeA, dateTimeB);
  }
}

export function getWährung(columnId: string) {
  return (rowData: unknown): unknown =>
    ((rowData as Record<string, unknown>)[columnId] as Währung)?.toString();
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

export function filterIncludesOrMatchesRow<TData>(
  row: Row<TData>,
  _columnId: string,
  filterValue: string[],
) {
  if (filterValue.length === 0) {
    return true;
  }

  return filterValue.every((filter) =>
    row
      .getAllCells()
      .map((cell) => cell.getValue())
      .some((value) => matchValue(String(value), filter)),
  );
}

function matchValue(value: string, filter: string) {
  if (filter.startsWith("/") && filter.endsWith("/")) {
    try {
      const regex = new RegExp(filter.slice(1, -1), "i");
      return regex.test(String(value));
    } catch {
      // ignore regular expression issues and fall back to string matching
    }
  }

  return value.toLowerCase().includes(filter.toLowerCase());
}
