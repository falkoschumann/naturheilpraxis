// Copyright (c) 2026 Falko Schumann. MIT license.

import type { Page } from "@playwright/test";

import { expect, test } from "./app";

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

async function legePraxisAn(window: Page) {
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

async function nimmPatientAuf(window: Page) {
  await window
    .getByRole("navigation", { name: "Hauptnavigation" })
    .getByRole("link", { name: "Patienten" })
    .click();
  await window.getByRole("button", { name: "Patient aufnehmen" }).click();
  const dialog = window.getByRole("dialog", { name: "Patient aufnehmen" });
  await expect(dialog.getByLabel("Praxis")).toHaveValue("NHP");
  await dialog.getByLabel("Vorname").fill("Max");
  await dialog.getByLabel("Nachname").fill("Mustermann");
  await dialog.getByLabel("Geburtsdatum").fill("1980-09-20");
  await dialog.getByLabel("Straße und Hausnummer").fill("Lindenweg 5");
  await dialog.getByLabel("Postleitzahl").fill("12345");
  await dialog.getByLabel("Ort", { exact: true }).fill("Musterstadt");
  await dialog.getByRole("button", { name: "Aufnehmen" }).click();

  await expect(
    window.getByText(
      "Max Mustermann wurde mit der Patientennummer 1 aufgenommen.",
    ),
  ).toBeVisible();
  await expect(
    window.getByRole("heading", { level: 1, name: "Max Mustermann" }),
  ).toBeVisible();
}

async function stelleDiagnose(window: Page) {
  await window.getByRole("button", { name: "Diagnose stellen" }).click();
  const dialog = window.getByRole("dialog", {
    name: "Diagnose stellen für Max Mustermann",
  });
  await expect(dialog.getByLabel("Praxis")).toHaveValue("NHP");
  await dialog.getByLabel("Datum").fill("2026-09-14");
  await dialog.getByLabel("Diagnose").fill("Chronische Rückenschmerzen");
  await dialog.getByRole("button", { name: "Diagnose stellen" }).click();

  await expect(window.getByText("Die Diagnose wurde gestellt.")).toBeVisible();
  const tag = window.getByRole("region", {
    name: "Montag, 14. September 2026",
  });
  await expect(tag.getByText("Chronische Rückenschmerzen")).toBeVisible();
}

async function erbringeLeistung(window: Page) {
  await window.getByRole("button", { name: "Leistung erfassen" }).click();
  const dialog = window.getByRole("dialog", {
    name: "Leistung erfassen für Max Mustermann",
  });
  await expect(dialog.getByLabel("Praxis")).toHaveValue("NHP");
  await dialog.getByLabel("Datum").fill("2026-09-14");
  await dialog.getByLabel("Gebührenziffer").fill("1");
  await dialog.getByLabel("Bezeichnung").fill("Eingehende Untersuchung");
  await dialog.getByLabel("Einzelbetrag (€)").fill("20,50");
  await dialog.getByRole("button", { name: "Leistung erfassen" }).click();

  await expect(window.getByText("Die Leistung 1 wurde erfasst.")).toBeVisible();
  const tag = window.getByRole("region", {
    name: "Montag, 14. September 2026",
  });
  await expect(tag.getByText("Eingehende Untersuchung")).toBeVisible();
  await expect(tag.getByText("Summe 20,50 €")).toBeVisible();
}

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

async function versendeRechnung(_window: Page) {
  // TODO Implement the test for sending an invoice to a patient.
}

async function erfasseZahlung(_window: Page) {
  // TODO Implement the test for recording a payment for an invoice.
}
