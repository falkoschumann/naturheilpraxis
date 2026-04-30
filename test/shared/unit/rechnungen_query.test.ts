// Copyright (c) 2026 Falko Schumann. All rights reserved. MIT license.

import { describe, expect, it } from "vitest";

import {
  RechnungenQuery,
  RechnungenQueryResult,
} from "../../../src/shared/domain/rechnungen_query";

describe("Rechnungen Query", () => {
  it("sollte Query mappen", () => {
    const query = RechnungenQuery.createTestInstance();

    const json = JSON.stringify(query);
    const dto = JSON.parse(json);
    const model = RechnungenQuery.create(dto);

    expect(model).toEqual<RechnungenQuery>(
      RechnungenQuery.createTestInstance(),
    );
  });

  it("sollte leeres Result von Model nach DTO mappen", () => {
    const result = RechnungenQueryResult.create();

    const json = JSON.stringify(result);
    const dto = JSON.parse(json);
    const model = RechnungenQueryResult.create(dto);

    expect(model).toEqual<RechnungenQueryResult>(
      RechnungenQueryResult.create(),
    );
  });

  it("sollte Result mappen", () => {
    const result = RechnungenQueryResult.createTestInstance();

    const json = JSON.stringify(result);
    const dto = JSON.parse(json);
    const model = RechnungenQueryResult.create(dto);

    expect(model).toEqual<RechnungenQueryResult>(
      RechnungenQueryResult.createTestInstance(),
    );
  });
});
