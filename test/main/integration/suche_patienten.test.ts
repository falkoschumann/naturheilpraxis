// Copyright (c) 2026 Falko Schumann. All rights reserved. MIT license.

import { describe, expect, it } from "vitest";

import { SuchePatientenQueryHandler } from "../../../src/main/application/suche_patienten_query_handler";
import { Patient } from "../../../src/shared/domain/patient";
import {
  PatientenQuery,
  PatientenQueryResult,
} from "../../../src/shared/domain/suche_patienten_query";
import {
  PatientenQueryDto,
  PatientenQueryResultDto,
} from "../../../src/shared/infrastructure/suche_patienten_query_dto";
import { DatabaseProvider } from "../../../src/main/infrastructure/database_provider";
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

  describe("Mapping suche Patienten Query", () => {
    it("sollte DTO aus Model erstellen", () => {
      const model = PatientenQuery.createTestInstance();

      const dto = PatientenQueryDto.fromModel(model);

      expect(dto).toEqual<PatientenQueryDto>(
        PatientenQueryDto.createTestInstance(),
      );
    });

    it("sollte Model aus DTO erstellen", () => {
      const dto = PatientenQueryDto.createTestInstance();

      const model = dto.validate();

      expect(model).toEqual<PatientenQuery>(
        PatientenQuery.createTestInstance(),
      );
    });
  });

  describe("Mapping suche Patienten Query Result", () => {
    it("sollte leeres Result erstellen", () => {
      const dto = PatientenQueryResult.create();

      expect(dto).toEqual<PatientenQueryResult>(
        PatientenQueryResult.create({ patienten: [] }),
      );
    });

    it("sollte DTO aus Model erstellen", () => {
      const model = PatientenQueryResult.createTestInstance();

      const dto = PatientenQueryResultDto.fromModel(model);

      expect(dto).toEqual<PatientenQueryResultDto>(
        PatientenQueryResultDto.createTestInstance(),
      );
    });

    it("sollte Model aus DTO erstellen", () => {
      const dto = PatientenQueryResultDto.createTestInstance();

      const model = dto.validate();

      expect(model).toEqual<PatientenQueryResult>(
        PatientenQueryResult.createTestInstance(),
      );
    });
  });
});

function configure() {
  const databaseProvider = DatabaseProvider.create();
  const patientenRepository = PatientenRepository.create({ databaseProvider });
  const handler = SuchePatientenQueryHandler.create({ patientenRepository });
  return { handler, patientenRepository };
}
