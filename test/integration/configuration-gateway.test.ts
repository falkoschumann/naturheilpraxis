// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

import { describe, expect, it } from "vitest";

import {
  ConfigurationGateway,
  DEFAULT_CONFIGURATION,
} from "../../src/main/infrastructure/configuration-gateway";
import path from "node:path";

const TEST_FILE = path.resolve(
  __dirname,
  "../../testdata/configuration.test.json",
);
const NON_EXISTING_FILE = path.resolve(
  __dirname,
  "../data/configuration.non-existent.json",
);
const EXAMPLE_FILE = path.resolve(
  __dirname,
  "../data/configuration.example.json",
);
const CORRUPTED_FILE = path.resolve(
  __dirname,
  "../data/configuration.corrupt.json",
);

describe("Configuration gateway", () => {
  it("Store and loads configuration", async () => {
    const gateway = new ConfigurationGateway(TEST_FILE);
    const configuration = {
      praxis: ["Testpraxis"],
      anrede: ["Herr", "Frau"],
      familienstand: ["ledig", "verheiratet"],
      schluesselworte: ["Test", "Beispiel"],
      defaultSchluesselworte: ["Test"],
    };

    await gateway.store(configuration);
    const result = await gateway.load();

    expect(result).toEqual(configuration);
  });

  it("Loads default configuration if file does not exist", async () => {
    const gateway = new ConfigurationGateway(NON_EXISTING_FILE);

    const configuration = await gateway.load();

    expect(configuration).toEqual(DEFAULT_CONFIGURATION);
  });

  it("Loads example configuration from file", async () => {
    const gateway = new ConfigurationGateway(EXAMPLE_FILE);

    const configuration = await gateway.load();

    expect(configuration).toEqual(DEFAULT_CONFIGURATION);
  });

  it("Throws error if file is corrupted", async () => {
    const gateway = new ConfigurationGateway(CORRUPTED_FILE);

    const result = gateway.load();

    await expect(result).rejects.toThrow(SyntaxError);
  });
});
