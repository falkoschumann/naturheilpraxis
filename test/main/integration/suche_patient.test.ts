// Copyright (c) 2026 Falko Schumann. All rights reserved. MIT license.

import { describe, expect, it } from "vitest";

import { SuchePatientQueryHandler } from "../../../src/main/application/suche_patient_query_handler";
import { Patient } from "../../../src/shared/domain/patient";
import {
  PatientQuery,
  PatientQueryResult,
} from "../../../src/shared/domain/suche_patient_query";
import {
  PatientQueryDto,
  PatientQueryResultDto,
} from "../../../src/shared/infrastructure/suche_patient_query_dto";
import { DatabaseProvider } from "../../../src/main/infrastructure/database_provider";
import { PatientenRepository } from "../../../src/main/infrastructure/patienten_repository";

describe("Suche Patient", () => {
  describe("Suche Patient mit Nummer", () => {
    it("sollte nichts zurückgeben, wenn der Patient nicht existiert", async () => {
      const { handler, patientenRepository } = configure();
      patientenRepository.create(Patient.createTestInstance());

      const result = await handler.handle(
        PatientQuery.create({ nummer: 9999 }),
      );

      expect(result).toEqual<PatientQueryResult>(PatientQueryResult.create());
    });

    it("sollte Patient finden", async () => {
      const { handler, patientenRepository } = configure();
      patientenRepository.create(
        Patient.createTestInstance({ vorname: "Max" }),
      );
      patientenRepository.create(
        Patient.createTestInstance({ vorname: "Erika" }),
      );

      const result = await handler.handle(PatientQuery.create({ nummer: 2 }));

      expect(result).toEqual<PatientQueryResult>(
        PatientQueryResult.create({
          patient: Patient.createTestInstance({
            nummer: 2,
            vorname: "Erika",
          }),
        }),
      );
    });
  });

  describe("Mapping suche Patient Query", () => {
    it("sollte DTO aus Model erstellen", () => {
      const model = PatientQuery.createTestInstance();

      const dto = PatientQueryDto.fromModel(model);

      expect(dto).toEqual<PatientQueryDto>(
        PatientQueryDto.createTestInstance(),
      );
    });

    it("sollte Model aus DTO erstellen", () => {
      const dto = PatientQueryDto.createTestInstance();

      const model = dto.validate();

      expect(model).toEqual<PatientQuery>(PatientQuery.createTestInstance());
    });
  });

  describe("Mapping suche Patient Query Result", () => {
    it("sollte leeres Result erstellen", () => {
      const dto = PatientQueryResult.create();

      expect(dto).toEqual<PatientQueryResult>(PatientQueryResult.create());
    });

    it("sollte DTO aus Model erstellen", () => {
      const model = PatientQueryResult.createTestInstance();

      const dto = PatientQueryResultDto.fromModel(model);

      expect(dto).toEqual<PatientQueryResultDto>(
        PatientQueryResultDto.createTestInstance(),
      );
    });

    it("sollte Model aus DTO erstellen", () => {
      const dto = PatientQueryResultDto.createTestInstance();

      const model = dto.validate();

      expect(model).toEqual<PatientQueryResult>(
        PatientQueryResult.createTestInstance(),
      );
    });
  });
});

function configure() {
  const databaseProvider = DatabaseProvider.create();
  const patientenRepository = PatientenRepository.create({ databaseProvider });
  const handler = SuchePatientQueryHandler.create({ patientenRepository });
  return { handler, patientenRepository };
}
