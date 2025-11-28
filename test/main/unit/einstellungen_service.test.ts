// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

import { describe, expect, it } from "vitest";

import { EinstellungenService } from "../../../src/main/application/einstellungen_service";
import { Einstellungen } from "../../../src/shared/domain/einstellungen";
import { EinstellungenDto } from "../../../src/shared/infrastructure/einstellungen";
import { EinstellungenGateway } from "../../../src/main/infrastructure/einstellungen_gateway";

describe("Einstellungen Service", () => {
  describe("Lade Einstellungen", () => {
    it("sollte Standardeinstellungen zurückgeben, wenn keine Einstellungen gesichert sind", async () => {
      const { service } = configure({ readFileResponses: [null] });

      const einstellungen = await service.ladeEinstellungen();

      expect(einstellungen).toEqual<Einstellungen>(
        Einstellungen.createDefault(),
      );
    });

    it("sollte gesicherte Einstellungen zurückgeben", async () => {
      const { service } = configure({
        readFileResponses: [
          EinstellungenDto.fromModel(Einstellungen.createTestInstance()),
        ],
      });

      const einstellungen = await service.ladeEinstellungen();

      expect(einstellungen).toEqual<Einstellungen>(
        Einstellungen.createTestInstance(),
      );
    });
  });

  describe("Sichere Einstellungen", () => {
    it("sollte Einstellungen sichern", async () => {
      const { service, gateway } = configure();
      const gesicherteEinstellungen = gateway.trackStored();

      await service.sichereEinstellungen(Einstellungen.createTestInstance());

      expect(gesicherteEinstellungen.data).toEqual<Einstellungen[]>([
        Einstellungen.createTestInstance(),
      ]);
    });
  });
});

function configure({
  readFileResponses,
}: {
  readFileResponses?: (EinstellungenDto | null | Error)[];
} = {}) {
  const gateway = EinstellungenGateway.createNull({ readFileResponses });
  const service = new EinstellungenService(gateway);
  return { service, gateway };
}
