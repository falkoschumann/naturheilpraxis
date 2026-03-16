// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

import { describe, expect, it } from "vitest";

import { Einstellungen } from "../../../src/shared/domain/einstellungen";

describe("Einstellungen", () => {
  it("sollte Einstellungen mappen", () => {
    const einstellungen = Einstellungen.createTestInstance();

    const json = JSON.stringify(einstellungen);
    const dto = JSON.parse(json);
    const result = Einstellungen.create(dto);

    expect(result).toEqual<Einstellungen>(Einstellungen.createTestInstance());
  });

  it("sollte Default-Einstellungen mappen", () => {
    const einstellungen = Einstellungen.createDefault();

    const json = JSON.stringify(einstellungen);
    const dto = JSON.parse(json);
    const result = Einstellungen.create(dto);

    expect(result).toEqual<Einstellungen>(Einstellungen.createDefault());
  });
});
