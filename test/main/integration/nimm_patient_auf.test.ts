// Copyright (c) 2026 Falko Schumann. All rights reserved. MIT license.

import { Success } from "@muspellheim/shared";
import { describe, expect, it } from "vitest";

import { NimmPatientAufCommandHandler } from "../../../src/main/application/nimm_patient_auf_command_handler";
import { Patient } from "../../../src/shared/domain/patient";
import { NimmPatientAufCommand } from "../../../src/shared/domain/nimm_patient_auf_command";
import { PatientenRepository } from "../../../src/main/infrastructure/patienten_repository";
import { DatabaseProvider } from "../../../src/main/infrastructure/database_provider";

describe("Nimm Patient auf", () => {
  describe("Erfasse Informationen wie Name, Geburtsdatum, Praxis, Annahmejahr, Anschrift und Kontaktmöglichkeit", () => {
    it("sollte neuen Patienten erfassen", async () => {
      const { handler, patientenRepository } = configure();

      const status = await handler.handle(
        NimmPatientAufCommand.createTestInstance(),
      );

      expect(status).toEqual<Success<{ nummer: number }>>(
        new Success({ nummer: 1 }),
      );
      const patient = patientenRepository.findByNummer(1);
      expect(patient).toEqual(Patient.createTestInstance());
    });

    it("sollte Patientennummer hochzählen", async () => {
      const { handler, patientenRepository } = configure();
      patientenRepository.create(Patient.createTestInstance());

      const status = await handler.handle(
        NimmPatientAufCommand.createTestInstance({
          vorname: "Erika",
          geburtsdatum: "1985-05-05",
        }),
      );

      expect(status).toEqual<Success<{ nummer: number }>>(
        new Success({ nummer: 2 }),
      );
    });
  });
});

function configure() {
  const databaseProvider = DatabaseProvider.create();
  const patientenRepository = PatientenRepository.create({ databaseProvider });
  const handler = NimmPatientAufCommandHandler.create({ patientenRepository });
  return { handler, patientenRepository };
}
