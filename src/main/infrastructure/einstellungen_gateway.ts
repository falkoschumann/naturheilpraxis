// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

import fsPromise from "node:fs/promises";
import path from "node:path";

import { ConfigurableResponses, OutputTracker } from "@muspellheim/shared";

import { Einstellungen } from "../../shared/domain/einstellungen";
import { EinstellungenDto } from "../../shared/infrastructure/einstellungen";

const STORED_EVENT = "stored";

export class EinstellungenGateway extends EventTarget {
  static create({
    fileName = "./data/einstellungen.json",
  }: { fileName?: string } = {}): EinstellungenGateway {
    return new EinstellungenGateway(fileName, fsPromise);
  }

  static createNull({
    readFileResponses = [],
  }: {
    readFileResponses?: (EinstellungenDto | null | Error)[];
  } = {}): EinstellungenGateway {
    return new EinstellungenGateway(
      "null-einstellungen.json",
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

  async lade(): Promise<Einstellungen | undefined> {
    try {
      const fileContent = await this.#fs.readFile(this.#fileName, "utf8");
      const json = JSON.parse(fileContent);
      return EinstellungenDto.fromJson(json).validate();
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === "ENOENT") {
        // No such file or directory
        return;
      }

      throw error;
    }
  }

  async sichere(einstellungen: Einstellungen): Promise<void> {
    const dirName = path.dirname(this.#fileName);
    await this.#fs.mkdir(dirName, { recursive: true });

    const json = JSON.stringify(einstellungen, null, 2);
    await this.#fs.writeFile(this.#fileName, json, "utf8");
    this.dispatchEvent(
      new CustomEvent(STORED_EVENT, { detail: einstellungen }),
    );
  }

  trackStored(): OutputTracker<Einstellungen> {
    return OutputTracker.create(this, STORED_EVENT);
  }
}

class FsPromiseStub {
  readonly #readFileResponses: ConfigurableResponses<
    EinstellungenDto | null | Error
  >;

  constructor(readFileResponses: (EinstellungenDto | null | Error)[]) {
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
