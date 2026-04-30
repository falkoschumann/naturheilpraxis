// Copyright (c) 2026 Falko Schumann. All rights reserved. MIT license.

import { describe, expect, it } from "vitest";

import {
  LeistungenQuery,
  LeistungenQueryResult,
} from "../../../src/shared/domain/leistungen_query";

describe("Leistungen Query", () => {
  it("sollte Query mappen", () => {
    const query = LeistungenQuery.createTestInstance();

    const json = JSON.stringify(query);
    const dto = JSON.parse(json);
    const model = LeistungenQuery.create(dto);

    expect(model).toEqual<LeistungenQuery>(
      LeistungenQuery.createTestInstance(),
    );
  });

  it("sollte leeres Result von Model nach DTO mappen", () => {
    const result = LeistungenQueryResult.create();

    const json = JSON.stringify(result);
    const dto = JSON.parse(json);
    const model = LeistungenQueryResult.create(dto);

    expect(model).toEqual<LeistungenQueryResult>(
      LeistungenQueryResult.create(),
    );
  });

  it("sollte Result mappen", () => {
    const result = LeistungenQueryResult.createTestInstance();

    const json = JSON.stringify(result);
    const dto = JSON.parse(json);
    const model = LeistungenQueryResult.create(dto);

    expect(model).toEqual<LeistungenQueryResult>(
      LeistungenQueryResult.createTestInstance(),
    );
  });
});
