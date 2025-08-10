// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

import js from "@eslint/js";
import headers from "eslint-plugin-headers";
import react from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import globals from "globals";
import ts from "typescript-eslint";

export default ts.config(
  { ignores: ["coverage", "dist", "out"] },
  {
    extends: [js.configs.recommended, ...ts.configs.recommended],
    files: ["**/*.{cjs,mjs,js,jsx,ts,tsx}"],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    plugins: {
      headers,
      react,
      "react-hooks": reactHooks,
      "react-refresh": reactRefresh,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      "react-refresh/only-export-components": [
        "warn",
        { allowConstantExport: true },
      ],
      "headers/header-format": [
        "error",
        {
          source: "string",
          style: "line",
          trailingNewlines: 2,
          content: `Copyright (c) ${new Date().getUTCFullYear()} Falko Schumann. All rights reserved. MIT license.`,
        },
      ],
      "@typescript-eslint/no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_" },
      ],
    },
  },
);
