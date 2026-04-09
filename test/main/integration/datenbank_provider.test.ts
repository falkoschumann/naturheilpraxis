// Copyright (c) 2026 Falko Schumann. All rights reserved. MIT license.

import fs from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

import { DatenbankProvider } from "../../../src/main/infrastructure/datenbank_provider";

const TEST_DB_PATH = path.resolve(
  import.meta.dirname,
  "../../../testdata/datenbank_provider.test.sqlite",
);

describe("Datenbank Provider", () => {
  it("sollte Datenbank mit aktuellen Schema erstellen", () => {
    fs.rmSync(TEST_DB_PATH, { force: true });
    const provider = DatenbankProvider.create({ datenbankPfad: TEST_DB_PATH });

    const db = provider.get();
    const result = db.prepare("select * from naturheilpraxis").all();

    expect(result).toEqual([{ schema_version: 1 }]);
  });

  it("sollte Datenbank mit Schema Version 1 erstellen", () => {
    const provider = DatenbankProvider.create();

    const db = provider.get();
    const result = db.prepare("select * from naturheilpraxis").all();

    expect(result).toEqual([{ schema_version: 1 }]);
  });
});
