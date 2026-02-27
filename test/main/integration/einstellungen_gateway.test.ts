// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

import { describe, expect, it } from "vitest";

import { Einstellungen } from "../../../src/shared/domain/einstellungen";
import { EinstellungenGateway } from "../../../src/main/infrastructure/einstellungen_gateway";
import { DatabaseProvider } from "../../../src/main/infrastructure/database_provider";

describe("Einstellungen Gateway", () => {
  describe("Lade", () => {
    it("sollte Einstellungen laden", () => {
      const { gateway } = configure();

      const einstellungen = gateway.lade();

      expect(einstellungen).toEqual(Einstellungen.create());
    });
  });

  describe("Sichere", () => {
    it("sollte gesicherte Einstellungen laden", () => {
      const { gateway } = configure();

      gateway.sichere(Einstellungen.createTestInstance());
      const einstellungen = gateway.lade();

      expect(einstellungen).toEqual<Einstellungen>(
        Einstellungen.createTestInstance(),
      );
    });
  });
});

function configure() {
  const databaseProvider = DatabaseProvider.create();
  const gateway = EinstellungenGateway.create({ databaseProvider });
  return { gateway };
}
