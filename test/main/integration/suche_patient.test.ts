// Copyright (c) 2026 Falko Schumann. All rights reserved. MIT license.

import { describe, expect, it } from "vitest";

import { SuchePatientQueryHandler } from "../../../src/main/application/suche_patient_query_handler";
import { Patient } from "../../../src/shared/domain/patient";
import {
  PatientQuery,
  PatientQueryResult,
} from "../../../src/shared/domain/suche_patient_query";
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
});

function configure() {
  const databaseProvider = DatabaseProvider.create();
  const patientenRepository = PatientenRepository.create({ databaseProvider });
  const handler = SuchePatientQueryHandler.create({ patientenRepository });
  return { handler, patientenRepository };
}
