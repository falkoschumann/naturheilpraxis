// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

import path from "node:path";

import { describe, expect, it } from "vitest";

import { Settings } from "../../../src/shared/domain/settings";
import { SettingsGateway } from "../../../src/main/infrastructure/settings_gateway";
import { SettingsDto } from "../../../src/shared/infrastructure/settings_dto";

const NON_EXISTING_FILE = path.resolve(
  __dirname,
  "../data/settings/non-existent.json",
);

const EXAMPLE_FILE = path.resolve(__dirname, "../data/settings/example.json");

const CORRUPT_FILE = path.resolve(__dirname, "../data/settings/corrupt.json");

const TEST_FILE = path.resolve(
  __dirname,
  "../../../testdata/settings.test.json",
);

describe("Settings Gateway", () => {
  describe("Load", () => {
    it("should return nothing when the file does not exist", async () => {
      const gateway = SettingsGateway.create({
        fileName: NON_EXISTING_FILE,
      });

      const settings = await gateway.load();

      expect(settings).toBeUndefined();
    });

    it("should load example file", async () => {
      const gateway = SettingsGateway.create({
        fileName: EXAMPLE_FILE,
      });

      const settings = await gateway.load();

      expect(settings).toEqual<Settings>(Settings.createTestInstance());
    });

    it("should an error when the file is corrupt", async () => {
      const gateway = SettingsGateway.create({ fileName: CORRUPT_FILE });

      const result = gateway.load();

      await expect(result).rejects.toThrow(SyntaxError);
    });
  });

  describe("Store", () => {
    it("should store to file", async () => {
      const gateway = SettingsGateway.create({ fileName: TEST_FILE });

      await gateway.store(Settings.createTestInstance());

      const result = await gateway.load();
      expect(result).toEqual<Settings>(Settings.createTestInstance());
    });
  });

  describe("Nullable", () => {
    describe("Load", () => {
      it("should return nothing when the configurable response is null", async () => {
        const gateway = SettingsGateway.createNull({
          readFileResponses: [null],
        });

        const settings = await gateway.load();

        expect(settings).toBeUndefined();
      });

      it("should return a configurable response", async () => {
        const gateway = SettingsGateway.createNull({
          readFileResponses: [
            SettingsDto.fromModel(Settings.createTestInstance()),
          ],
        });

        const settings = await gateway.load();

        expect(settings).toEqual<Settings>(Settings.createTestInstance());
      });

      it("should throw an error when the configurable response is an error", async () => {
        const gateway = SettingsGateway.createNull({
          readFileResponses: [new Error("Test error")],
        });

        const settings = gateway.load();

        await expect(settings).rejects.toThrow("Test error");
      });
    });

    describe("Store", () => {
      it("should store settings", async () => {
        const gateway = SettingsGateway.createNull();
        const storedSettings = gateway.trackStored();

        await gateway.store(Settings.createTestInstance());

        expect(storedSettings.data).toEqual<Settings[]>([
          Settings.createTestInstance(),
        ]);
      });
    });
  });
});
