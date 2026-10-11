// Copyright (c) 2026 Falko Schumann. MIT license.

// Where the main process serves a Rechnung created from the
// Rechnungsvorlage, for the preview and for printing. See resolveRechnungId()
// of the app protocol.
export function rechnungUrl(rechnungId: string): string {
  return `app://naturheilpraxis/rechnungen/${encodeURIComponent(rechnungId)}.html`;
}

export type PrintStatus = Readonly<{
  // False if the user has cancelled the print dialog or printing failed.
  printed: boolean;
  // Why printing failed, none if the user has cancelled.
  errorMessage?: string;
}>;

// Prints in a window of its own, so that only the Rechnung is printed. The
// print dialog of the system can also save it as PDF.
export interface PrintApi {
  printRechnung(rechnungId: string): Promise<PrintStatus>;
}
