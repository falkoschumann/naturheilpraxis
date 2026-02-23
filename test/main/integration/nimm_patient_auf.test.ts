// Copyright (c) 2026 Falko Schumann. All rights reserved. MIT license.

import { Failure, Success } from "@muspellheim/shared";
import { describe, expect, it } from "vitest";

import { NimmPatientAufCommandHandler } from "../../../src/main/application/nimm_patient_auf_command_handler";
import { Patient } from "../../../src/shared/domain/patient";
import {
  NimmPatientAufCommand,
  type NimmPatientAufCommandStatus,
} from "../../../src/shared/domain/nimm_patient_auf_command";
import {
  NimmPatientAufCommandDto,
  NimmPatientAufCommandStatusDto,
} from "../../../src/shared/infrastructure/nimm_patient_auf_command_dto";
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

  describe("Mapping nimm Patient auf Command", () => {
    it("sollte DTO aus Model erstellen", () => {
      const model = NimmPatientAufCommand.createTestInstance();

      const dto = NimmPatientAufCommandDto.fromModel(model);

      expect(dto).toEqual<NimmPatientAufCommandDto>(
        NimmPatientAufCommandDto.createTestInstance(),
      );
    });

    it("sollte Model aus DTO erstellen", () => {
      const dto = NimmPatientAufCommandDto.createTestInstance();

      const model = dto.validate();

      expect(model).toEqual<NimmPatientAufCommand>(
        NimmPatientAufCommand.createTestInstance(),
      );
    });
  });

  describe("Mapping nimm Patient auf Command Status", () => {
    it("sollte DTO aus Success-Model erstellen", () => {
      const model = new Success({ nummer: 42 });

      const dto = NimmPatientAufCommandStatusDto.fromModel(model);

      expect(dto).toEqual<NimmPatientAufCommandStatusDto>(
        NimmPatientAufCommandStatusDto.create({
          isSuccess: true,
          nummer: 42,
        }),
      );
    });

    it("sollte DTO aus Failure-Model erstellen", () => {
      const model = new Failure("Test Fehler");

      const dto = NimmPatientAufCommandStatusDto.fromModel(model);

      expect(dto).toEqual<NimmPatientAufCommandStatusDto>(
        NimmPatientAufCommandStatusDto.create({
          isSuccess: false,
          errorMessage: "Test Fehler",
        }),
      );
    });

    it("sollte Success-Model aus DTO erstellen", () => {
      const dto = NimmPatientAufCommandStatusDto.create({
        isSuccess: true,
        nummer: 42,
      });

      const model = dto.validate();

      expect(model).toEqual<NimmPatientAufCommandStatus>(
        new Success({ nummer: 42 }),
      );
    });

    it("sollte Failure-Model aus DTO erstellen", () => {
      const dto = NimmPatientAufCommandStatusDto.create({
        isSuccess: false,
        errorMessage: "Test Fehler",
      });

      const model = dto.validate();

      expect(model).toEqual<Failure>(new Failure("Test Fehler"));
    });
  });
});

function configure() {
  const databaseProvider = DatabaseProvider.create();
  const patientenRepository = PatientenRepository.create({ databaseProvider });
  const handler = NimmPatientAufCommandHandler.create({ patientenRepository });
  return { handler, patientenRepository };
}
