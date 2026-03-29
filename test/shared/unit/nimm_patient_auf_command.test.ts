// Copyright (c) 2026 Falko Schumann. All rights reserved. MIT license.

import { describe, expect, it } from "vitest";

import { NimmPatientAufCommand } from "../../../src/shared/domain/nimm_patient_auf_command";

describe("Nimm Patient auf Command", () => {
  it("sollte Command mappen", () => {
    const command = NimmPatientAufCommand.createTestInstance();

    const json = JSON.stringify(command);
    const dto = JSON.parse(json);
    const model = NimmPatientAufCommand.create(dto);

    expect(model).toEqual<NimmPatientAufCommand>(
      NimmPatientAufCommand.createTestInstance(),
    );
  });
});
