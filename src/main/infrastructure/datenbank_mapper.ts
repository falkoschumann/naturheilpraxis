// Copyright (c) 2026 Falko Schumann. All rights reserved. MIT license.

import type { SQLOutputValue } from "node:sqlite";

export function mapNumber(
  record: Record<string, SQLOutputValue>,
  fieldName: string,
): number | undefined {
  const value = record[fieldName];
  if (value == null) {
    return;
  }

  if (typeof value !== "number") {
    console.warn(
      `Expected number but got ${typeof value} for ${fieldName} of #${record["nummer"]}:`,
      value,
    );
    return;
  }

  return value;
}

export function mapString(
  record: Record<string, SQLOutputValue>,
  fieldName: string,
): string | undefined {
  const value = record[fieldName];
  if (value == null) {
    return;
  }

  if (typeof value !== "string") {
    console.warn(
      `Expected string but got ${typeof value} for ${fieldName} of #${record["nummer"]}:`,
      value,
    );
    return;
  }

  return value;
}
