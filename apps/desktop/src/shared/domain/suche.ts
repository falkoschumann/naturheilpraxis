// Copyright (c) 2026 Falko Schumann. MIT license.

// The words are separated by spaces, a word with spaces is quoted.
export function suchwoerterAus(suchbegriff: string): string[] {
  return [...suchbegriff.matchAll(/"([^"]*)"|(\S+)/g)]
    .map(([, zitiert, wort]) => (zitiert ?? wort ?? "").trim().toLowerCase())
    .filter((wort) => wort !== "");
}

// Every word occurs in any of the fields, ignoring case.
export function trifftAlle(
  felder: readonly string[],
  suchwoerter: readonly string[],
): boolean {
  const kleingeschrieben = felder.map((feld) => feld.toLowerCase());
  return suchwoerter.every((wort) =>
    kleingeschrieben.some((feld) => feld.includes(wort)),
  );
}
