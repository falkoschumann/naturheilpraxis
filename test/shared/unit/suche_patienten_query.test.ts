// Copyright (c) 2026 Falko Schumann. All rights reserved. MIT license.

import { describe, expect, it } from "vitest";

import {
  PatientenQuery,
  PatientenQueryResult,
} from "../../../src/shared/domain/patienten_query";

describe("Suche Patienten Query", () => {
  it("sollte Query mappen", () => {
    const query = PatientenQuery.createTestInstance();

    const json = JSON.stringify(query);
    const dto = JSON.parse(json);
    const model = PatientenQuery.create(dto);

    expect(model).toEqual<PatientenQuery>(PatientenQuery.createTestInstance());
  });

  it("sollte leeres Result von Model nach DTO mappen", () => {
    const result = PatientenQueryResult.create();

    const json = JSON.stringify(result);
    const dto = JSON.parse(json);
    const model = PatientenQueryResult.create(dto);

    expect(model).toEqual<PatientenQueryResult>(PatientenQueryResult.create());
  });

  it("sollte Result mappen", () => {
    const result = PatientenQueryResult.createTestInstance();

    const json = JSON.stringify(result);
    const dto = JSON.parse(json);
    const model = PatientenQueryResult.create(dto);

    expect(model).toEqual<PatientenQueryResult>(
      PatientenQueryResult.createTestInstance(),
    );
  });
});
