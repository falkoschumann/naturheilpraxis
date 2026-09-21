// Copyright (c) 2026 Falko Schumann. MIT license.

import { base } from "@naturheilpraxis/vitest-config";
import { defineConfig, mergeConfig } from "vitest/config";

// The processes of the app run in different environments, so each one is its
// own project. Preload is tested in Node like the main process; its browser
// half is the context bridge, which only Electron itself can provide. Code in
// src/shared is imported by the renderer as types only, so it belongs to the
// main project.
export default mergeConfig(
  base,
  defineConfig({
    test: {
      // TODO remove this once there are actual tests to run.
      passWithNoTests: true,
      projects: [
        {
          extends: true,
          test: {
            name: "main",
            environment: "node",
            include: ["src/{main,preload,shared}/**/*.test.ts"],
          },
        },
        {
          extends: true,
          test: {
            name: "renderer",
            environment: "jsdom",
            include: ["src/renderer/**/*.test.{ts,tsx}"],
            setupFiles: ["src/renderer/setup-tests.ts"],
          },
        },
      ],
    },
  }),
);
