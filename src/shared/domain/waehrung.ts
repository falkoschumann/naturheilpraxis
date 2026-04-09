// Copyright (c) 2026 Falko Schumann. All rights reserved. MIT license.

export class Währung {
  static from(centsOderWährung: Währung | number) {
    if (centsOderWährung instanceof Währung) {
      return centsOderWährung;
    }

    return new Währung(centsOderWährung);
  }

  static summiere(...währungen: Währung[]) {
    return währungen.reduce(
      (summe, währung) => summe.addiere(währung),
      new Währung(),
    );
  }

  readonly cents: number;

  private constructor(cents = 0) {
    if (!Number.isInteger(cents) || cents < 0) {
      throw new TypeError(
        `Währung muss eine nicht-negative ganze Zahl sein: ${cents}.`,
      );
    }
    this.cents = cents;
  }

  addiere(währung: Währung) {
    return new Währung(this.cents + währung.cents);
  }

  multipliziere(faktor: number) {
    if (!Number.isFinite(faktor)) {
      throw new Error("Faktor muss eine reale Zahl sein.");
    }

    const result = Math.round(this.cents * faktor);
    return new Währung(result);
  }

  toEuro() {
    return this.cents / 100;
  }

  toString() {
    return `${(this.cents / 100).toFixed(2)} €`;
  }

  toJSON() {
    return this.cents;
  }

  compare(währung: Währung) {
    if (this.cents < währung.cents) {
      return -1;
    } else if (this.cents > währung.cents) {
      return 1;
    } else {
      return 0;
    }
  }

  valueOf(): number {
    throw new Error(
      "Do not use Währung.prototype.valueOf; use Währung.prototype.compare for comparison.",
    );
  }
}
