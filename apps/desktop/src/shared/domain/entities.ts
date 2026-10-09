// Copyright (c) 2026 Falko Schumann. MIT license.

import type {
  Anschrift,
  Euro,
  Gebuehrenziffer,
  Kontakt,
} from "./value-objects.ts";

export type Praxis = Readonly<{
  praxiskuerzel: string;
  name: string;
  anschrift: Anschrift;
  kontakt?: Kontakt;
  rechnungstext?: string;
}>;

export type Gebuehr = Readonly<{
  ziffer: Gebuehrenziffer;
  bezeichnung: string;
  betrag: Euro;
}>;
