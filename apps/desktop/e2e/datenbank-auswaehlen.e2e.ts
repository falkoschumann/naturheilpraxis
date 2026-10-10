// Copyright (c) 2026 Falko Schumann. MIT license.

import fs from "node:fs/promises";
import path from "node:path";

import type { ElectronApplication, Page } from "@playwright/test";

import {
  chooseFiles,
  clickMenuItem,
  createUserDataDirectory,
  expect,
  launchApp,
  test,
  windowTitle,
} from "./app";
import { legePraxisAn } from "./schritte";

const { describe } = test;
const it = test;

// The story restarts the app, so it starts the app itself instead of using the
// fixtures.
describe("Datenbank auswählen", () => {
  it("sollte die gewählte Datenbank beim nächsten Start wieder öffnen", async () => {
    const userDataDirectory = await createUserDataDirectory();
    const praxisDb = path.join(userDataDirectory, "praxis.db");
    const weitereDb = path.join(userDataDirectory, "weitere.db");
    try {
      await test.step("Heilpraktiker legt Datenbank an", () =>
        mitApp(userDataDirectory, async (app, window) => {
          await legeDatenbankAn(app, window, praxisDb);
          await legePraxisAn(window);
        }));
      await test.step("Anwendung öffnet zuletzt geöffnete Datenbank", () =>
        mitApp(userDataDirectory, async (app, window) => {
          await erwartePraxis(window);
          expect(await windowTitle(app)).toBe("praxis.db – Naturheilpraxis");

          await test.step("Heilpraktiker legt weitere Datenbank an", () =>
            legeWeitereDatenbankAn(app, window, weitereDb));
          await test.step("Heilpraktiker öffnet vorhandene Datenbank", () =>
            oeffneVorhandeneDatenbank(app, window, praxisDb));
        }));

      // The network drive is not connected.
      await fs.rename(praxisDb, `${praxisDb}.getrennt`);
      await test.step("Anwendung findet Datenbank nicht", () =>
        mitApp(userDataDirectory, async (_app, window) => {
          await expect(window.getByRole("alert")).toContainText(
            `Die Datenbank „${praxisDb}“ wurde nicht gefunden.`,
          );

          await fs.rename(`${praxisDb}.getrennt`, praxisDb);
          await test.step("Heilpraktiker öffnet Datenbank erneut", async () => {
            await window
              .getByRole("button", { name: "Erneut versuchen" })
              .click();
            await erwartePraxis(window);
          });
        }));
    } finally {
      await fs.rm(userDataDirectory, { recursive: true, force: true });
    }
  });
});

async function mitApp(
  userDataDirectory: string,
  action: (app: ElectronApplication, window: Page) => Promise<void>,
): Promise<void> {
  const app = await launchApp(userDataDirectory);
  try {
    await action(app, await app.firstWindow());
  } finally {
    await app.close();
  }
}

async function legeDatenbankAn(
  app: ElectronApplication,
  window: Page,
  filename: string,
) {
  await expect(
    window.getByRole("heading", { name: "Willkommen bei Naturheilpraxis" }),
  ).toBeVisible();
  await chooseFiles(app, { newDatabase: filename });
  await window.getByRole("button", { name: "Neue Datenbank anlegen…" }).click();

  await expect(
    window.getByRole("navigation", { name: "Hauptnavigation" }),
  ).toBeVisible();
}

async function legeWeitereDatenbankAn(
  app: ElectronApplication,
  window: Page,
  filename: string,
) {
  await chooseFiles(app, { newDatabase: filename });
  await clickMenuItem(app, "create-database");

  await expect
    .poll(() => windowTitle(app))
    .toBe("weitere.db – Naturheilpraxis");
  await window.getByRole("button", { name: "Stammdaten" }).click();
  await window.getByRole("link", { name: "Praxen" }).click();
  await expect(
    window.getByText(/Es ist noch keine Praxis angelegt/),
  ).toBeVisible();
}

async function oeffneVorhandeneDatenbank(
  app: ElectronApplication,
  window: Page,
  filename: string,
) {
  await chooseFiles(app, { existingDatabase: filename });
  await clickMenuItem(app, "open-database");

  await expect.poll(() => windowTitle(app)).toBe("praxis.db – Naturheilpraxis");
  await erwartePraxis(window);
}

async function erwartePraxis(window: Page) {
  await window.getByRole("button", { name: "Stammdaten" }).click();
  await window.getByRole("link", { name: "Praxen" }).click();
  await expect(
    window.getByRole("article", { name: "Naturheilpraxis am Markt" }),
  ).toBeVisible();
}
