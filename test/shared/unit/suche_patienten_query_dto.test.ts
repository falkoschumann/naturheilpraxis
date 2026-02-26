// Copyright (c) 2026 Falko Schumann. All rights reserved. MIT license.

import { describe, expect, it } from "vitest";

import {
  PatientenQuery,
  PatientenQueryResult,
} from "../../../src/shared/domain/suche_patienten_query";
import {
  PatientenQueryDto,
  PatientenQueryResultDto,
} from "../../../src/shared/infrastructure/suche_patienten_query_dto";

describe("Suche Patienten Query DTO", () => {
  it("sollte Query von Model nach DTO mappen", () => {
    const model = PatientenQuery.createTestInstance();

    const dto = PatientenQueryDto.fromModel(model);

    expect(dto).toEqual<PatientenQueryDto>(
      PatientenQueryDto.createTestInstance(),
    );
  });

  it("sollte Query von DTO nach Model mappen", () => {
    const dto = PatientenQueryDto.createTestInstance();

    const model = dto.validate();

    expect(model).toEqual<PatientenQuery>(PatientenQuery.createTestInstance());
  });

  it("sollte leeres Result von Model nach DTO mappen", () => {
    const model = PatientenQueryResult.create();

    const dto = PatientenQueryResultDto.fromModel(model);

    expect(dto).toEqual<PatientenQueryResultDto>(
      PatientenQueryResultDto.create(),
    );
  });

  it("sollte leeres Result von DTO nach Model mappen", () => {
    const dto = PatientenQueryResultDto.create();

    const model = dto.validate();

    expect(model).toEqual<PatientenQueryResult>(PatientenQueryResult.create());
  });

  it("sollte Result von Model nach DTO mappen", () => {
    const model = PatientenQueryResult.createTestInstance();

    const dto = PatientenQueryResultDto.fromModel(model);

    expect(dto).toEqual<PatientenQueryResultDto>(
      PatientenQueryResultDto.createTestInstance(),
    );
  });

  it("sollte Result von DTO nach Model mappen", () => {
    const dto = PatientenQueryResultDto.createTestInstance();

    const model = dto.validate();

    expect(model).toEqual<PatientenQueryResult>(
      PatientenQueryResult.createTestInstance(),
    );
  });
});
