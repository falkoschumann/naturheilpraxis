// Copyright (c) 2026 Falko Schumann. All rights reserved. MIT license.

import { Failure, Success } from "@muspellheim/shared";
import { describe, expect, it } from "vitest";

import {
  NimmPatientAufCommand,
  type NimmPatientAufCommandStatus,
} from "../../../src/shared/domain/nimm_patient_auf_command";
import {
  NimmPatientAufCommandDto,
  NimmPatientAufCommandStatusDto,
} from "../../../src/shared/infrastructure/nimm_patient_auf_command_dto";

describe("Nimm Patient auf Command DTO", () => {
  it("sollte Command von Model nach DTO mappen", () => {
    const model = NimmPatientAufCommand.createTestInstance();

    const dto = NimmPatientAufCommandDto.fromModel(model);

    expect(dto).toEqual<NimmPatientAufCommandDto>(
      NimmPatientAufCommandDto.createTestInstance(),
    );
  });

  it("sollte Command von DTO nach Model mappen", () => {
    const dto = NimmPatientAufCommandDto.createTestInstance();

    const model = dto.validate();

    expect(model).toEqual<NimmPatientAufCommand>(
      NimmPatientAufCommand.createTestInstance(),
    );
  });

  it("sollte Success von Model nach DTO mappen", () => {
    const model = new Success({ nummer: 42 });

    const dto = NimmPatientAufCommandStatusDto.fromModel(model);

    expect(dto).toEqual<NimmPatientAufCommandStatusDto>(
      NimmPatientAufCommandStatusDto.create({
        isSuccess: true,
        nummer: 42,
      }),
    );
  });

  it("sollte Success von DTO nach Model mappen", () => {
    const dto = NimmPatientAufCommandStatusDto.create({
      isSuccess: true,
      nummer: 42,
    });

    const model = dto.validate();

    expect(model).toEqual<NimmPatientAufCommandStatus>(
      new Success({ nummer: 42 }),
    );
  });

  it("sollte Failure von Model nach DTO mappen", () => {
    const model = new Failure("Test Fehler");

    const dto = NimmPatientAufCommandStatusDto.fromModel(model);

    expect(dto).toEqual<NimmPatientAufCommandStatusDto>(
      NimmPatientAufCommandStatusDto.create({
        isSuccess: false,
        errorMessage: "Test Fehler",
      }),
    );
  });

  it("sollte Failure von DTO nach Model mappen", () => {
    const dto = NimmPatientAufCommandStatusDto.create({
      isSuccess: false,
      errorMessage: "Test Fehler",
    });

    const model = dto.validate();

    expect(model).toEqual<Failure>(new Failure("Test Fehler"));
  });
});
