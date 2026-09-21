// Copyright (c) 2026 Falko Schumann. MIT license.

import type { Page } from "@playwright/test";

import { test } from "./app";

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

async function legePraxisAn(_window: Page) {
  // TODO Implement the test for creating a practice.
}

async function nimmPatientAuf(_window: Page) {
  // TODO Implement the test for admitting a patient.
}

async function stelleDiagnose(_window: Page) {
  // TODO Implement the test for diagnosing a patient.
}

async function erbringeLeistung(_window: Page) {
  // TODO Implement the test for providing a service to a patient.
}

async function erstelleRechnung(_window: Page) {
  // TODO Implement the test for creating an invoice based on a service and diagnosis.
}

async function versendeRechnung(_window: Page) {
  // TODO Implement the test for sending an invoice to a patient.
}

async function erfasseZahlung(_window: Page) {
  // TODO Implement the test for recording a payment for an invoice.
}
