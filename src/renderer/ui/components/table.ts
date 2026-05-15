// Copyright (c) 2026 Falko Schumann. All rights reserved. MIT license.

import { type Row } from "@tanstack/react-table";

import { Währung } from "../../../shared/domain/waehrung";

export function sortPlainDate<TData>(
  rowA: Row<TData>,
  rowB: Row<TData>,
  columnId: string,
) {
  const valueA = rowA.getValue(columnId);
  const valueB = rowB.getValue(columnId);
  if (valueA == null && valueB == null) {
    return 0;
  } else if (valueA == null && valueB != null) {
    return 1;
  } else if (valueA != null && valueB == null) {
    return -1;
  } else {
    const dateTimeA = valueA as Temporal.PlainDate;
    const dateTimeB = valueB as Temporal.PlainDate;
    return Temporal.PlainDateTime.compare(dateTimeA, dateTimeB);
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
