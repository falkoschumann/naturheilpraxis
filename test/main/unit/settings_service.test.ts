// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

import { describe, expect, it } from "vitest";

import { SettingsService } from "../../../src/main/application/settings_service";
import { Settings } from "../../../src/shared/domain/settings";
import { SettingsDto } from "../../../src/shared/infrastructure/settings_dto";
import { SettingsGateway } from "../../../src/main/infrastructure/settings_gateway";

describe("Settings Service", () => {
  describe("Load settings", () => {
    it("should return default settings when no settings are stored", async () => {
      const { service } = configure({ readFileResponses: [null] });

      const settings = await service.loadSettings();

      expect(settings).toEqual<Settings>(Settings.createDefault());
    });

    it("should return stored settings", async () => {
      const { service } = configure({
        readFileResponses: [
          SettingsDto.fromModel(Settings.createTestInstance()),
        ],
      });

      const settings = await service.loadSettings();

      expect(settings).toEqual<Settings>(Settings.createTestInstance());
    });
  });

  describe("Store settings", () => {
    it("should store settings", async () => {
      const { service, gateway } = configure();
      const storedSettings = gateway.trackStored();

      await service.storeSettings(Settings.createTestInstance());

      expect(storedSettings.data).toEqual<Settings[]>([
        Settings.createTestInstance(),
      ]);
    });
  });
});

function configure({
  readFileResponses,
}: {
  readFileResponses?: (SettingsDto | null | Error)[];
} = {}) {
  const gateway = SettingsGateway.createNull({ readFileResponses });
  const service = new SettingsService(gateway);
  return { service, gateway };
}
