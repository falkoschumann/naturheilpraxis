// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

import { SettingsDto } from "../../src/shared/infrastructure/settings_dto";

export function createSettings(configuration: {
  agencies: string[];
  titles: string[];
  familyStatus: string[];
  handling: string[];
  standardHandling: string[];
}) {
  const settings = SettingsDto.create({
    praxis: configuration.agencies,
    anrede: configuration.titles,
    familienstand: configuration.familyStatus,
    schluesselworte: configuration.handling,
    standardSchluesselworte: configuration.standardHandling,
  });
  return SettingsDto.fromJson(settings).validate();
}
