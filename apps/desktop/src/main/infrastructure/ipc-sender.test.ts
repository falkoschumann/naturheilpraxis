// Copyright (c) 2026 Falko Schumann. MIT license.

import { describe, expect, it } from "vitest";

import { isTrustedSender } from "./ipc-sender.ts";

const rendererUrl =
  "file:///Applications/Naturheilpraxis.app/build/renderer/index.html";

describe("IPC-Absender", () => {
  it("sollte den Hauptframe der App annehmen", () => {
    const trusted = isTrustedSender(
      { url: `${rendererUrl}#/patienten/1`, isMainFrame: true },
      rendererUrl,
    );

    expect(trusted).toBe(true);
  });

  it("sollte den Hauptframe des Entwicklungsservers annehmen", () => {
    const trusted = isTrustedSender(
      { url: "http://localhost:5173/#/patienten", isMainFrame: true },
      "http://localhost:5173/",
    );

    expect(trusted).toBe(true);
  });

  it("sollte einen eingebetteten Frame ablehnen", () => {
    const trusted = isTrustedSender(
      { url: rendererUrl, isMainFrame: false },
      rendererUrl,
    );

    expect(trusted).toBe(false);
  });

  it("sollte eine fremde Seite ablehnen", () => {
    const trusted = isTrustedSender(
      { url: "https://example.com/", isMainFrame: true },
      rendererUrl,
    );

    expect(trusted).toBe(false);
  });

  it("sollte eine andere lokale Datei ablehnen", () => {
    const trusted = isTrustedSender(
      { url: "file:///Users/falko/Downloads/vorlage.html", isMainFrame: true },
      rendererUrl,
    );

    expect(trusted).toBe(false);
  });

  it("sollte einen fehlenden Frame ablehnen", () => {
    const trusted = isTrustedSender(null, rendererUrl);

    expect(trusted).toBe(false);
  });
});
