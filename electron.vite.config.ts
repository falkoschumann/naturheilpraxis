// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

/// <reference types="vitest" />

import { resolve } from "node:path";

import react from "@vitejs/plugin-react";
import { defineConfig, externalizeDepsPlugin } from "electron-vite";

export default defineConfig({
  main: {
    plugins: [externalizeDepsPlugin()],
  },
  preload: {
    plugins: [externalizeDepsPlugin()],
  },
  renderer: {
    css: {
      preprocessorOptions: {
        scss: {
          silenceDeprecations: [
            "import",
            "mixed-decls",
            "color-functions",
            "global-builtin",
          ],
        },
      },
    },
    resolve: {
      alias: {
        "@renderer": resolve("src/renderer/src"),
      },
    },
    plugins: [react()],
    test: {
      coverage: {
        provider: "v8",
        include: ["src/**/*", "test/**/*"],
      },
    },
  },
});
