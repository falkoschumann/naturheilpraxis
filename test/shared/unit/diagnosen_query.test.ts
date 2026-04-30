// Copyright (c) 2026 Falko Schumann. All rights reserved. MIT license.

import { describe, expect, it } from "vitest";

import {
  DiagnosenQuery,
  DiagnosenQueryResult,
} from "../../../src/shared/domain/diagnosen_query";

describe("Diagnosen Query", () => {
  it("sollte Query mappen", () => {
    const query = DiagnosenQuery.createTestInstance();

    const json = JSON.stringify(query);
    const dto = JSON.parse(json);
    const model = DiagnosenQuery.create(dto);

    expect(model).toEqual<DiagnosenQuery>(DiagnosenQuery.createTestInstance());
  });

  it("sollte leeres Result von Model nach DTO mappen", () => {
    const result = DiagnosenQueryResult.create();

    const json = JSON.stringify(result);
    const dto = JSON.parse(json);
    const model = DiagnosenQueryResult.create(dto);

    expect(model).toEqual<DiagnosenQueryResult>(DiagnosenQueryResult.create());
  });

  it("sollte Result mappen", () => {
    const result = DiagnosenQueryResult.createTestInstance();

    const json = JSON.stringify(result);
    const dto = JSON.parse(json);
    const model = DiagnosenQueryResult.create(dto);

    expect(model).toEqual<DiagnosenQueryResult>(
      DiagnosenQueryResult.createTestInstance(),
    );
  });
});
