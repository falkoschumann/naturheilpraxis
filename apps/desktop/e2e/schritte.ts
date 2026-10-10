// Copyright (c) 2026 Falko Schumann. MIT license.

import type { Page } from "@playwright/test";

import { expect } from "./app";

// Steps shared by several domain stories.

export async function legePraxisAn(window: Page) {
  await window.getByRole("button", { name: "Stammdaten" }).click();
  await window.getByRole("link", { name: "Praxen" }).click();
  await window.getByRole("button", { name: "Praxis anlegen" }).click();
  const dialog = window.getByRole("dialog", { name: "Praxis anlegen" });
  await dialog.getByLabel("Praxiskürzel").fill("NHP");
  await dialog.getByLabel("Name").fill("Naturheilpraxis am Markt");
  await dialog.getByLabel("Straße und Hausnummer").fill("Marktplatz 1");
  await dialog.getByLabel("Postleitzahl").fill("12345");
  await dialog.getByLabel("Ort", { exact: true }).fill("Musterstadt");
  await dialog
    .getByLabel("Rechnungstext")
    .fill("Bitte überweisen Sie den Betrag innerhalb von 14 Tagen.");
  await dialog.getByRole("button", { name: "Praxis anlegen" }).click();

  await expect(window.getByText("Die Praxis wurde angelegt.")).toBeVisible();
  await expect(
    window.getByRole("article", { name: "Naturheilpraxis am Markt" }),
  ).toBeVisible();
}
