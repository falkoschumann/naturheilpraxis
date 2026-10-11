// Copyright (c) 2026 Falko Schumann. MIT license.

import Mustache from "mustache";

import {
  fail,
  ok,
  type Rejection,
  type Result,
} from "../../shared/domain/result.ts";

// A Rechnungsvorlage embeds its images, which makes it large, but not larger.
export const maximaleVorlagengroesse = 10 * 1024 * 1024;

// Accepts a Rechnungsvorlage only if a Rechnung can be created from it. It does
// not check whether the placeholders name documented data, an unknown
// placeholder stays empty.
export function pruefeRechnungsvorlage(
  vorlage: string,
): Result<string, Rejection> {
  if (vorlage.trim() === "") {
    return fail({
      message:
        "Die Datei ist leer. Bitte wählen Sie eine Rechnungsvorlage im HTML-Format.",
    });
  }
  if (new TextEncoder().encode(vorlage).length > maximaleVorlagengroesse) {
    return fail({
      message:
        "Die Datei ist größer als 10 MB. Bitte verkleinern Sie die eingebetteten Bilder der Rechnungsvorlage.",
    });
  }
  try {
    Mustache.parse(vorlage);
  } catch (error) {
    const grund = error instanceof Error ? ` (${error.message})` : "";
    return fail({
      message: `Die Platzhalter der Rechnungsvorlage sind fehlerhaft${grund}. Bitte prüfen Sie, ob jeder Abschnitt wie {{#positionen}} mit {{/positionen}} geschlossen ist.`,
    });
  }
  return ok(vorlage);
}
