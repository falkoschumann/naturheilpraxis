// Copyright (c) 2026 Falko Schumann. MIT license.

import { builtinModules } from "node:module";

import { defineConfig, type EnvironmentOptions } from "vite";

// Electron and Node built-ins are provided by the runtime, never bundled.
const runtimeProvided = [
  "electron",
  ...builtinModules,
  ...builtinModules.map((name) => `node:${name}`),
];

// Main and preload differ only in their entry point. Both are bundled to
// CommonJS because a sandboxed preload script cannot be ESM.
function electronProcess(name: string, entry: string): EnvironmentOptions {
  return {
    consumer: "server",
    build: {
      outDir: `build/${name}`,
      emptyOutDir: true,
      target: "node22",
      minify: false,
      sourcemap: true,
      rollupOptions: {
        input: entry,
        external: runtimeProvided,
        output: {
          format: "cjs",
          entryFileNames: `${name}.cjs`,
        },
      },
    },
  };
}

export default defineConfig({
  base: "./",
  environments: {
    main: electronProcess("main", "src/main/main.ts"),
    preload: electronProcess("preload", "src/preload/preload.ts"),
    client: {
      build: {
        outDir: "build/renderer",
        emptyOutDir: true,
        target: "esnext",
        sourcemap: true,
      },
    },
  },
});
