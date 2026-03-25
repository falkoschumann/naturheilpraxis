// Copyright (c) 2026 Falko Schumann. All rights reserved. MIT license.

import { Einstellungen } from "../../src/shared/domain/einstellungen";

export function erstelleEinstellungen({
  agencies,
  titles,
  familyStatus,
  handling,
  standardHandling,
}: {
  agencies: string[];
  titles: string[];
  familyStatus: string[];
  handling: string[];
  standardHandling: string[];
}) {
  return Einstellungen.create({
    praxen: agencies,
    anreden: titles,
    familienstaende: familyStatus,
    schluesselworte: handling,
    standardSchluesselworte: standardHandling,
  });
}
