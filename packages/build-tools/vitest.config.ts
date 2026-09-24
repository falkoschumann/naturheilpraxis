// Copyright (c) 2026 Falko Schumann. MIT license.

import { defineConfig, mergeConfig } from "vitest/config";

import { base } from "@naturheilpraxis/vitest-config";

export default mergeConfig(
  base,
  defineConfig({
    test: {
      coverage: {
        // The other modules are shells around I/O and run in the build.
        include: ["src/scenario_validator.ts"],
      },
    },
  }),
);
