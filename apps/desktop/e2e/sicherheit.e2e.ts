// Copyright (c) 2026 Falko Schumann. MIT license.

// The evaluated functions run in the window of the app.
/// <reference lib="dom" />

import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { pathToFileURL } from "node:url";

import { expect, test } from "./app";

// A transparent PNG of one pixel.
const einPixel =
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=";

const { describe } = test;
const it = test;

describe("Sicherheit", () => {
  it("sollte die App über ein eigenes Protokoll laden", ({ window }) => {
    expect(window.url()).toMatch(/^app:\/\/naturheilpraxis\/index\.html/);
  });

  // Chromium refuses local resources for a page of the app before the Content
  // Security Policy is asked.
  it("sollte keine lokalen Dateien einbinden", async ({ window }) => {
    const directory = await fs.mkdtemp(
      path.join(os.tmpdir(), "naturheilpraxis-e2e-"),
    );
    try {
      const bild = path.join(directory, "bild.png");
      await fs.writeFile(bild, Buffer.from(einPixel, "base64"));

      const lade = (url: string) =>
        window.evaluate(
          (url) =>
            new Promise<boolean>((resolve) => {
              const element = document.createElement("img");
              element.addEventListener("load", () => resolve(true));
              element.addEventListener("error", () => resolve(false));
              element.src = url;
            }),
          url,
        );

      // The same image embedded as data URL is allowed.
      expect(await lade(`data:image/png;base64,${einPixel}`)).toBe(true);
      expect(await lade(pathToFileURL(bild).href)).toBe(false);
    } finally {
      await fs.rm(directory, { recursive: true, force: true });
    }
  });

  it("sollte kein eingeschleustes Skript ausführen", async ({
    window,
    cspViolations,
  }) => {
    const ausgefuehrt = await window.evaluate(() => {
      const script = document.createElement("script");
      script.textContent = "window.eingeschleust = true;";
      document.body.append(script);
      return "eingeschleust" in window;
    });

    expect(ausgefuehrt).toBe(false);
    await expect.poll(() => cspViolations.join("\n")).toContain("script-src");
    cspViolations.splice(0);
  });

  it("sollte keine Daten an fremde Server senden", async ({
    window,
    cspViolations,
  }) => {
    const blockiert = await window.evaluate(async () => {
      const verletzung = new Promise<string>((resolve) =>
        document.addEventListener("securitypolicyviolation", (event) =>
          resolve(event.effectiveDirective),
        ),
      );
      await fetch("https://example.com/").catch(() => undefined);
      return verletzung;
    });

    expect(blockiert).toBe("connect-src");
    await expect.poll(() => cspViolations.join("\n")).toContain("connect-src");
    cspViolations.splice(0);
  });

  it("sollte keine neuen Fenster öffnen", async ({ app, window }) => {
    const geoeffnet = await window.evaluate(
      () => self.open("https://example.com/") !== null,
    );

    expect(geoeffnet).toBe(false);
    expect(app.windows()).toHaveLength(1);
  });

  it("sollte keine Berechtigungen gewähren", async ({ window }) => {
    const berechtigungen = await window.evaluate(async () => ({
      kamera: (await navigator.permissions.query({ name: "camera" })).state,
      standort: (await navigator.permissions.query({ name: "geolocation" }))
        .state,
      benachrichtigungen: await Notification.requestPermission(),
    }));

    expect(berechtigungen).toEqual({
      kamera: "denied",
      standort: "denied",
      benachrichtigungen: "denied",
    });
  });

  // Playwright would wait for the end of the prevented navigation, so the main
  // process tells the address of the window.
  it("sollte nicht zu einer fremden Seite navigieren", async ({
    app,
    window,
  }) => {
    const url = window.url();

    await window.evaluate(() => {
      location.href = "https://example.com/";
    });
    await new Promise((resolve) => setTimeout(resolve, 500));

    const aktuell = await app.evaluate(({ BrowserWindow }) =>
      BrowserWindow.getAllWindows()[0]?.webContents.getURL(),
    );
    expect(aktuell).toBe(url);
  });
});
