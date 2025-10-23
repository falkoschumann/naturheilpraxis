// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

export interface Configuration {
  praxis: string[];
  anrede: string[];
  familienstand: string[];
  schluesselworte: string[];
  defaultSchluesselworte: string[];
}

export function createTestConfiguration({
  praxis = ["Praxis 1", "Praxis 2"],
  anrede = ["Herr", "Frau"],
  familienstand = ["ledig", "verheiratet", "geschieden", "verwitwet"],
  schluesselworte = ["Aktiv", "Weihnachtskarte", "Geburtstagskarte"],
  defaultSchluesselworte = ["Aktiv", "Weihnachtskarte"],
}: Partial<Configuration> = {}): Configuration {
  return {
    praxis,
    anrede,
    familienstand,
    schluesselworte,
    defaultSchluesselworte,
  };
}
