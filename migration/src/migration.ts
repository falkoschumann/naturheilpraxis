// Copyright (c) 2026 Falko Schumann. All rights reserved. MIT license.

export function normalisiereString(wert?: string): string | undefined {
  wert = wert && String(wert).trim();
  if (wert == null || wert.length === 0) {
    return;
  }

  return wert.trim();
}

export function normalisiereNumber(wert?: number | string): number | undefined {
  if (typeof wert === "string") {
    wert = wert.replace(",", ".");
  }

  wert = wert != null ? Number(wert) : undefined;
  if (wert == null || !Number.isFinite(wert)) {
    return;
  }

  return wert;
}

export function normalisiereBoolean(
  wert?: number | string,
): boolean | undefined {
  if (wert == null) {
    return;
  }

  return wert != 0;
}
