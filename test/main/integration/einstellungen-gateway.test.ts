// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

import path from "node:path";

import { describe, expect, it } from "vitest";

import { Einstellungen } from "../../../src/shared/domain/einstellungen";
import { EinstellungenGateway } from "../../../src/main/infrastructure/einstellungen-gateway";

const TEST_FILE = path.resolve(
  __dirname,
  "../../../testdata/settings.test.json",
);
const NON_EXISTING_FILE = path.resolve(
  __dirname,
  "../data/settings/non-existent.json",
);
const EXAMPLE_FILE = path.resolve(__dirname, "../data/settings/example.json");
const CORRUPTED_FILE = path.resolve(__dirname, "../data/settings/corrupt.json");

describe("Einstellungen Gateway", () => {
  it("sollte Einstellungen sichern und laden", async () => {
    const gateway = new EinstellungenGateway(TEST_FILE);
    const settings = {
      praxis: ["Testpraxis"],
      anrede: ["Herr", "Frau"],
      familienstand: ["ledig", "verheiratet"],
      schluesselworte: ["Test", "Beispiel"],
      standardSchluesselworte: ["Test"],
    };

    await gateway.sichere(settings);
    const result = await gateway.lade();

    expect(result).toEqual<Einstellungen>(settings);
  });

  it("sollte Defaulteinstellungen liefern, wenn Datei nicht existiert", async () => {
    const gateway = new EinstellungenGateway(NON_EXISTING_FILE);

    const settings = await gateway.lade();

    expect(settings).toEqual<Einstellungen>(Einstellungen.createDefault());
  });

  it("sollte Beispieldatei laden", async () => {
    const gateway = new EinstellungenGateway(EXAMPLE_FILE);

    const settings = await gateway.lade();

    expect(settings).toEqual<Einstellungen>(Einstellungen.createTestInstance());
  });

  it("sollte einen Fehler werfen, wenn Datei kaputt ist", async () => {
    const gateway = new EinstellungenGateway(CORRUPTED_FILE);

    const result = gateway.lade();

    await expect(result).rejects.toThrow(SyntaxError);
  });
});
