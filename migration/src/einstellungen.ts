// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

import { EinstellungenDto } from "../../src/shared/infrastructure/einstellungen";

export function createEinstellungen(
  agencies: string[],
  titles: string[],
  familyStatus: string[],
  handling: string[],
  standardHandling: string[],
): EinstellungenDto {
  const einstellungen = EinstellungenDto.create({
    praxis: agencies,
    anrede: titles,
    familienstand: familyStatus,
    schluesselworte: handling,
    standardSchluesselworte: standardHandling,
  });
  return EinstellungenDto.fromJson(einstellungen);
}
