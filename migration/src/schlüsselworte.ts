// Copyright (c) 2026 Falko Schumann. All rights reserved. MIT license.

import type { HandlingDto } from "./legacy_database_gateway";

export function erstelleSchlüsselworte(handlings: HandlingDto[]) {
  const schlüsselworte: Record<string, boolean> = {};
  handlings.forEach((handling) => {
    schlüsselworte[handling.handling] = handling.standard === 1;
  });
  return schlüsselworte;
}
