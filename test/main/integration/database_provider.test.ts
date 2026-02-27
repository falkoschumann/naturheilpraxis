// Copyright (c) 2026 Falko Schumann. All rights reserved. MIT license.

import fs from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

import { DatabaseProvider } from "../../../src/main/infrastructure/database_provider";

const TEST_DB_PATH = path.resolve(
  import.meta.dirname,
  "../../../testdata/database_provider.test.sqlite",
);

describe("Database provider", () => {
  it("should create file with current schema", () => {
    fs.rmSync(TEST_DB_PATH, { force: true });
    const provider = DatabaseProvider.create({ databasePath: TEST_DB_PATH });

    const db = provider.getDatabase();
    const result = db.prepare("select * from naturheilpraxis").all();

    expect(result).toEqual([{ schema_version: 1 }]);
  });

  it("should create schema version 1", () => {
    const provider = DatabaseProvider.create();

    const db = provider.getDatabase();
    const result = db.prepare("select * from naturheilpraxis").all();

    expect(result).toEqual([{ schema_version: 1 }]);
  });
});
