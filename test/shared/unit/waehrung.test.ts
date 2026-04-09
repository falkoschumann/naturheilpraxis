// Copyright (c) 2026 Falko Schumann. All rights reserved. MIT license.

import { describe, expect, it } from "vitest";

import { Währung } from "../../../src/shared/domain/waehrung";

describe("Währung", () => {
  it("sollte Währung aus Cent-Betrag erstellen", () => {
    const währung = Währung.from(1234);

    expect(währung.cents).toBe(1234);
    expect(währung.toEuro()).toBe(12.34);
    expect(währung.toString()).toBe("12.34 €");
  });

  it("sollte Währungen summieren", () => {
    const summe = Währung.summiere(
      Währung.from(100),
      Währung.from(250),
      Währung.from(50),
    );

    expect(summe.toEuro()).toBe(4.0);
  });

  it("sollte Währung mit Faktor multiplizieren", () => {
    const währung = Währung.from(200);

    const ergebnis = währung.multipliziere(1.5);

    expect(ergebnis.toEuro()).toBe(3.0);
  });

  it("sollte Währung anhand des Cent-Betrag vergleichen", () => {
    const währung1 = Währung.from(500);
    const währung2 = Währung.from(500);
    const währung3 = Währung.from(300);

    expect(währung1.compare(währung2)).toBe(0);
    expect(währung1.compare(währung3)).toBe(1);
    expect(währung3.compare(währung1)).toBe(-1);
  });

  it("sollte als Cent-Betrag serialisiert werden", () => {
    const währung = Währung.from(1234);

    const json = JSON.stringify(währung);

    expect(json).toBe("1234");
  });
});
