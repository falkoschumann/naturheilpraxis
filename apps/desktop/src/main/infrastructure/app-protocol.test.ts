// Copyright (c) 2026 Falko Schumann. MIT license.

import path from "node:path";

import { describe, expect, it } from "vitest";

import {
  resolveAppFile,
  resolveRechnungId,
  resolveVorlagengeltung,
} from "./app-protocol.ts";

const root = path.join(path.sep, "Programme", "Naturheilpraxis", "renderer");

describe("App-Protokoll", () => {
  it("sollte die Seite der App liefern", () => {
    const file = resolveAppFile("app://naturheilpraxis/index.html", root);

    expect(file).toBe(path.join(root, "index.html"));
  });

  it("sollte die Dateien der App liefern", () => {
    const file = resolveAppFile(
      "app://naturheilpraxis/assets/index-Cs8RG0kg.js",
      root,
    );

    expect(file).toBe(path.join(root, "assets", "index-Cs8RG0kg.js"));
  });

  it("sollte Hash und Parameter ignorieren", () => {
    const file = resolveAppFile(
      "app://naturheilpraxis/index.html?v=1#/patienten/1",
      root,
    );

    expect(file).toBe(path.join(root, "index.html"));
  });

  it("sollte kodierte Zeichen im Dateinamen beachten", () => {
    const file = resolveAppFile("app://naturheilpraxis/assets/a%20b.css", root);

    expect(file).toBe(path.join(root, "assets", "a b.css"));
  });

  // The parser of the URL resolves dot segments, never above the root.
  it("sollte Punkte im Pfad innerhalb der App auflösen", () => {
    const file = resolveAppFile(
      "app://naturheilpraxis/assets/%2e%2e/%2e%2e/%2e%2e/etc/passwd",
      root,
    );

    expect(file).toBe(path.join(root, "etc", "passwd"));
  });

  it("sollte keinen kodierten Pfadtrenner annehmen", () => {
    const file = resolveAppFile(
      "app://naturheilpraxis/..%2f..%2fetc%2fpasswd",
      root,
    );

    expect(file).toBeUndefined();
  });

  it("sollte keinen fremden Host annehmen", () => {
    const file = resolveAppFile("app://fremd/index.html", root);

    expect(file).toBeUndefined();
  });

  describe("Rechnung", () => {
    const rechnungId = "33333333-3333-4333-8333-333333333333";

    it("sollte die ID der Rechnung aus der URL lesen", () => {
      const id = resolveRechnungId(
        `app://naturheilpraxis/rechnungen/${rechnungId}.html`,
      );

      expect(id).toBe(rechnungId);
    });

    it("sollte Parameter der URL ignorieren", () => {
      const id = resolveRechnungId(
        `app://naturheilpraxis/rechnungen/${rechnungId}.html?stand=2`,
      );

      expect(id).toBe(rechnungId);
    });

    it("sollte nur Rechnungen der App annehmen", () => {
      expect(resolveRechnungId("app://naturheilpraxis/index.html")).toBe(
        undefined,
      );
      expect(
        resolveRechnungId(`app://fremd/rechnungen/${rechnungId}.html`),
      ).toBeUndefined();
      expect(
        resolveRechnungId("app://naturheilpraxis/rechnungen/..%2findex.html"),
      ).toBeUndefined();
    });
  });

  describe("Rechnungsvorlage", () => {
    it("sollte die Vorschau der allgemeinen Vorlage erkennen", () => {
      const geltung = resolveVorlagengeltung(
        "app://naturheilpraxis/rechnungsvorlagen/allgemein.html",
      );

      expect(geltung).toEqual({});
    });

    it("sollte das kodierte Kürzel der Praxis lesen", () => {
      const geltung = resolveVorlagengeltung(
        "app://naturheilpraxis/rechnungsvorlagen/praxen/N%C3%9CP%201.html?stand=2",
      );

      expect(geltung).toEqual({ praxiskuerzel: "NÜP 1" });
    });

    it("sollte nur Vorlagen der App annehmen", () => {
      expect(
        resolveVorlagengeltung("app://naturheilpraxis/index.html"),
      ).toBeUndefined();
      expect(
        resolveVorlagengeltung("app://fremd/rechnungsvorlagen/allgemein.html"),
      ).toBeUndefined();
      expect(
        resolveVorlagengeltung(
          "app://naturheilpraxis/rechnungsvorlagen/praxen/%E0.html",
        ),
      ).toBeUndefined();
    });
  });
});
