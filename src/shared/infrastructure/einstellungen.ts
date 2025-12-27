// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

import Ajv from "ajv";

import { Einstellungen } from "../domain/einstellungen";

const ajv = new Ajv();

const EINSTELLUNGEN_SCHEMA = {
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

export class EinstellungenDto {
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
  }): EinstellungenDto {
    return new EinstellungenDto(
      praxis,
      anrede,
      familienstand,
      schluesselworte,
      standardSchluesselworte,
    );
  }

  static fromModel(einstellungen: Einstellungen): EinstellungenDto {
    return EinstellungenDto.create(einstellungen);
  }

  static fromJson(json: unknown): EinstellungenDto {
    const valid = ajv.validate(EINSTELLUNGEN_SCHEMA, json);
    if (valid) {
      return EinstellungenDto.create(json as EinstellungenDto);
    }

    throw new TypeError("Ungültige Einstellungen-Daten.", {
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

  validate(): Einstellungen {
    return Einstellungen.create(this);
  }
}
