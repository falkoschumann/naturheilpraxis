// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

import path from "node:path";

import { describe, expect, it } from "vitest";

import { Einstellungen } from "../../../src/shared/domain/einstellungen";
import { EinstellungenGateway } from "../../../src/main/infrastructure/einstellungen_gateway";
import { EinstellungenDto } from "../../../src/shared/infrastructure/einstellungen";

const NON_EXISTING_FILE = path.resolve(
  __dirname,
  "../data/einstellungen/non-existent.json",
);

const EXAMPLE_FILE = path.resolve(
  __dirname,
  "../data/einstellungen/example.json",
);

const CORRUPT_FILE = path.resolve(
  __dirname,
  "../data/einstellungen/corrupt.json",
);

const TEST_FILE = path.resolve(
  __dirname,
  "../../../testdata/einstellungen.test.json",
);

describe("Einstellungen Gateway", () => {
  describe("Lade", () => {
    it("sollte nichts liefern, wenn Datei nicht existiert", async () => {
      const gateway = EinstellungenGateway.create({
        fileName: NON_EXISTING_FILE,
      });

      const einstellungen = await gateway.lade();

      expect(einstellungen).toBeUndefined();
    });

    it("sollte Beispieldatei laden", async () => {
      const gateway = EinstellungenGateway.create({
        fileName: EXAMPLE_FILE,
      });

      const einstellungen = await gateway.lade();

      expect(einstellungen).toEqual<Einstellungen>(
        Einstellungen.createTestInstance(),
      );
    });

    it("sollte einen Fehler werfen, wenn Datei kaputt ist", async () => {
      const gateway = EinstellungenGateway.create({ fileName: CORRUPT_FILE });

      const result = gateway.lade();

      await expect(result).rejects.toThrow(SyntaxError);
    });
  });

  describe("Sichere", () => {
    it("sollte Einstellungen sichern", async () => {
      const gateway = EinstellungenGateway.create({ fileName: TEST_FILE });

      await gateway.sichere(Einstellungen.createTestInstance());

      const result = await gateway.lade();
      expect(result).toEqual<Einstellungen>(Einstellungen.createTestInstance());
    });
  });

  describe("Nullable", () => {
    describe("Load", () => {
      it("sollte nichts liefern, wenn die konfigurierte Antwort null ist", async () => {
        const gateway = EinstellungenGateway.createNull({
          readFileResponses: [null],
        });

        const einstellungen = await gateway.lade();

        expect(einstellungen).toBeUndefined();
      });

      it("sollte konfigurierte Antwort liefern", async () => {
        const gateway = EinstellungenGateway.createNull({
          readFileResponses: [
            EinstellungenDto.fromModel(Einstellungen.createTestInstance()),
          ],
        });

        const einstellungen = await gateway.lade();

        expect(einstellungen).toEqual<Einstellungen>(
          Einstellungen.createTestInstance(),
        );
      });

      it("sollte einen Fehler werfen, wenn die konfigurierte Antwort ein Fehler ist", async () => {
        const gateway = EinstellungenGateway.createNull({
          readFileResponses: [new Error("Test error")],
        });

        const einstellungen = gateway.lade();

        await expect(einstellungen).rejects.toThrow("Test error");
      });
    });

    describe("Store", () => {
      it("sollte Einstellungen sichern", async () => {
        const gateway = EinstellungenGateway.createNull();
        const gesicherteEinstellungen = gateway.trackStored();

        await gateway.sichere(Einstellungen.createTestInstance());

        expect(gesicherteEinstellungen.data).toEqual<Einstellungen[]>([
          Einstellungen.createTestInstance(),
        ]);
      });
    });
  });
});
