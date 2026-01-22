// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

import { describe, expect, it } from "vitest";

import { SettingsDto } from "../../../src/shared/infrastructure/settings_dto";
import { Settings } from "../../../src/shared/domain/settings";

describe("Settings", () => {
  it("should map from model to DTO", () => {
    const dto = SettingsDto.fromModel(Settings.createTestInstance());

    expect(dto).toEqual<SettingsDto>(SettingsDto.createTestInstance());
  });

  it("should create DTO from JSON", () => {
    const dto = {
      praxis: ["Praxis A", "Praxis B"],
      anrede: ["Herr", "Frau"],
    };

    const result = SettingsDto.fromJson(dto);

    expect(result).toEqual<SettingsDto>(
      SettingsDto.create({
        praxis: ["Praxis A", "Praxis B"],
        anrede: ["Herr", "Frau"],
        familienstand: [],
        schluesselworte: [],
        standardSchluesselworte: [],
      }),
    );
  });

  it("should throw a type error when the JSON is not valid", () => {
    const dto = {
      praxis: [],
      anrede: [],
      familienstand: 1,
      schluesselworte: [],
      standardSchluesselworte: [],
    };

    const action = () => SettingsDto.fromJson(dto);

    expect(action).toThrow(TypeError);
  });

  it("should map from DTO to model", () => {
    const dto = SettingsDto.createTestInstance();

    const model = dto.validate();

    expect(model).toEqual<Settings>(Settings.createTestInstance());
  });
});
