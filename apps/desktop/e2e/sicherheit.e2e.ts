// Copyright (c) 2026 Falko Schumann. MIT license.

// The evaluated functions run in the window of the app.
/// <reference lib="dom" />

import { expect, test } from "./app";

const { describe } = test;
const it = test;

describe("Sicherheit", () => {
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
