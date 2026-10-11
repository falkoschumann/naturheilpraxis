// Copyright (c) 2026 Falko Schumann. MIT license.

import fs from "node:fs/promises";

import type { NaturheilpraxisApi } from "../../shared/application/naturheilpraxis-api.ts";
import type {
  RechnungsvorlagenApi,
  RechnungsvorlagenErmittelnResult,
  RechnungsvorlageStatus,
  Vorlagengeltung,
} from "../../shared/application/rechnungsvorlagen-api.ts";
import type { Praxis } from "../../shared/domain/entities.ts";
import { pruefeRechnungsvorlage } from "../domain/rechnungsvorlage.ts";
import type { TemplateFileDialog } from "../infrastructure/file-dialog.ts";
import type { TemplateStore } from "../infrastructure/template-store.ts";

// What the preview of a Rechnungsvorlage needs: the Vorlage in use and the
// Praxis whose data it shows, none if there is no Praxis yet.
export type Vorlagenvorschau = Readonly<{ vorlage: string; praxis?: Praxis }>;

// A Praxis uses its own Rechnungsvorlage, without one the allgemeine, without
// one the Standardvorlage the app ships with.
export class RechnungsvorlagenService implements RechnungsvorlagenApi {
  readonly #naturheilpraxis: Pick<
    NaturheilpraxisApi,
    "praxenErmitteln" | "praxisErmitteln"
  >;
  readonly #templateStore: TemplateStore;
  readonly #fileDialog: TemplateFileDialog;
  readonly #standardvorlage: string;

  constructor({
    naturheilpraxis,
    templateStore,
    fileDialog,
    standardvorlage,
  }: {
    naturheilpraxis: Pick<
      NaturheilpraxisApi,
      "praxenErmitteln" | "praxisErmitteln"
    >;
    templateStore: TemplateStore;
    fileDialog: TemplateFileDialog;
    standardvorlage: string;
  }) {
    this.#naturheilpraxis = naturheilpraxis;
    this.#templateStore = templateStore;
    this.#fileDialog = fileDialog;
    this.#standardvorlage = standardvorlage;
  }

  // The Vorlage in use for the Geltung.
  geltendeVorlage(geltung: Vorlagengeltung): string {
    return (
      this.#templateStore.find("rechnung", geltung) ??
      (geltung.praxiskuerzel === undefined
        ? undefined
        : this.#templateStore.find("rechnung")) ??
      this.#standardvorlage
    );
  }

  async rechnungsvorlagenErmitteln(): Promise<RechnungsvorlagenErmittelnResult> {
    const eigene = new Set(
      this.#templateStore
        .scopes("rechnung")
        .map((scope) => scope.praxiskuerzel),
    );
    const praxen = await this.#praxen();
    return [
      {
        bezeichnung: "Allgemein",
        herkunft: eigene.has(undefined) ? "eigene" : "standardvorlage",
      },
      ...praxen.map(({ praxiskuerzel, name }) => ({
        praxiskuerzel,
        bezeichnung: name,
        herkunft: eigene.has(praxiskuerzel)
          ? ("eigene" as const)
          : ("allgemeine" as const),
      })),
    ];
  }

  async rechnungsvorlageExportieren(
    geltung: Vorlagengeltung,
  ): Promise<RechnungsvorlageStatus> {
    const unbekannt = await this.#pruefeGeltung(geltung);
    if (unbekannt !== undefined) {
      return unbekannt;
    }

    const filename = await this.#fileDialog.chooseTemplateToExport(
      geltung.praxiskuerzel === undefined
        ? "Rechnungsvorlage.html"
        : `Rechnungsvorlage ${geltung.praxiskuerzel}.html`,
    );
    if (filename === undefined) {
      return { completed: false };
    }
    try {
      await fs.writeFile(filename, this.geltendeVorlage(geltung), "utf-8");
    } catch {
      return {
        completed: false,
        errorMessage: `Die Rechnungsvorlage konnte nicht als „${filename}“ gesichert werden. Bitte wählen Sie einen Speicherort, an dem Sie Dateien anlegen dürfen.`,
      };
    }
    return { completed: true };
  }

  async rechnungsvorlageImportieren(
    geltung: Vorlagengeltung,
  ): Promise<RechnungsvorlageStatus> {
    const unbekannt = await this.#pruefeGeltung(geltung);
    if (unbekannt !== undefined) {
      return unbekannt;
    }

    const filename = await this.#fileDialog.chooseTemplateToImport();
    if (filename === undefined) {
      return { completed: false };
    }
    let inhalt: string;
    try {
      inhalt = await fs.readFile(filename, "utf-8");
    } catch {
      return {
        completed: false,
        errorMessage: `Die Datei „${filename}“ konnte nicht gelesen werden. Bitte prüfen Sie, ob sie noch vorhanden ist.`,
      };
    }
    const vorlage = pruefeRechnungsvorlage(inhalt);
    if (!vorlage.ok) {
      return { completed: false, errorMessage: vorlage.error.message };
    }
    this.#templateStore.save("rechnung", vorlage.value, geltung);
    return { completed: true };
  }

  async rechnungsvorlageZuruecksetzen(
    geltung: Vorlagengeltung,
  ): Promise<RechnungsvorlageStatus> {
    this.#templateStore.remove("rechnung", geltung);
    return { completed: true };
  }

  // The allgemeine Vorlage shows the data of the first Praxis. Returns
  // undefined if there is no such Praxis.
  async vorschauErmitteln(
    geltung: Vorlagengeltung,
  ): Promise<Vorlagenvorschau | undefined> {
    const praxiskuerzel =
      geltung.praxiskuerzel ?? (await this.#praxen())[0]?.praxiskuerzel;
    const praxis =
      praxiskuerzel === undefined
        ? undefined
        : await this.#naturheilpraxis.praxisErmitteln({
            type: "praxis-ermitteln",
            parameters: { praxiskuerzel },
          });
    if (geltung.praxiskuerzel !== undefined && praxis === undefined) {
      return undefined;
    }
    return {
      vorlage: this.geltendeVorlage(geltung),
      ...(praxis === undefined ? {} : { praxis }),
    };
  }

  #praxen() {
    return this.#naturheilpraxis.praxenErmitteln({
      type: "praxen-ermitteln",
      parameters: {},
    });
  }

  async #pruefeGeltung(
    geltung: Vorlagengeltung,
  ): Promise<RechnungsvorlageStatus | undefined> {
    if (geltung.praxiskuerzel === undefined) {
      return undefined;
    }
    const praxis = await this.#naturheilpraxis.praxisErmitteln({
      type: "praxis-ermitteln",
      parameters: { praxiskuerzel: geltung.praxiskuerzel },
    });
    return praxis === undefined
      ? {
          completed: false,
          errorMessage: `Die Praxis „${geltung.praxiskuerzel}“ gibt es nicht (mehr). Bitte laden Sie die Seite neu.`,
        }
      : undefined;
  }
}
