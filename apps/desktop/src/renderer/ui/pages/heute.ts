// Copyright (c) 2026 Falko Schumann. MIT license.

// Today in the local time zone as ISO date like 2026-09-14.
export function heute(): string {
  const jetzt = new Date();
  const monat = String(jetzt.getMonth() + 1).padStart(2, "0");
  const tag = String(jetzt.getDate()).padStart(2, "0");
  return `${jetzt.getFullYear()}-${monat}-${tag}`;
}
