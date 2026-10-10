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

describe("Patient korrigieren", () => {
  it("sollte Patientenkarteikarte, Diagnose und Leistung korrigieren", async ({
    window,
  }) => {
    await legePraxisAn(window);
    await nimmPatientAuf(window);
    await stelleDiagnose(window);
    await erbringeLeistung(window);

    await test.step("Heilpraktiker korrigiert Patientenkarteikarte von Patient", () =>
      korrigierePatientenkarteikarte(window));
    await test.step("Heilpraktiker korrigiert Diagnose", () =>
      korrigiereDiagnose(window));
    await test.step("Heilpraktiker korrigiert Leistung", () =>
      korrigiereLeistung(window));
    await test.step("Heilpraktiker löscht Leistung", () =>
      loescheLeistung(window));
    await test.step("Heilpraktiker stellt Leistung wieder her", () =>
      stelleLeistungWiederHer(window));
    await test.step("Heilpraktiker löscht Diagnose", () =>
      loescheDiagnose(window));
    await test.step("Heilpraktiker stellt Diagnose wieder her", () =>
      stelleDiagnoseWiederHer(window));
  });
});

function behandlungstag(window: Page) {
  return window.getByRole("region", { name: "Montag, 14. September 2026" });
}

async function korrigierePatientenkarteikarte(window: Page) {
  await window.getByRole("link", { name: "Stammdaten" }).click();
  const stammdaten = window.getByRole("form", { name: "Stammdaten" });
  await stammdaten.getByLabel("Straße und Hausnummer").fill("Lindenweg 15");
  await stammdaten.getByRole("button", { name: "Speichern" }).click();

  await expect(
    window.getByText("Die Stammdaten wurden gespeichert."),
  ).toBeVisible();
  await window.getByRole("link", { name: "Behandlung" }).click();
  await window.getByRole("link", { name: "Stammdaten" }).click();
  await expect(
    window
      .getByRole("form", { name: "Stammdaten" })
      .getByLabel("Straße und Hausnummer"),
  ).toHaveValue("Lindenweg 15");
  await window.getByRole("link", { name: "Behandlung" }).click();
}

async function korrigiereDiagnose(window: Page) {
  await behandlungstag(window)
    .getByRole("button", { name: "Diagnose bearbeiten" })
    .click();
  const dialog = window.getByRole("dialog", { name: "Diagnose bearbeiten" });
  await dialog.getByLabel("Diagnose").fill("Chronische Lumbalgie");
  await dialog.getByRole("button", { name: "Speichern" }).click();

  await expect(window.getByText("Die Diagnose wurde geändert.")).toBeVisible();
  await expect(
    behandlungstag(window).getByText("Chronische Lumbalgie"),
  ).toBeVisible();
}

async function korrigiereLeistung(window: Page) {
  await behandlungstag(window)
    .getByRole("button", { name: "Leistung bearbeiten" })
    .click();
  const dialog = window.getByRole("dialog", { name: "Leistung bearbeiten" });
  await dialog.getByLabel("Anzahl").fill("2");
  await dialog.getByRole("button", { name: "Speichern" }).click();

  await expect(window.getByText("Die Leistung wurde geändert.")).toBeVisible();
  await expect(behandlungstag(window).getByText("Summe 41,00 €")).toBeVisible();
}

async function loescheLeistung(window: Page) {
  await behandlungstag(window)
    .getByRole("button", { name: "Leistung löschen" })
    .click();
  await window
    .getByRole("dialog", { name: "Leistung löschen?" })
    .getByRole("button", { name: "Löschen" })
    .click();

  await expect(window.getByText("Die Leistung wurde gelöscht.")).toBeVisible();
  await expect(
    behandlungstag(window).getByText("Eingehende Untersuchung"),
  ).toBeHidden();
}

async function stelleLeistungWiederHer(window: Page) {
  await window.getByRole("button", { name: "Rückgängig" }).click();

  await expect(
    window.getByText("Die Leistung ist wiederhergestellt."),
  ).toBeVisible();
  await expect(
    behandlungstag(window).getByText("Eingehende Untersuchung"),
  ).toBeVisible();
  await expect(behandlungstag(window).getByText("Summe 41,00 €")).toBeVisible();
}

async function loescheDiagnose(window: Page) {
  await behandlungstag(window)
    .getByRole("button", { name: "Diagnose löschen" })
    .click();
  await window
    .getByRole("dialog", { name: "Diagnose löschen?" })
    .getByRole("button", { name: "Löschen" })
    .click();

  await expect(window.getByText("Die Diagnose wurde gelöscht.")).toBeVisible();
  await expect(
    behandlungstag(window).getByText("Chronische Lumbalgie"),
  ).toBeHidden();
}

async function stelleDiagnoseWiederHer(window: Page) {
  await window.getByRole("button", { name: "Rückgängig" }).click();

  await expect(
    window.getByText("Die Diagnose ist wiederhergestellt."),
  ).toBeVisible();
  await expect(
    behandlungstag(window).getByText("Chronische Lumbalgie"),
  ).toBeVisible();
}
