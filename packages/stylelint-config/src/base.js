// Copyright (c) 2026 Falko Schumann. MIT license.

import { fileURLToPath } from "node:url";

/** @type {import("stylelint").Config} */
export const base = {
  // TODO Can this be simplified?
  //extends: ["stylelint-config-standard"],
  extends: [fileURLToPath(import.meta.resolve("stylelint-config-standard"))],
  ignoreFiles: [
    "build/**",
    "coverage/**",
    "coverage-e2e/**",
    "dist/**",
    "node_modules/**",
    "playwright-report/**",
    "test-results/**",
  ],
};
