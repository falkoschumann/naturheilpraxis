// Copyright (c) 2026 Falko Schumann. MIT license.

import type { NaturheilpraxisApi } from "../../shared/application/naturheilpraxis-api.ts";
import {
  rechnungUrl,
  type PrintStatus,
} from "../../shared/application/print-api.ts";
import type { RechnungErmittelnQueryResult } from "../../shared/domain/rechnungsansicht.ts";
import type { Printer } from "../infrastructure/printer.ts";
import type { RechnungsvorlagenService } from "./rechnungsvorlagen-service.ts";

// A Rechnung with the Rechnungsvorlage of its Praxis.
export type RechnungMitVorlage = Readonly<{
  rechnung: NonNullable<RechnungErmittelnQueryResult>;
  vorlage: string;
}>;

// Provides what the UI needs to create a Rechnung from its Vorlage and prints
// the created Rechnung.
export class RechnungsdruckService {
  readonly #naturheilpraxis: Pick<NaturheilpraxisApi, "rechnungErmitteln">;
  readonly #rechnungsvorlagen: Pick<
    RechnungsvorlagenService,
    "geltendeVorlage"
  >;
  readonly #printer: Printer;

  constructor(
    naturheilpraxis: Pick<NaturheilpraxisApi, "rechnungErmitteln">,
    rechnungsvorlagen: Pick<RechnungsvorlagenService, "geltendeVorlage">,
    printer: Printer,
  ) {
    this.#naturheilpraxis = naturheilpraxis;
    this.#rechnungsvorlagen = rechnungsvorlagen;
    this.#printer = printer;
  }

  // Returns undefined if there is no such Rechnung.
  async rechnungMitVorlageErmitteln(
    rechnungId: string,
  ): Promise<RechnungMitVorlage | undefined> {
    const rechnung = await this.#naturheilpraxis.rechnungErmitteln({
      type: "rechnung-ermitteln",
      parameters: { rechnungId },
    });
    if (rechnung === undefined) {
      return undefined;
    }

    const vorlage = this.#rechnungsvorlagen.geltendeVorlage({
      praxiskuerzel: rechnung.praxis.praxiskuerzel,
    });
    return { rechnung, vorlage };
  }

  // Prints the Rechnung as the app serves it at rechnungUrl().
  async rechnungDrucken(rechnungId: string): Promise<PrintStatus> {
    if ((await this.rechnungMitVorlageErmitteln(rechnungId)) === undefined) {
      return {
        printed: false,
        errorMessage: "Diese Rechnung gibt es nicht (mehr).",
      };
    }

    switch (await this.#printer.print(rechnungUrl(rechnungId))) {
      case "printed":
        return { printed: true };
      case "cancelled":
        return { printed: false };
      case "not-loaded":
        return {
          printed: false,
          errorMessage:
            "Die Rechnung konnte nicht aus der Rechnungsvorlage erzeugt werden. Bitte prüfen Sie die Platzhalter der Rechnungsvorlage.",
        };
      case "failed":
        return {
          printed: false,
          errorMessage:
            "Die Rechnung konnte nicht gedruckt werden. Bitte prüfen Sie, ob ein Drucker eingerichtet ist, und versuchen Sie es erneut.",
        };
    }
  }
}
