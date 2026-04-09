// Copyright (c) 2026 Falko Schumann. All rights reserved. MIT license.

import { describe, expect, it } from "vitest";

import { PatientenQueryHandler } from "../../../src/main/application/patienten_query_handler";
import { Patient } from "../../../src/shared/domain/patient";
import {
  PatientenQuery,
  PatientenQueryResult,
} from "../../../src/shared/domain/suche_patienten_query";
import { DatenbankProvider } from "../../../src/main/infrastructure/datenbank_provider";
import { PatientenRepository } from "../../../src/main/infrastructure/patienten_repository";

describe("Suche Patienten", () => {
  describe("Liste alle Patienten auf", () => {
    it("Sollte eine leere Liste zurückgeben, wenn es keinen Patienten gibt", async () => {
      const { handler } = configure();

      const result = await handler.handle(PatientenQuery.create());

      expect(result).toEqual<PatientenQueryResult>({ patienten: [] });
    });

    it("Sollte alle Patienten absteigend sortiert nach Nummer zurückgeben", async () => {
      const { handler, patientenRepository } = configure();
      patientenRepository.create(
        Patient.createTestInstance({ vorname: "Max" }),
      );
      patientenRepository.create(
        Patient.createTestInstance({ vorname: "Erika" }),
      );

      const result = await handler.handle(PatientenQuery.create());

      expect(result).toEqual<PatientenQueryResult>({
        patienten: [
          Patient.createTestInstance({
            nummer: 2,
            vorname: "Erika",
          }),
          Patient.createTestInstance({
            nummer: 1,
            vorname: "Max",
          }),
        ],
      });
    });
  });
});

function configure() {
  const datenbankProvider = DatenbankProvider.create();
  const patientenRepository = PatientenRepository.create({ datenbankProvider });
  const handler = PatientenQueryHandler.create({ patientenRepository });
  return { handler, patientenRepository };
}
