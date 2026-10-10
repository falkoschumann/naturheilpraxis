// Copyright (c) 2026 Falko Schumann. MIT license.

import type { Page } from "@playwright/test";

import { expect, test } from "./app";
import { legePraxisAn } from "./schritte";

const { describe } = test;
const it = test;

describe("Stammdaten korrigieren", () => {
  it("sollte Praxis und Gebührenverzeichnis korrigieren", async ({
    window,
  }) => {
    await legePraxisAn(window);

    await test.step("Heilpraktiker korrigiert Praxis", () =>
      korrigierePraxis(window));
    await test.step("Heilpraktiker legt Gebühr im Gebührenverzeichnis an", () =>
      legeGebuehrAn(window));
    await test.step("Heilpraktiker korrigiert Gebühr", () =>
      korrigiereGebuehr(window));
    await test.step("Heilpraktiker entfernt Gebühr aus Gebührenverzeichnis", () =>
      entferneGebuehr(window));
    await test.step("Heilpraktiker stellt Gebühr wieder her", () =>
      stelleGebuehrWiederHer(window));
  });
});

async function korrigierePraxis(window: Page) {
  await window
    .getByRole("button", { name: "Naturheilpraxis am Markt bearbeiten" })
    .click();
  const dialog = window.getByRole("dialog", { name: "Praxis bearbeiten" });
  await expect(dialog.getByLabel("Praxiskürzel")).toHaveValue("NHP");
  await dialog.getByLabel("Straße und Hausnummer").fill("Bahnhofstraße 7");
  await dialog.getByRole("button", { name: "Speichern" }).click();

  await expect(
    window.getByText("Die Praxisdaten wurden geändert."),
  ).toBeVisible();
  const praxis = window.getByRole("article", {
    name: "Naturheilpraxis am Markt",
  });
  await expect(praxis.getByText("Bahnhofstraße 7")).toBeVisible();
}

async function legeGebuehrAn(window: Page) {
  await window.getByRole("button", { name: "Stammdaten" }).click();
  await window.getByRole("link", { name: "Gebührenverzeichnis" }).click();
  await window.getByRole("button", { name: "Gebühr anlegen" }).click();
  const dialog = window.getByRole("dialog", { name: "Gebühr anlegen" });
  await dialog.getByLabel("Ziffer").fill("1");
  await dialog.getByLabel("Betrag (€)").fill("20,50");
  await dialog.getByLabel("Bezeichnung").fill("Eingehende Untersuchung");
  await dialog.getByRole("button", { name: "Gebühr anlegen" }).click();

  await expect(window.getByText("Die Gebühr wurde angelegt.")).toBeVisible();
  await expect(
    window.getByRole("row", { name: /Eingehende Untersuchung/ }),
  ).toContainText("20,50 €");
}

async function korrigiereGebuehr(window: Page) {
  await window.getByRole("button", { name: "Gebühr 1 bearbeiten" }).click();
  const dialog = window.getByRole("dialog", { name: "Gebühr 1 bearbeiten" });
  await dialog.getByLabel("Betrag (€)").fill("23,00");
  await dialog.getByRole("button", { name: "Speichern" }).click();

  await expect(window.getByText("Die Gebühr wurde geändert.")).toBeVisible();
  await expect(
    window.getByRole("row", { name: /Eingehende Untersuchung/ }),
  ).toContainText("23,00 €");
}

async function entferneGebuehr(window: Page) {
  await window.getByRole("button", { name: "Gebühr 1 entfernen" }).click();
  await window
    .getByRole("dialog", { name: "Gebühr entfernen?" })
    .getByRole("button", { name: "Entfernen" })
    .click();

  await expect(window.getByText("Die Gebühr 1 wurde entfernt.")).toBeVisible();
  await expect(
    window.getByRole("row", { name: /Eingehende Untersuchung/ }),
  ).toBeHidden();
}

async function stelleGebuehrWiederHer(window: Page) {
  await window.getByRole("button", { name: "Rückgängig" }).click();

  await expect(
    window.getByText("Die Gebühr 1 ist wieder im Gebührenverzeichnis."),
  ).toBeVisible();
  await expect(
    window.getByRole("row", { name: /Eingehende Untersuchung/ }),
  ).toContainText("23,00 €");
}
