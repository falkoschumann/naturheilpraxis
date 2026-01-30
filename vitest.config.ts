// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    coverage: {
      enabled: true,
      provider: "istanbul",
      thresholds: {
        statements: 85,
        branches: 85,
        lines: 85,
      },
    },
  },
});
