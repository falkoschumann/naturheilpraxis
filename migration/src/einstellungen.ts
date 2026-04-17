// Copyright (c) 2026 Falko Schumann. All rights reserved. MIT license.

import { Einstellungen } from "../../src/shared/domain/einstellungen";

export function erstelleEinstellungen({
  agencies,
  titles,
  familyStatus,
  handlings,
}: {
  agencies: string[];
  titles: string[];
  familyStatus: string[];
  handlings: { handling: string; standard?: number }[];
}) {
  const schlüsselworte = handlings.map((handling) => ({
    name: handling.handling,
    istDefault: handling.standard === 1,
  }));
  return Einstellungen.create({
    praxen: agencies,
    anreden: titles,
    familienstände: familyStatus,
    schlüsselworte,
  });
}
