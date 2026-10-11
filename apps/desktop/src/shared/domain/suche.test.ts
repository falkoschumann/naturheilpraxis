// Copyright (c) 2026 Falko Schumann. MIT license.

import { describe, expect, it } from "vitest";

import { suchwoerterAus, trifftAlle } from "./suche.ts";

describe("Suche", () => {
  it("sollte den Suchbegriff an Leerzeichen in Wörter teilen", () => {
    expect(suchwoerterAus("  Max   Mustermann ")).toEqual([
      "max",
      "mustermann",
    ]);
  });

  it("sollte Wörter in Anführungszeichen zusammenhalten", () => {
    expect(suchwoerterAus('mustermann "Lindenweg 5"')).toEqual([
      "mustermann",
      "lindenweg 5",
    ]);
  });

  it("sollte treffen, wenn jedes Wort in einem der Felder vorkommt", () => {
    expect(
      trifftAlle(["Max Mustermann", "Musterstadt"], ["max", "stadt"]),
    ).toBe(true);
  });

  it("sollte nicht treffen, wenn ein Wort in keinem Feld vorkommt", () => {
    expect(
      trifftAlle(["Max Mustermann", "Musterstadt"], ["max", "berlin"]),
    ).toBe(false);
  });
});
