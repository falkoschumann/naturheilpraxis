// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

import { describe, expect, it } from "vitest";

import { EinstellungenDto } from "../../../src/shared/infrastructure/einstellungen";

describe("Einstellungen", () => {
  describe("Validate", () => {
    it("sollte keinen Typfehler werfen, wenn Attribute fehlen", () => {
      const dto = {
        praxis: [],
      };

      const result = EinstellungenDto.fromJson(dto);

      expect(result).toEqual(
        EinstellungenDto.create({
          praxis: [],
          anrede: [],
          familienstand: [],
          schluesselworte: [],
          standardSchluesselworte: [],
        }),
      );
    });

    it("sollte einen Typfehler werfen, wenn ein DTO nicht gültig ist", () => {
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
  });
});
