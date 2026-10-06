// Copyright (c) 2026 Falko Schumann. MIT license.

import sheriffPlugin from "@softarc/eslint-plugin-sheriff";
import { defineConfig } from "eslint/config";

export const sheriff = defineConfig([
  {
    .../** @type {import("eslint").Linter.Config} */ (
      sheriffPlugin.configs.all
    ),
    files: ["**/*.{js,jsx,ts,tsx}"],
    ignores: ["**/*.test.*"],
  },
]);
