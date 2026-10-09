// Copyright (c) 2026 Falko Schumann. MIT license.

import { createContext } from "react";

// The Praxiskürzel of the Praxis the Heilpraktiker currently works in. New
// entries are made in this Praxis unless chosen otherwise.
export const AktuellePraxisContext = createContext<string | undefined>(
  undefined,
);
