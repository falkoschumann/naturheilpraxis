// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

import { describe, expect, it } from "vitest";
import {
  PatientDto,
  PatientenkarteiQueryResultDto,
} from "../../../src/shared/infrastructure/naturheilpraxis";
import {
  Patient,
  PatientenkarteiQueryResult,
} from "../../../src/shared/domain/naturheilpraxis";

describe("Naturheilpraxis", () => {
  it("should map dto to model", () => {
    const dto = PatientenkarteiQueryResultDto.create({
      patienten: [
        PatientDto.create({
          nummer: 1,
          nachname: "Mustermann",
          vorname: "Max",
          geburtsdatum: "1990-01-01",
          annahmejahr: 2020,
          praxis: "Musterpraxis",
        }),
      ],
    });

    const model = dto.validate();

    expect(model).toEqual(
      PatientenkarteiQueryResult.create({
        patienten: [
          Patient.create({
            nummer: 1,
            nachname: "Mustermann",
            vorname: "Max",
            geburtsdatum: "1990-01-01",
            annahmejahr: 2020,
            praxis: "Musterpraxis",
          }),
        ],
      }),
    );
  });
});
