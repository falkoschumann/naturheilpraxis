// Copyright (c) 2026 Falko Schumann. MIT license.

import path from "node:path";

import { describe, expect, it } from "vitest";

import { resolveAppFile } from "./app-protocol.ts";

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
});
