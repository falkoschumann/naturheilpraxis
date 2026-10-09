// Copyright (c) 2026 Falko Schumann. MIT license.

import type { Anschrift, Kontakt } from "./value-objects.ts";

export type Praxis = Readonly<{
  praxiskuerzel: string;
  name: string;
  anschrift: Anschrift;
  kontakt?: Kontakt;
  rechnungstext?: string;
}>;
