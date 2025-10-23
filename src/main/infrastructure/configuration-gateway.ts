// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

import fsPromise from "node:fs/promises";
import path from "node:path";

import type { Configuration } from "../../shared/domain/configuration";

export const DEFAULT_CONFIGURATION: Configuration = Object.freeze({
  praxis: ["Naturheilpraxis"],
  anrede: ["Frau", "Fräulein", "Herr"],
  familienstand: [
    "geschieden",
    "getrennt",
    "ledig",
    "verheiratet",
    "verwitwet",
  ],
  schluesselworte: [
    "Aktiv",
    "Exitus",
    "Geburtstagskarte",
    "Kind",
    "Unbekannt verzogen",
    "Weihnachtskarte",
  ],
  defaultSchluesselworte: ["Aktiv", "Weihnachtskarte"],
});

export class ConfigurationGateway {
  #filePath: string;

  constructor(filePath: string) {
    this.#filePath = filePath;
  }

  async load(): Promise<Configuration> {
    try {
      const json = await fsPromise.readFile(this.#filePath, "utf8");
      return JSON.parse(json) as Configuration;
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === "ENOENT") {
        // No such file or directory, return default configuration
        return DEFAULT_CONFIGURATION;
      }

      throw error;
    }
  }

  async store(configuration: Configuration): Promise<void> {
    const dirName = path.dirname(this.#filePath);
    await fsPromise.mkdir(dirName, { recursive: true });

    const json = JSON.stringify(configuration, null, 2);
    await fsPromise.writeFile(this.#filePath, json, "utf8");
  }
}
