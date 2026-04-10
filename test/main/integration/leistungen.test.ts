// Copyright (c) 2026 Falko Schumann. All rights reserved. MIT license.

import { describe, expect, it } from "vitest";

import { LeistungenQueryHandler } from "../../../src/main/application/leistungen_query_handler";
import { Leistung } from "../../../src/shared/domain/leistung";
import {
  LeistungenQuery,
  LeistungenQueryResult,
} from "../../../src/shared/domain/leistungen_query";
import { Währung } from "../../../src/shared/domain/waehrung";
import { DatenbankProvider } from "../../../src/main/infrastructure/datenbank_provider";
import { LeistungenRepository } from "../../../src/main/infrastructure/leistungen_repository";

describe("Leistungen", () => {
  describe("Liste alle Leistungen für einen Patienten auf", () => {
    it("Sollte eine leere Liste zurückgeben, wenn es keinen Leistungen gibt", async () => {
      const { handler } = configure();

      const result = await handler.handle(
        LeistungenQuery.create({ patientennummer: 1 }),
      );

      expect(result).toEqual<LeistungenQueryResult>(
        LeistungenQueryResult.create(),
      );
    });

    it("Sollte alle Patienten absteigend sortiert nach Nummer zurückgeben", async () => {
      const { handler, leistungenRepository } = configure();
      leistungenRepository.create(Leistung.createTestInstance({ id: 1 }));
      leistungenRepository.create(
        Leistung.createTestInstance({
          id: 2,
          gebührenziffer: "21",
          beschreibung: "Akupunktur",
          einzelpreis: Währung.from(1815),
        }),
      );

      const result = await handler.handle(
        LeistungenQuery.create({ patientennummer: 1 }),
      );

      expect(result).toEqual<LeistungenQueryResult>({
        leistungen: [
          Leistung.createTestInstance({ id: 1 }),
          Leistung.createTestInstance({
            id: 2,
            gebührenziffer: "21",
            beschreibung: "Akupunktur",
            einzelpreis: Währung.from(1815),
          }),
        ],
      });
    });

    it("Sollte eine leere Liste zurückgeben, wenn es den Patienten nicht", async () => {
      const { handler, leistungenRepository } = configure();
      leistungenRepository.create(Leistung.createTestInstance({ id: 1 }));
      leistungenRepository.create(
        Leistung.createTestInstance({
          id: 2,
          gebührenziffer: "21",
          beschreibung: "Akupunktur",
          einzelpreis: Währung.from(1815),
        }),
      );

      const result = await handler.handle(
        LeistungenQuery.create({ patientennummer: 2 }),
      );

      expect(result).toEqual<LeistungenQueryResult>(
        LeistungenQueryResult.create(),
      );
    });
  });
});

function configure() {
  const datenbankProvider = DatenbankProvider.create();
  const leistungenRepository = LeistungenRepository.create({
    datenbankProvider,
  });
  const handler = LeistungenQueryHandler.create({ leistungenRepository });
  return { handler, leistungenRepository };
}
