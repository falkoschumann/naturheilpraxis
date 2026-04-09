// Copyright (c) 2026 Falko Schumann. All rights reserved. MIT license.

import { describe, expect, it } from "vitest";

import {
  PatientQuery,
  PatientQueryResult,
} from "../../../src/shared/domain/patient_query";

describe("Suche Patient Query", () => {
  it("sollte Query mappen", () => {
    const query = PatientQuery.createTestInstance();

    const json = JSON.stringify(query);
    const dto = JSON.parse(json);
    const model = PatientQuery.create(dto);

    expect(model).toEqual<PatientQuery>(PatientQuery.createTestInstance());
  });

  it("sollte leeres Result mappen", () => {
    const result = PatientQueryResult.create();

    const json = JSON.stringify(result);
    const dto = JSON.parse(json);
    const model = PatientQueryResult.create(dto);

    expect(model).toEqual<PatientQueryResult>(PatientQueryResult.create());
  });

  it("sollte Result mappen", () => {
    const result = PatientQueryResult.createTestInstance();

    const json = JSON.stringify(result);
    const dto = JSON.parse(json);
    const model = PatientQueryResult.create(dto);

    expect(model).toEqual<PatientQueryResult>(
      PatientQueryResult.createTestInstance(),
    );
  });
});
