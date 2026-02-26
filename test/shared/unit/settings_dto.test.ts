// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

import { describe, expect, it } from "vitest";

import { Settings } from "../../../src/shared/domain/settings";
import { SettingsDto } from "../../../src/shared/infrastructure/settings_dto";

describe("Settings DTO", () => {
  it("sollte Default-Settings von Model nach DTO mappen", () => {
    const dto = SettingsDto.fromModel(Settings.create());

    expect(dto).toEqual<SettingsDto>(
      SettingsDto.create({
        praxis: ["Naturheilpraxis"],
        anrede: ["Herr", "Frau"],
        familienstand: [
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

  it("sollte Settings von Model nach DTO mappen", () => {
    const dto = SettingsDto.fromModel(Settings.createTestInstance());

    expect(dto).toEqual<SettingsDto>(SettingsDto.createTestInstance());
  });

  it("sollte leere Settings von DTO nach Model mappen", () => {
    const dto = SettingsDto.create();

    const result = dto.validate();

    expect(result).toEqual<Settings>(
      Settings.create({
        praxis: [],
        anrede: [],
        familienstand: [],
        schluesselworte: [],
        standardSchluesselworte: [],
      }),
    );
  });

  it("sollte Settings von DTO nach Model mappen", () => {
    const dto = SettingsDto.createTestInstance();

    const result = dto.validate();

    expect(result).toEqual<Settings>(Settings.createTestInstance());
  });
});
