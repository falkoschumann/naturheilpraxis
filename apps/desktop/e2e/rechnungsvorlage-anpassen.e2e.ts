// Copyright (c) 2026 Falko Schumann. MIT license.

import fs from "node:fs/promises";
import path from "node:path";

import type { ElectronApplication, Page } from "@playwright/test";

import { chooseFiles, expect, test } from "./app";
import {
  erbringeLeistung,
  erstelleRechnung,
  legePraxisAn,
  nimmPatientAuf,
  stelleDiagnose,
} from "./schritte";

const { describe } = test;
const it = test;

describe("Rechnungsvorlage anpassen", () => {
  it("sollte die Rechnung einer Praxis mit einer eigenen Vorlage erzeugen", async ({
    app,
    window,
  }) => {
    const userDataDirectory = await app.evaluate(({ app }) =>
      app.getPath("userData"),
    );
    const datei = path.join(userDataDirectory, "Rechnungsvorlage NHP.html");

    await test.step("Heilpraktiker legt Praxis an", () => legePraxisAn(window));
    await test.step("Heilpraktiker exportiert Rechnungsvorlage", () =>
      exportiereVorlage(app, window, datei));
    await test.step("Heilpraktiker ändert Rechnungsvorlage", () =>
      aendereVorlage(datei));
    await test.step("Heilpraktiker importiert Rechnungsvorlage für Praxis", () =>
      importiereVorlage(app, window, datei));
    await test.step("Heilpraktiker erstellt Rechnung", async () => {
      await nimmPatientAuf(window);
      await stelleDiagnose(window);
      await erbringeLeistung(window);
      await erstelleRechnung(window);
      await expect(
        window
          .getByTitle("Rechnung")
          .contentFrame()
          .getByRole("heading", { name: "Honorarrechnung" }),
      ).toBeVisible();
    });
    await test.step("Heilpraktiker setzt Rechnungsvorlage zurück", () =>
      setzeVorlageZurueck(window));
  });
});

async function zeigeRechnungsvorlagen(window: Page) {
  await window.getByRole("button", { name: "Stammdaten" }).click();
  await window.getByRole("link", { name: "Rechnungsvorlagen" }).click();
  await window
    .getByRole("button", { name: /Naturheilpraxis am Markt/ })
    .click();
}

function vorschau(window: Page) {
  return window.getByTitle("Vorschau der Rechnungsvorlage").contentFrame();
}

async function exportiereVorlage(
  app: ElectronApplication,
  window: Page,
  datei: string,
) {
  await zeigeRechnungsvorlagen(window);
  await expect(
    window.getByRole("heading", {
      level: 2,
      name: "Naturheilpraxis am Markt: Allgemeine Vorlage",
    }),
  ).toBeVisible();
  await expect(
    vorschau(window).getByText("Dr. Erika Mustermann"),
  ).toBeVisible();

  await chooseFiles(app, { exportFile: datei });
  await window.getByRole("button", { name: "Exportieren …" }).click();

  await expect(
    window.getByText(
      "Die Rechnungsvorlage „Naturheilpraxis am Markt“ wurde exportiert.",
    ),
  ).toBeVisible();
  expect(await fs.readFile(datei, "utf-8")).toContain("<h1>Rechnung</h1>");
}

async function aendereVorlage(datei: string) {
  const vorlage = await fs.readFile(datei, "utf-8");
  await fs.writeFile(
    datei,
    vorlage.replace("<h1>Rechnung</h1>", "<h1>Honorarrechnung</h1>"),
  );
}

async function importiereVorlage(
  app: ElectronApplication,
  window: Page,
  datei: string,
) {
  await chooseFiles(app, { importFile: datei });
  await window.getByRole("button", { name: "Importieren …" }).click();

  await expect(
    window.getByText(
      "Die Rechnungsvorlage „Naturheilpraxis am Markt“ wurde importiert.",
    ),
  ).toBeVisible();
  await expect(
    window.getByRole("heading", {
      level: 2,
      name: "Naturheilpraxis am Markt: Eigene Vorlage",
    }),
  ).toBeVisible();
  await expect(
    vorschau(window).getByRole("heading", { name: "Honorarrechnung" }),
  ).toBeVisible();
}

async function setzeVorlageZurueck(window: Page) {
  await zeigeRechnungsvorlagen(window);
  await window.getByRole("button", { name: "Zurücksetzen" }).click();
  await window
    .getByRole("dialog", { name: "Rechnungsvorlage zurücksetzen?" })
    .getByRole("button", { name: "Zurücksetzen" })
    .click();

  await expect(
    window.getByRole("heading", {
      level: 2,
      name: "Naturheilpraxis am Markt: Allgemeine Vorlage",
    }),
  ).toBeVisible();
  await expect(
    vorschau(window).getByRole("heading", { name: "Rechnung", exact: true }),
  ).toBeVisible();
}
