// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

import { Einstellungen } from "../../src/shared/domain/einstellungen";

export function createSettings(configuration: {
  agencies: string[];
  titles: string[];
  familyStatus: string[];
  handling: string[];
  standardHandling: string[];
}) {
  return Einstellungen.create({
    praxen: configuration.agencies,
    anreden: configuration.titles,
    familienstaende: configuration.familyStatus,
    schluesselworte: configuration.handling,
    standardSchluesselworte: configuration.standardHandling,
  });
}
