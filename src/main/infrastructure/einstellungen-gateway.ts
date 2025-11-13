// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

import fsPromise from "node:fs/promises";
import path from "node:path";

import { Einstellungen } from "../../shared/domain/einstellungen";

export class EinstellungenGateway {
  #filePath: string;

  constructor(filePath: string) {
    this.#filePath = filePath;
  }

  async lade(): Promise<Einstellungen> {
    try {
      const json = await fsPromise.readFile(this.#filePath, "utf8");
      return JSON.parse(json) as Einstellungen;
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === "ENOENT") {
        // No such file or directory
        return Einstellungen.createDefault();
      }

      throw error;
    }
  }

  async sichere(einstellungen: Einstellungen): Promise<void> {
    const dirName = path.dirname(this.#filePath);
    await fsPromise.mkdir(dirName, { recursive: true });

    const json = JSON.stringify(einstellungen, null, 2);
    await fsPromise.writeFile(this.#filePath, json, "utf8");
  }
}
