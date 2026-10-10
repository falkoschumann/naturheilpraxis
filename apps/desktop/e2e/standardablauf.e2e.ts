// Copyright (c) 2026 Falko Schumann. MIT license.

import type { Page } from "@playwright/test";

import { expect, test } from "./app";
import {
  erbringeLeistung,
  legePraxisAn,
  nimmPatientAuf,
  stelleDiagnose,
} from "./schritte";

const { describe } = test;
const it = test;

describe("Standardablauf", () => {
  it("sollte eine Leistung vom Anlegen der Praxis bis zur bezahlten Rechnung abrechnen", async ({
    window,
  }) => {
    await test.step("Heilpraktiker legt Praxis an", () => legePraxisAn(window));
    await test.step("Heilpraktiker legt Patientenkarteikarte für Patient an", () =>
      nimmPatientAuf(window));
    await test.step("Heilpraktiker stellt Diagnose für Patient", () =>
      stelleDiagnose(window));
    await test.step("Heilpraktiker erbringt Leistung für Patient", () =>
      erbringeLeistung(window));
    await test.step("Heilpraktiker erstellt Rechnung aus Leistung wegen Diagnose", () =>
      erstelleRechnung(window));
    await test.step("Heilpraktiker versendet Rechnung an Patient", () =>
      versendeRechnung(window));
    await test.step("Patient bezahlt Rechnung", () => erfasseZahlung(window));
  });
});

async function erstelleRechnung(window: Page) {
  await window.getByRole("button", { name: "Rechnung erstellen" }).click();
  const dialog = window.getByRole("dialog", {
    name: "Rechnung erstellen für Max Mustermann",
  });
  await expect(dialog.getByLabel("Diagnosetext auf der Rechnung")).toHaveValue(
    "Chronische Rückenschmerzen",
  );
  await expect(dialog.getByLabel("Rechnungstext")).toHaveValue(
    "Bitte überweisen Sie den Betrag innerhalb von 14 Tagen.",
  );
  await expect(
    dialog.getByRole("checkbox", {
      name: "Eingehende Untersuchung vom 14.09.2026",
    }),
  ).toBeChecked();
  await dialog.getByRole("button", { name: "Entwurf erstellen" }).click();

  await expect(
    window.getByRole("heading", { level: 1, name: "Rechnungsentwurf" }),
  ).toBeVisible();
  const rechnung = window.getByRole("article", { name: "Rechnung" });
  await expect(
    rechnung.getByRole("row", { name: /Eingehende Untersuchung/ }),
  ).toBeVisible();
  await expect(rechnung.getByText("Chronische Rückenschmerzen")).toBeVisible();
}

async function versendeRechnung(window: Page) {
  await window.getByRole("button", { name: "Versenden" }).click();
  await window
    .getByRole("dialog", { name: "Rechnung versenden?" })
    .getByRole("button", { name: "Versenden" })
    .click();

  // The Rechnungsnummer consists of Patientennummer and today's date.
  await expect(
    window.getByRole("heading", { level: 1, name: /^Rechnung 1\/\d{6}$/ }),
  ).toBeVisible();
  await expect(
    window.getByText(/^Die Rechnung 1\/\d{6} wurde als versendet markiert\.$/),
  ).toBeVisible();
  await expect(window.getByRole("button", { name: "Drucken" })).toBeVisible();
}

async function erfasseZahlung(window: Page) {
  await window.getByRole("button", { name: "Zahlung erfassen" }).click();

  await expect(
    window.getByText(
      /^Der Zahlungseingang für Rechnung 1\/\d{6} wurde erfasst\.$/,
    ),
  ).toBeVisible();
  const fortschritt = window.getByRole("list", {
    name: "Fortschritt der Rechnung",
  });
  await expect(
    fortschritt.getByRole("listitem").filter({ hasText: "Bezahlt" }),
  ).toHaveAttribute("aria-current", "step");
}
