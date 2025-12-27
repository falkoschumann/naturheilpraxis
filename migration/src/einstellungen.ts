// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

import { EinstellungenDto } from "../../src/shared/infrastructure/einstellungen";

export function createEinstellungen(configuration: {
  agencies: string[];
  titles: string[];
  familyStatus: string[];
  handling: string[];
  standardHandling: string[];
}): EinstellungenDto {
  const einstellungen = EinstellungenDto.create({
    praxis: configuration.agencies,
    anrede: configuration.titles,
    familienstand: configuration.familyStatus,
    schluesselworte: configuration.handling,
    standardSchluesselworte: configuration.standardHandling,
  });
  return EinstellungenDto.fromJson(einstellungen);
}
