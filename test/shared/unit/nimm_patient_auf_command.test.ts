// Copyright (c) 2026 Falko Schumann. All rights reserved. MIT license.

import { Failure, Success } from "@muspellheim/shared";
import { describe, expect, it } from "vitest";

import {
  createNimmPatientAufCommandStatus,
  NimmPatientAufCommand,
  type NimmPatientAufCommandStatus,
} from "../../../src/shared/domain/nimm_patient_auf_command";

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

  it("sollte Success mappen", () => {
    const status = new Success({ nummer: 42 });

    const json = JSON.stringify(status);
    const dto = JSON.parse(json);
    const model = createNimmPatientAufCommandStatus(dto);

    expect(model).toEqual<NimmPatientAufCommandStatus>(
      new Success({ nummer: 42 }),
    );
  });

  it("sollte Failure von Model nach DTO mappen", () => {
    const status = new Failure("Test Fehler");

    const json = JSON.stringify(status);
    const dto = JSON.parse(json);
    const model = createNimmPatientAufCommandStatus(dto);

    expect(model).toEqual<NimmPatientAufCommandStatus>(
      new Failure("Test Fehler"),
    );
  });
});
