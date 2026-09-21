// Copyright (c) 2026 Falko Schumann. MIT license.

import js from "@eslint/js";
import { defineConfig, globalIgnores } from "eslint/config";
import prettierConfig from "eslint-config-prettier";
// @ts-expect-error ESLint headers plugin does not have TypeScript types
import headersPlugin from "eslint-plugin-headers";
import globals from "globals";
import ts from "typescript-eslint";

export const base = defineConfig([
  globalIgnores(["build/**", "coverage/**", "dist/**"]),
  {
    extends: [js.configs.recommended, ts.configs.recommended, prettierConfig],
    files: ["**/*.{js,jsx,mjs,cjs,ts,tsx}"],
    languageOptions: {
      ecmaVersion: 2023,
      globals: {
        ...globals.es2023,
        ...globals.browser,
      },
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
    plugins: {
      headers: headersPlugin,
    },
    rules: {
      "headers/header-format": [
        "error",
        {
          source: "string",
          style: "line",
          content: "Copyright (c) (year) Falko Schumann. MIT license.",
          patterns: {
            year: {
              pattern: "\\d{4}",
              defaultValue: String(new Date().getFullYear()),
            },
          },
          trailingNewlines: 2,
        },
      ],
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          argsIgnorePattern: "^_", // allow ignoring leading parameters
        },
      ],
    },
  },
]);
