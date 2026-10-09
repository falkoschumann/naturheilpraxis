// Copyright (c) 2026 Falko Schumann. MIT license.

import { describe, expect, it } from "vitest";

import {
  formatEuro,
  formatEuroEingabe,
  parseEuro,
  pruefeEuro,
} from "./value-objects.ts";

describe("Euro", () => {
  it("sollte einen nicht negativen Betrag akzeptieren", () => {
    const result = pruefeEuro({ cents: 0 });

    expect(result).toEqual({ ok: true, value: { cents: 0 } });
  });

  it("sollte einen negativen Betrag ablehnen", () => {
    const result = pruefeEuro({ cents: -1 });

    expect(result).toEqual({
      ok: false,
      error: {
        invariant: "betrag-ist-nicht-negativ",
        message:
          "Der Betrag darf nicht negativ sein. Bitte geben Sie einen Betrag ab 0,00 € an.",
      },
    });
  });

  it.each([
    ["20", 2000],
    ["20,5", 2050],
    ["20,50", 2050],
    [" 20,50 € ", 2050],
    ["1.234,56", 123456],
    ["0,05", 5],
  ])("sollte %j als Betrag lesen", (text, cents) => {
    const euro = parseEuro(text);

    expect(euro).toEqual({ cents });
  });

  it.each(["", "abc", "-5", "20.50", "20,505", "1.23,45"])(
    "sollte %j nicht als Betrag lesen",
    (text) => {
      const euro = parseEuro(text);

      expect(euro).toBeUndefined();
    },
  );

  it("sollte einen Betrag deutsch formatieren", () => {
    const text = formatEuro({ cents: 123456 });

    expect(text).toBe("1.234,56 €");
  });

  it("sollte einen Betrag für die Eingabe formatieren", () => {
    const text = formatEuroEingabe({ cents: 123456 });

    expect(text).toBe("1234,56");
  });
});
