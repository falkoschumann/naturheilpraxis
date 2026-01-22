// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

import fsPromise from "node:fs/promises";
import path from "node:path";

import { ConfigurableResponses, OutputTracker } from "@muspellheim/shared";

import { Settings } from "../../shared/domain/settings";
import { SettingsDto } from "../../shared/infrastructure/settings_dto";

const STORED_EVENT = "stored";

export class SettingsGateway extends EventTarget {
  static create({
    fileName = "./data/settings.json",
  }: { fileName?: string } = {}): SettingsGateway {
    return new SettingsGateway(fileName, fsPromise);
  }

  static createNull({
    readFileResponses = [],
  }: {
    readFileResponses?: (SettingsDto | null | Error)[];
  } = {}): SettingsGateway {
    return new SettingsGateway(
      "null-settings.json",
      new FsPromiseStub(readFileResponses) as unknown as typeof fsPromise,
    );
  }

  #fileName: string;
  readonly #fs: typeof fsPromise;

  constructor(fileName: string, fs: typeof fsPromise) {
    super();
    this.#fileName = fileName;
    this.#fs = fs;
  }

  async load(): Promise<Settings> {
    try {
      const fileContent = await this.#fs.readFile(this.#fileName, "utf8");
      const json = JSON.parse(fileContent);
      return SettingsDto.fromJson(json).validate();
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === "ENOENT") {
        // No such file or directory
        return Settings.create();
      }

      throw error;
    }
  }

  async store(settings: Settings): Promise<void> {
    const dirName = path.dirname(this.#fileName);
    await this.#fs.mkdir(dirName, { recursive: true });

    const json = JSON.stringify(settings, null, 2);
    await this.#fs.writeFile(this.#fileName, json, "utf8");
    this.dispatchEvent(new CustomEvent(STORED_EVENT, { detail: settings }));
  }

  trackStored(): OutputTracker<Settings> {
    return OutputTracker.create(this, STORED_EVENT);
  }
}

class FsPromiseStub {
  readonly #readFileResponses: ConfigurableResponses<
    SettingsDto | null | Error
  >;

  constructor(readFileResponses: (SettingsDto | null | Error)[]) {
    this.#readFileResponses = ConfigurableResponses.create(
      readFileResponses,
      "read file",
    );
  }

  async mkdir() {}

  async readFile() {
    const response = this.#readFileResponses.next();
    if (response === null) {
      throw { code: "ENOENT" };
    }
    if (response instanceof Error) {
      throw response;
    }

    const s = JSON.stringify(response);
    return Promise.resolve(s);
  }

  async writeFile() {}
}
