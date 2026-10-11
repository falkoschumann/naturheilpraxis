// Copyright (c) 2026 Falko Schumann. MIT license.

import type {
  RechnungsvorlagenApi,
  RechnungsvorlagenErmittelnResult,
  RechnungsvorlageStatus,
  Vorlagengeltung,
} from "../../../shared/application/rechnungsvorlagen-api.ts";

type Aufruf = Readonly<{
  aktion: "exportieren" | "importieren" | "zuruecksetzen";
  geltung: Vorlagengeltung;
}>;

// Answers like the main process with the given Vorlagen and status. Importing
// and resetting change the Herkunft of the Vorlage.
export class FakeRechnungsvorlagenApi implements RechnungsvorlagenApi {
  readonly aufrufe: Aufruf[] = [];
  #vorlagen: RechnungsvorlagenErmittelnResult;
  readonly #status: RechnungsvorlageStatus;

  constructor({
    vorlagen = [
      { bezeichnung: "Allgemein", herkunft: "standardvorlage" },
      {
        praxiskuerzel: "NHP",
        bezeichnung: "Naturheilpraxis am Markt",
        herkunft: "allgemeine",
      },
    ],
    status = { completed: true },
  }: {
    vorlagen?: RechnungsvorlagenErmittelnResult;
    status?: RechnungsvorlageStatus;
  } = {}) {
    this.#vorlagen = vorlagen;
    this.#status = status;
  }

  rechnungsvorlagenErmitteln(): Promise<RechnungsvorlagenErmittelnResult> {
    return Promise.resolve(this.#vorlagen);
  }

  rechnungsvorlageExportieren(
    geltung: Vorlagengeltung,
  ): Promise<RechnungsvorlageStatus> {
    this.aufrufe.push({ aktion: "exportieren", geltung });
    return Promise.resolve(this.#status);
  }

  rechnungsvorlageImportieren(
    geltung: Vorlagengeltung,
  ): Promise<RechnungsvorlageStatus> {
    this.aufrufe.push({ aktion: "importieren", geltung });
    if (this.#status.completed) {
      this.#aendereHerkunft(geltung, () => "eigene");
    }
    return Promise.resolve(this.#status);
  }

  rechnungsvorlageZuruecksetzen(
    geltung: Vorlagengeltung,
  ): Promise<RechnungsvorlageStatus> {
    this.aufrufe.push({ aktion: "zuruecksetzen", geltung });
    if (this.#status.completed) {
      this.#aendereHerkunft(geltung, (praxiskuerzel) =>
        praxiskuerzel === undefined ? "standardvorlage" : "allgemeine",
      );
    }
    return Promise.resolve(this.#status);
  }

  #aendereHerkunft(
    geltung: Vorlagengeltung,
    herkunft: (
      praxiskuerzel: string | undefined,
    ) => RechnungsvorlagenErmittelnResult[number]["herkunft"],
  ): void {
    this.#vorlagen = this.#vorlagen.map((vorlage) =>
      vorlage.praxiskuerzel === geltung.praxiskuerzel
        ? { ...vorlage, herkunft: herkunft(vorlage.praxiskuerzel) }
        : vorlage,
    );
  }
}
