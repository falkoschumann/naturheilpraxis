// Copyright (c) 2026 Falko Schumann. MIT license.

import { defineConfig } from "vitest/config";

export const base = defineConfig({
  test: {
    coverage: {
      thresholds: {
        statements: 85,
        branches: 85,
      },
    },
  },
});
