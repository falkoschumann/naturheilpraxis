// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

import { describe, expect, it } from "vitest";

import { EinstellungenDto } from "../../../src/shared/infrastructure/einstellungen";

describe("Einstellungen", () => {
  describe("Validate", () => {
    it("sollte einen Typfehler werfen, wenn ein DTO nicht gültig ist", () => {
      const dto = {
        praxis: [],
        anrede: [],
        familienstand: 1,
        schluesselworte: [],
        standardSchluesselworte: [],
      };

      expect(() => EinstellungenDto.fromJson(dto)).toThrow(TypeError);
    });
  });
});
