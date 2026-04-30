// Copyright (c) 2026 Falko Schumann. All rights reserved. MIT license.

import { describe, expect, it } from "vitest";

import { DiagnosenQueryHandler } from "../../../src/main/application/diagnosen_query_handler";
import { Diagnose } from "../../../src/shared/domain/diagnose";
import {
  DiagnosenQuery,
  DiagnosenQueryResult,
} from "../../../src/shared/domain/diagnosen_query";
import { Patient } from "../../../src/shared/domain/patient";
import { DatenbankProvider } from "../../../src/main/infrastructure/datenbank_provider";
import { DiagnosenRepository } from "../../../src/main/infrastructure/diagnosen_repository";
import { PatientenRepository } from "../../../src/main/infrastructure/patienten_repository";

describe("Diagnosen", () => {
  describe("Liste alle Diagnosen für einen Patienten auf", () => {
    it("Sollte eine leere Liste zurückgeben, wenn es keine Diagnosen gibt", async () => {
      const { handler } = configure();

      const result = await handler.handle(
        DiagnosenQuery.create({ patientennummer: 1 }),
      );

      expect(result).toEqual<DiagnosenQueryResult>(
        DiagnosenQueryResult.create(),
      );
    });

    it("Sollte alle Diagnosen absteigend sortiert nach Datum zurückgeben", async () => {
      const { handler, patientenRepository, diagnosenRepository } = configure();
      patientenRepository.create(Patient.createTestInstance());
      diagnosenRepository.create(
        Diagnose.createTestInstance({ id: 1, datum: "2026-04-13" }),
      );
      diagnosenRepository.create(
        Diagnose.createTestInstance({
          id: 2,
          datum: "2026-04-14",
          beschreibung: "Zweite Testdiagnose",
        }),
      );

      const result = await handler.handle(
        DiagnosenQuery.create({ patientennummer: 1 }),
      );

      expect(result).toEqual<DiagnosenQueryResult>(
        DiagnosenQueryResult.create({
          diagnosen: [
            Diagnose.createTestInstance({
              id: 2,
              datum: "2026-04-14",
              beschreibung: "Zweite Testdiagnose",
            }),
            Diagnose.createTestInstance({ id: 1, datum: "2026-04-13" }),
          ],
        }),
      );
    });

    it("Sollte eine leere Liste zurückgeben, wenn es den Patienten nicht", async () => {
      const { handler, patientenRepository, diagnosenRepository } = configure();
      patientenRepository.create(Patient.createTestInstance());
      diagnosenRepository.create(Diagnose.createTestInstance());
      diagnosenRepository.create(
        Diagnose.createTestInstance({
          id: 2,
          beschreibung: "Zweite Testdiagnose",
        }),
      );

      const result = await handler.handle(
        DiagnosenQuery.create({ patientennummer: 2 }),
      );

      expect(result).toEqual<DiagnosenQueryResult>(
        DiagnosenQueryResult.create(),
      );
    });
  });
});

function configure() {
  const datenbankProvider = DatenbankProvider.create();
  const patientenRepository = PatientenRepository.create({ datenbankProvider });
  const diagnosenRepository = DiagnosenRepository.create({
    datenbankProvider,
  });
  const handler = DiagnosenQueryHandler.create({ diagnosenRepository });
  return { handler, patientenRepository, diagnosenRepository };
}
