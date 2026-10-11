// Copyright (c) 2026 Falko Schumann. MIT license.

import { describe, expect, it } from "vitest";

import {
  maximaleVorlagengroesse,
  pruefeRechnungsvorlage,
} from "./rechnungsvorlage.ts";

describe("Rechnungsvorlage", () => {
  it("sollte eine Vorlage mit gültigen Platzhaltern annehmen", () => {
    const result = pruefeRechnungsvorlage(
      "<p>{{patient.name}}</p>{{#positionen}}<p>{{betrag}}</p>{{/positionen}}",
    );

    expect(result).toEqual({
      ok: true,
      value:
        "<p>{{patient.name}}</p>{{#positionen}}<p>{{betrag}}</p>{{/positionen}}",
    });
  });

  it("sollte eine Vorlage mit nicht geschlossenem Abschnitt ablehnen", () => {
    const result = pruefeRechnungsvorlage("{{#positionen}}<p>{{betrag}}</p>");

    expect(result).toEqual({
      ok: false,
      error: {
        message: expect.stringMatching(
          /^Die Platzhalter der Rechnungsvorlage sind fehlerhaft.*Bitte prüfen Sie/,
        ),
      },
    });
  });

  it("sollte eine leere Vorlage ablehnen", () => {
    const result = pruefeRechnungsvorlage(" \n");

    expect(result).toEqual({
      ok: false,
      error: { message: expect.stringContaining("Die Datei ist leer.") },
    });
  });

  it("sollte eine zu große Vorlage ablehnen", () => {
    const result = pruefeRechnungsvorlage(
      "x".repeat(maximaleVorlagengroesse + 1),
    );

    expect(result).toEqual({
      ok: false,
      error: { message: expect.stringContaining("größer als 10 MB") },
    });
  });
});
