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
  css: {
    preprocessorOptions: {
      // Bootstrap still uses the old Sass API, which warns hundreds of times
      // per build. The list follows the recommendation of Bootstrap for Vite,
      // https://getbootstrap.com/docs/5.3/getting-started/vite/, without
      // "mixed-decls", which Dart Sass has retired in the meantime, and with
      // "if-function", which it has added since.
      scss: {
        silenceDeprecations: [
          "import",
          "color-functions",
          "global-builtin",
          "if-function",
        ],
      },
    },
  },
  environments: {
    main: electronProcess("main", "src/main/main.ts"),
    preload: electronProcess("preload", "src/preload/preload.ts"),
    client: {
      build: {
        outDir: "build/renderer",
        emptyOutDir: true,
        target: "esnext",
        sourcemap: true,
        rollupOptions: {
          onwarn(warning, warn) {
            // React Router marks its modules with "use client" for React
            // Server Components, which the app does not use.
            if (warning.code === "MODULE_LEVEL_DIRECTIVE") {
              return;
            }
            warn(warning);
          },
        },
      },
    },
  },
});
