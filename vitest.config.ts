// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    coverage: {
      enabled: true,
      include: [
        "src/**/application/**/*",
        "src/**/common/**/*",
        "src/**/domain/**/*",
        "src/**/infrastructure/**/*",
        // exclude layers UI and root
      ],
      provider: "istanbul",
      reporter: ["text", "html", "cobertura", "json"],
      thresholds: {
        statements: 90,
        branches: 90,
      },
    },
    outputFile: "coverage/junit.xml",
    reporters: ["junit", "tree"],
  },
});
