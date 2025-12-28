// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

import { describe, expect, it } from "vitest";

import { EinstellungenDto } from "../../../src/shared/infrastructure/einstellungen";
import { Einstellungen } from "../../../src/shared/domain/einstellungen";

describe("Einstellungen", () => {
  it("sollte DTO aus Model erstellen", () => {
    const dto = EinstellungenDto.fromModel(Einstellungen.createTestInstance());

    expect(dto).toEqual<EinstellungenDto>(
      EinstellungenDto.createTestInstance(),
    );
  });

  it("sollte DTO aus JSON erstellen", () => {
    const dto = {
      praxis: [],
    };

    const result = EinstellungenDto.fromJson(dto);

    expect(result).toEqual<EinstellungenDto>(
      EinstellungenDto.create({
        praxis: [],
        anrede: [],
        familienstand: [],
        schluesselworte: [],
        standardSchluesselworte: [],
      }),
    );
  });

  it("sollte einen Typfehler werfen, wenn JSON nicht gültig ist", () => {
    const dto = {
      praxis: [],
      anrede: [],
      familienstand: 1,
      schluesselworte: [],
      standardSchluesselworte: [],
    };

    const action = () => EinstellungenDto.fromJson(dto);

    expect(action).toThrow(TypeError);
  });

  it("sollte Model aus DTO erstellen", () => {
    const dto = EinstellungenDto.createTestInstance();

    const model = dto.validate();

    expect(model).toEqual<Einstellungen>(Einstellungen.createTestInstance());
  });
});
