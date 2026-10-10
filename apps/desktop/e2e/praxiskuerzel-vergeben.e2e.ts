// Copyright (c) 2026 Falko Schumann. MIT license.

import type { Page } from "@playwright/test";

import { expect, test } from "./app";
import { legePraxisAn } from "./schritte";

const { describe } = test;
const it = test;

describe("Praxiskürzel vergeben", () => {
  it("sollte Praxis mit vergebenem Kürzel ablehnen und mit anderem Kürzel anlegen", async ({
    window,
  }) => {
    await legePraxisAn(window);

    await test.step("Heilpraktiker legt Praxis an", () =>
      legePraxisMitVergebenemKuerzelAn(window));
    await test.step("Heilpraktiker legt Praxis erneut an", () =>
      legePraxisMitAnderemKuerzelAn(window));
  });
});

async function legePraxisMitVergebenemKuerzelAn(window: Page) {
  await window.getByRole("button", { name: "Praxis anlegen" }).click();
  const dialog = window.getByRole("dialog", { name: "Praxis anlegen" });
  await dialog.getByLabel("Praxiskürzel").fill("NHP");
  await dialog.getByLabel("Name").fill("Naturheilpraxis am Bahnhof");
  await dialog.getByLabel("Straße und Hausnummer").fill("Bahnhofstraße 7");
  await dialog.getByLabel("Postleitzahl").fill("12345");
  await dialog.getByLabel("Ort", { exact: true }).fill("Musterstadt");
  await dialog.getByRole("button", { name: "Praxis anlegen" }).click();

  await expect(dialog.getByRole("alert")).toHaveText(
    "Eine Praxis mit dem Kürzel „NHP“ ist bereits angelegt. Bitte wählen Sie ein anderes Kürzel. Ihre Eingaben bleiben erhalten.",
  );
  await expect(dialog.getByLabel("Name")).toHaveValue(
    "Naturheilpraxis am Bahnhof",
  );
}

async function legePraxisMitAnderemKuerzelAn(window: Page) {
  const dialog = window.getByRole("dialog", { name: "Praxis anlegen" });
  await dialog.getByLabel("Praxiskürzel").fill("NHB");
  await dialog.getByRole("button", { name: "Praxis anlegen" }).click();

  await expect(window.getByText("Die Praxis wurde angelegt.")).toBeVisible();
  await expect(
    window.getByRole("article", { name: "Naturheilpraxis am Bahnhof" }),
  ).toBeVisible();
}
