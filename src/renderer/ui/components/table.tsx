// Copyright (c) 2026 Falko Schumann. All rights reserved. MIT license.

import type { Row, RowData, SortingFn } from "@tanstack/react-table";

import { Währung } from "../../../shared/domain/waehrung";

// TODO extract common table component

export function sortPlainDate<TData extends RowData>(fieldName: string): SortingFn<TData> {
  return (rowA: Row<TData>, rowB: Row<TData>, _columnId: string) => {
    const dateA = (rowA.original as Record<string, unknown>)[fieldName] as Temporal.PlainDate;
    const dateB = (rowB.original as Record<string, unknown>)[fieldName] as Temporal.PlainDate;
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

export function sortWährung<TData extends RowData>(fieldName: string): SortingFn<TData> {
  return (rowA: Row<TData>, rowB: Row<TData>, _columnId: string) => {
    const dateA = (rowA.original as Record<string, unknown>)[fieldName] as Währung;
    const dateB = (rowB.original as Record<string, unknown>)[fieldName] as Währung;
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
