// Copyright (c) 2026 Falko Schumann. MIT license.

import type { Page } from "@playwright/test";

import { expect, test } from "./app";
import {
  erbringeLeistung,
  erstelleRechnung,
  legePraxisAn,
  stelleDiagnose,
  versendeRechnung,
} from "./schritte";

const { describe } = test;
const it = test;

describe("Rechnungsanschrift fehlt", () => {
  it("sollte Versand ohne Anschrift ablehnen und nach Ergänzen der Anschrift versenden", async ({
    window,
  }) => {
    await legePraxisAn(window);
    await nimmPatientOhneAnschriftAuf(window);
    await stelleDiagnose(window);
    await erbringeLeistung(window);
    await erstelleRechnung(window);

    await test.step("Heilpraktiker versendet Rechnung an Patient", () =>
      versendeRechnungOhneAnschrift(window));
    await test.step("Heilpraktiker ergänzt Anschrift auf Patientenkarteikarte", () =>
      ergaenzeAnschrift(window));
    await test.step("Heilpraktiker versendet Rechnung erneut an Patient", () =>
      versendeRechnung(window));
  });
});

async function nimmPatientOhneAnschriftAuf(window: Page) {
  await window
    .getByRole("navigation", { name: "Hauptnavigation" })
    .getByRole("link", { name: "Patienten" })
    .click();
  await window.getByRole("button", { name: "Patient aufnehmen" }).click();
  const dialog = window.getByRole("dialog", { name: "Patient aufnehmen" });
  await dialog.getByLabel("Vorname").fill("Max");
  await dialog.getByLabel("Nachname").fill("Mustermann");
  await dialog.getByLabel("Geburtsdatum").fill("1980-09-20");
  await dialog.getByRole("button", { name: "Aufnehmen" }).click();

  await expect(
    window.getByText(
      "Max Mustermann wurde mit der Patientennummer 1 aufgenommen.",
    ),
  ).toBeVisible();
}

async function versendeRechnungOhneAnschrift(window: Page) {
  await expect(
    window
      .getByRole("alert")
      .filter({ hasText: "keine vollständige Anschrift" }),
  ).toBeVisible();
  await window.getByRole("button", { name: "Versenden" }).click();
  await window
    .getByRole("dialog", { name: "Rechnung versenden?" })
    .getByRole("button", { name: "Versenden" })
    .click();

  await expect(
    window.getByText(
      "Die Rechnung kann nicht versendet werden, weil die Anschrift des Patienten fehlt. Bitte ergänzen Sie Straße, Postleitzahl und Ort in den Stammdaten.",
    ),
  ).toBeVisible();
  await expect(
    window.getByRole("heading", { level: 1, name: "Rechnungsentwurf" }),
  ).toBeVisible();
}

async function ergaenzeAnschrift(window: Page) {
  await window.getByRole("link", { name: "Anschrift ergänzen" }).click();
  const stammdaten = window.getByRole("form", { name: "Stammdaten" });
  await stammdaten.getByLabel("Straße und Hausnummer").fill("Lindenweg 5");
  await stammdaten.getByLabel("Postleitzahl").fill("12345");
  await stammdaten.getByLabel("Ort", { exact: true }).fill("Musterstadt");
  await stammdaten.getByRole("button", { name: "Speichern" }).click();

  await expect(
    window.getByText("Die Stammdaten wurden gespeichert."),
  ).toBeVisible();
  await window.getByRole("link", { name: "Rechnungen" }).click();
  await window.getByRole("link", { name: "Entwurf" }).click();
  await expect(
    window
      .getByRole("alert")
      .filter({ hasText: "keine vollständige Anschrift" }),
  ).toBeHidden();
}
