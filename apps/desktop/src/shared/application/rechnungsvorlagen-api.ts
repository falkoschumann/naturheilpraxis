// Copyright (c) 2026 Falko Schumann. MIT license.

// A Rechnungsvorlage applies to all Praxen, the allgemeine Vorlage, or to the
// Praxis with the Praxiskürzel.
export type Vorlagengeltung = Readonly<{ praxiskuerzel?: string }>;

export type RechnungsvorlagenErmittelnResultItem = Readonly<{
  // None for the allgemeine Vorlage.
  praxiskuerzel?: string;
  // "Allgemein" or the name of the Praxis.
  bezeichnung: string;
  // Where the Vorlage in use comes from: a Vorlage saved for exactly this
  // Geltung, the Standardvorlage the app ships with, or the allgemeine
  // Vorlage, which a Praxis without own Vorlage uses.
  herkunft: "eigene" | "standardvorlage" | "allgemeine";
}>;

export type RechnungsvorlagenErmittelnResult =
  readonly RechnungsvorlagenErmittelnResultItem[];

export type RechnungsvorlageStatus = Readonly<{
  // False if the user has cancelled the file dialog or the action failed.
  completed: boolean;
  // Why the action failed, none if the user has cancelled.
  errorMessage?: string;
}>;

// Manages the Rechnungsvorlagen. The user edits a Vorlage with an editor of
// their choice: the Vorlage in use is exported to a file and imported again.
export interface RechnungsvorlagenApi {
  // The allgemeine Vorlage first, then one for each Praxis.
  rechnungsvorlagenErmitteln(): Promise<RechnungsvorlagenErmittelnResult>;

  rechnungsvorlageExportieren(
    geltung: Vorlagengeltung,
  ): Promise<RechnungsvorlageStatus>;

  rechnungsvorlageImportieren(
    geltung: Vorlagengeltung,
  ): Promise<RechnungsvorlageStatus>;

  // Removes the own Vorlage. The allgemeine Vorlage is the Standardvorlage
  // again, a Praxis uses the allgemeine Vorlage again.
  rechnungsvorlageZuruecksetzen(
    geltung: Vorlagengeltung,
  ): Promise<RechnungsvorlageStatus>;
}

// Where the main process serves the preview of a Rechnungsvorlage with
// Beispieldaten. See resolveVorlagengeltung() of the app protocol.
export function rechnungsvorlageUrl(geltung: Vorlagengeltung): string {
  return geltung.praxiskuerzel === undefined
    ? "app://naturheilpraxis/rechnungsvorlagen/allgemein.html"
    : `app://naturheilpraxis/rechnungsvorlagen/praxen/${encodeURIComponent(geltung.praxiskuerzel)}.html`;
}
