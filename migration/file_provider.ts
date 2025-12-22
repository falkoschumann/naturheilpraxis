// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

import * as fs from "node:fs";
import * as path from "node:path";

export class FileProvider {
  #filename: string;

  constructor(filename: string) {
    this.#filename = filename;
  }

  writeJson(data: unknown) {
    const dir = path.dirname(this.#filename);
    fs.mkdirSync(dir, { recursive: true });
    const json = JSON.stringify(data, null, 2);
    fs.writeFileSync(this.#filename, json, { encoding: "utf8" });
  }
}
