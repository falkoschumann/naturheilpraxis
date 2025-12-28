// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

import { describe, expect, it } from "vitest";

import { Failure } from "@muspellheim/shared";

import {
  NimmPatientAufCommand,
  NimmPatientAufSuccess,
  PatientenkarteiQuery,
  PatientenkarteiQueryResult,
} from "../../../src/shared/domain/naturheilpraxis";
import {
  NimmPatientAufCommandDto,
  NimmPatientAufCommandStatusDto,
  PatientenkarteiQueryDto,
  PatientenkarteiQueryResultDto,
} from "../../../src/shared/infrastructure/naturheilpraxis";

describe("Naturheilpraxis", () => {
  describe("Nimm Patient auf Command", () => {
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

  describe("NimmPatientAufCommandStatus", () => {
    it("sollte DTO aus Success-Model erstellen", () => {
      const model = NimmPatientAufSuccess.create({ nummer: 42 });

      const dto = NimmPatientAufCommandStatusDto.fromModel(model);

      expect(dto).toEqual<NimmPatientAufCommandStatusDto>(
        NimmPatientAufCommandStatusDto.create({ isSuccess: true, nummer: 42 }),
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

      expect(model).toEqual<NimmPatientAufSuccess>(
        NimmPatientAufSuccess.create({ nummer: 42 }),
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

  describe("Patientenkartei Query", () => {
    it("sollte DTO aus Model erstellen", () => {
      const model = PatientenkarteiQuery.createTestInstance();

      const dto = PatientenkarteiQueryDto.fromModel(model);

      expect(dto).toEqual<PatientenkarteiQueryDto>(
        PatientenkarteiQueryDto.createTestInstance(),
      );
    });

    it("sollte Model aus DTO erstellen", () => {
      const dto = PatientenkarteiQueryDto.createTestInstance();

      const model = dto.validate();

      expect(model).toEqual<PatientenkarteiQuery>(
        PatientenkarteiQuery.createTestInstance(),
      );
    });
  });

  describe("Patientenkartei Query Result", () => {
    it("sollte leeres Result erstellen", () => {
      const dto = PatientenkarteiQueryResult.createEmpty();

      expect(dto).toEqual<PatientenkarteiQueryResult>(
        PatientenkarteiQueryResult.create({ patienten: [] }),
      );
    });

    it("sollte DTO aus Model erstellen", () => {
      const model = PatientenkarteiQueryResult.createTestInstance();

      const dto = PatientenkarteiQueryResultDto.fromModel(model);

      expect(dto).toEqual<PatientenkarteiQueryResultDto>(
        PatientenkarteiQueryResultDto.createTestInstance(),
      );
    });

    it("sollte Model aus DTO erstellen", () => {
      const dto = PatientenkarteiQueryResultDto.createTestInstance();

      const model = dto.validate();

      expect(model).toEqual<PatientenkarteiQueryResult>(
        PatientenkarteiQueryResult.createTestInstance(),
      );
    });
  });
});
