// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

import { describe, expect, it } from "vitest";

import { Einstellungen } from "../../../src/shared/domain/einstellungen";
import { EinstellungenDto } from "../../../src/shared/infrastructure/einstellungen_dto";

describe("Einstellungen DTO", () => {
  it("sollte Default-Einstellungen von Model nach DTO mappen", () => {
    const dto = EinstellungenDto.fromModel(Einstellungen.create());

    expect(dto).toEqual<EinstellungenDto>(
      EinstellungenDto.create({
        praxen: ["Naturheilpraxis"],
        anreden: ["Herr", "Frau"],
        familienstaende: [
          "ledig",
          "verheiratet",
          "getrennt",
          "geschieden",
          "verwitwet",
        ],
        schluesselworte: [],
        standardSchluesselworte: [],
      }),
    );
  });

  it("sollte Einstellungen von Model nach DTO mappen", () => {
    const dto = EinstellungenDto.fromModel(Einstellungen.createTestInstance());

    expect(dto).toEqual<EinstellungenDto>(
      EinstellungenDto.createTestInstance(),
    );
  });

  it("sollte leere Einstellungen von DTO nach Model mappen", () => {
    const dto = EinstellungenDto.create();

    const result = dto.validate();

    expect(result).toEqual<Einstellungen>(
      Einstellungen.create({
        praxen: [],
        anreden: [],
        familienstaende: [],
        schluesselworte: [],
        standardSchluesselworte: [],
      }),
    );
  });

  it("sollte Einstellungen von DTO nach Model mappen", () => {
    const dto = EinstellungenDto.createTestInstance();

    const result = dto.validate();

    expect(result).toEqual<Einstellungen>(Einstellungen.createTestInstance());
  });
});
