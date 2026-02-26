// Copyright (c) 2026 Falko Schumann. All rights reserved. MIT license.

import { describe, expect, it } from "vitest";

import {
  PatientQuery,
  PatientQueryResult,
} from "../../../src/shared/domain/suche_patient_query";
import {
  PatientQueryDto,
  PatientQueryResultDto,
} from "../../../src/shared/infrastructure/suche_patient_query_dto";

describe("Suche Patient Query DTO", () => {
  it("sollte Query von Model nach DTO mappen", () => {
    const model = PatientQuery.createTestInstance();

    const dto = PatientQueryDto.fromModel(model);

    expect(dto).toEqual<PatientQueryDto>(PatientQueryDto.createTestInstance());
  });

  it("sollte Query von DTO nach Model mappen", () => {
    const dto = PatientQueryDto.createTestInstance();

    const model = dto.validate();

    expect(model).toEqual<PatientQuery>(PatientQuery.createTestInstance());
  });

  it("sollte leeres Result von Model nach DTO mappen", () => {
    const model = PatientQueryResult.create();

    const dto = PatientQueryResultDto.fromModel(model);

    expect(dto).toEqual<PatientQueryResultDto>(PatientQueryResultDto.create());
  });

  it("sollte leeres Result von DTO nach Model mappen", () => {
    const dto = PatientQueryResultDto.create();

    const model = dto.validate();

    expect(model).toEqual<PatientQueryResult>(PatientQueryResult.create());
  });

  it("sollte Result von Model nach DTO mappen", () => {
    const model = PatientQueryResult.createTestInstance();

    const dto = PatientQueryResultDto.fromModel(model);

    expect(dto).toEqual<PatientQueryResultDto>(
      PatientQueryResultDto.createTestInstance(),
    );
  });

  it("sollte Result von DTO nach Model mappen", () => {
    const dto = PatientQueryResultDto.createTestInstance();

    const model = dto.validate();

    expect(model).toEqual<PatientQueryResult>(
      PatientQueryResult.createTestInstance(),
    );
  });
});
