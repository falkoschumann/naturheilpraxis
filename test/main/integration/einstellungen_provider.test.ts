// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

import { describe, expect, it } from "vitest";

import { Einstellungen } from "../../../src/shared/domain/einstellungen";
import { EinstellungenProvider } from "../../../src/main/infrastructure/einstellungen_provider";
import { DatabaseProvider } from "../../../src/main/infrastructure/database_provider";

describe("Einstellungen Provider", () => {
  describe("Lade", () => {
    it("sollte Einstellungen laden", () => {
      const { gateway } = configure();

      const einstellungen = gateway.lade();

      expect(einstellungen).toEqual(Einstellungen.createDefault());
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
  const gateway = EinstellungenProvider.create({ databaseProvider });
  return { gateway };
}
