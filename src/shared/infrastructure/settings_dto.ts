// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

import Ajv from "ajv";

import { Settings } from "../domain/settings";

const ajv = new Ajv();

const SETTINGS_SCHEMA = {
  type: "object",
  properties: {
    praxis: { type: "array", items: { type: "string" } },
    anrede: { type: "array", items: { type: "string" } },
    familienstand: { type: "array", items: { type: "string" } },
    schluesselworte: { type: "array", items: { type: "string" } },
    standardSchluesselworte: { type: "array", items: { type: "string" } },
  },
  additionalProperties: false,
};

export class SettingsDto {
  static create({
    praxis = [],
    anrede = [],
    familienstand = [],
    schluesselworte = [],
    standardSchluesselworte = [],
  }: {
    praxis?: string[];
    anrede?: string[];
    familienstand?: string[];
    schluesselworte?: string[];
    standardSchluesselworte?: string[];
  }): SettingsDto {
    return new SettingsDto(
      praxis,
      anrede,
      familienstand,
      schluesselworte,
      standardSchluesselworte,
    );
  }

  static createTestInstance({
    praxis = ["Praxis 1", "Praxis 2"],
    anrede = ["Herr", "Frau", "Fräulein"],
    familienstand = ["ledig", "verheiratet", "geschieden", "verwitwet"],
    schluesselworte = ["Aktiv", "Weihnachtskarte", "Geburtstagskarte"],
    standardSchluesselworte = ["Aktiv", "Weihnachtskarte"],
  }: Partial<Settings> = {}): SettingsDto {
    return SettingsDto.create({
      praxis,
      anrede,
      familienstand,
      schluesselworte,
      standardSchluesselworte,
    });
  }

  static fromModel(settings: Settings): SettingsDto {
    return SettingsDto.create(settings);
  }

  static fromJson(json: unknown): SettingsDto {
    const valid = ajv.validate(SETTINGS_SCHEMA, json);
    if (valid) {
      return SettingsDto.create(json as SettingsDto);
    }

    throw new TypeError("Invalid settings file.", {
      cause: ajv.errors,
    });
  }

  readonly praxis: string[];
  readonly anrede: string[];
  readonly familienstand: string[];
  readonly schluesselworte: string[];
  readonly standardSchluesselworte: string[];

  constructor(
    praxis: string[],
    anrede: string[],
    familienstand: string[],
    schluesselworte: string[],
    standardSchluesselworte: string[],
  ) {
    this.praxis = praxis;
    this.anrede = anrede;
    this.familienstand = familienstand;
    this.schluesselworte = schluesselworte;
    this.standardSchluesselworte = standardSchluesselworte;
  }

  validate(): Settings {
    return Settings.create(this);
  }
}
