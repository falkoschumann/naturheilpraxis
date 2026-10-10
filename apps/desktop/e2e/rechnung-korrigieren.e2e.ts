// Copyright (c) 2026 Falko Schumann. MIT license.

import type { Page } from "@playwright/test";

import { expect, test } from "./app";
import {
  erbringeLeistung,
  erfasseZahlung,
  erstelleRechnung,
  legePraxisAn,
  nimmPatientAuf,
  stelleDiagnose,
  versendeRechnung,
} from "./schritte";

const { describe } = test;
const it = test;

describe("Rechnung korrigieren", () => {
  it("sollte Rechnungsentwurf, Versand und Zahlung korrigieren", async ({
    window,
  }) => {
    await legePraxisAn(window);
    await nimmPatientAuf(window);
    await stelleDiagnose(window);
    await erbringeLeistung(window);
    await erstelleRechnung(window);

    await test.step("Heilpraktiker korrigiert Rechnung", () =>
      korrigiereRechnung(window));
    await test.step("Heilpraktiker verwirft Rechnung", () =>
      verwirfRechnung(window));
    await test.step("Heilpraktiker erstellt Rechnung erneut aus wieder nicht abgerechneter Leistung", () =>
      erstelleRechnung(window));
    await test.step("Heilpraktiker versendet Rechnung an Patient", () =>
      versendeRechnung(window));
    await test.step("Heilpraktiker nimmt Versand zurück von Rechnung", () =>
      nimmVersandZurueck(window));
    await test.step("Heilpraktiker versendet Rechnung erneut an Patient", () =>
      versendeRechnung(window));
    await test.step("Patient bezahlt Rechnung", () => erfasseZahlung(window));
    await test.step("Heilpraktiker nimmt Zahlungseingang zurück", () =>
      nimmZahlungZurueck(window));
  });
});

async function korrigiereRechnung(window: Page) {
  await window.getByRole("button", { name: "Bearbeiten" }).click();
  const dialog = window.getByRole("dialog", {
    name: "Rechnungsentwurf bearbeiten",
  });
  await dialog
    .getByLabel("Diagnosetext auf der Rechnung")
    .fill("Chronische Lumbalgie");
  await dialog.getByRole("button", { name: "Speichern" }).click();

  await expect(
    window.getByText("Der Rechnungsentwurf wurde gespeichert."),
  ).toBeVisible();
  await expect(
    window
      .getByRole("article", { name: "Rechnung" })
      .getByText("Chronische Lumbalgie"),
  ).toBeVisible();
}

async function verwirfRechnung(window: Page) {
  await window.getByRole("button", { name: "Entwurf löschen" }).click();
  await window
    .getByRole("dialog", { name: "Entwurf löschen?" })
    .getByRole("button", { name: "Löschen" })
    .click();

  await expect(
    window.getByText("Der Rechnungsentwurf wurde gelöscht."),
  ).toBeVisible();
  await expect(
    window.getByText("1 noch nicht abgerechnete Leistung über 20,50 €"),
  ).toBeVisible();
}

async function nimmVersandZurueck(window: Page) {
  await window.getByRole("button", { name: "Versand zurücknehmen" }).click();
  await window
    .getByRole("dialog", { name: "Versand zurücknehmen?" })
    .getByRole("button", { name: "Versand zurücknehmen" })
    .click();

  await expect(
    window.getByText(
      "Der Versand wurde zurückgenommen. Die Rechnung ist wieder ein Entwurf.",
    ),
  ).toBeVisible();
  await expect(
    window.getByRole("heading", { level: 1, name: "Rechnungsentwurf" }),
  ).toBeVisible();
}

async function nimmZahlungZurueck(window: Page) {
  await window.getByRole("button", { name: "Zahlung zurücknehmen" }).click();
  await window
    .getByRole("dialog", { name: "Zahlung zurücknehmen?" })
    .getByRole("button", { name: "Zahlung zurücknehmen" })
    .click();

  await expect(
    window.getByText("Die Zahlung wurde zurückgenommen."),
  ).toBeVisible();
  const fortschritt = window.getByRole("list", {
    name: "Fortschritt der Rechnung",
  });
  await expect(
    fortschritt.getByRole("listitem").filter({ hasText: "Versendet" }),
  ).toHaveAttribute("aria-current", "step");
}
