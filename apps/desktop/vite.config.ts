// Copyright (c) 2026 Falko Schumann. MIT license.

import { builtinModules } from "node:module";

import { defineConfig, type EnvironmentOptions, type Plugin } from "vite";

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

// The renderer runs only its own scripts and styles and sends nothing to other
// servers. Bootstrap embeds its icons for form controls as data URLs. During
// development Vite injects the styles as style elements and reloads the page
// over a web socket.
function contentSecurityPolicy(): Plugin {
  const policy = (development: boolean) =>
    [
      "default-src 'none'",
      "script-src 'self'",
      development ? "style-src 'self' 'unsafe-inline'" : "style-src 'self'",
      "img-src 'self' data:",
      "font-src 'self'",
      development
        ? "connect-src 'self' ws://localhost:*"
        : "connect-src 'none'",
      "base-uri 'none'",
      "form-action 'none'",
      "object-src 'none'",
    ].join("; ");
  let development = false;
  return {
    name: "content-security-policy",
    configResolved(config) {
      development = config.command === "serve";
    },
    transformIndexHtml: () => [
      {
        tag: "meta",
        attrs: {
          "http-equiv": "Content-Security-Policy",
          content: policy(development),
        },
        injectTo: "head-prepend",
      },
    ],
  };
}

export default defineConfig({
  base: "./",
  plugins: [contentSecurityPolicy()],
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
