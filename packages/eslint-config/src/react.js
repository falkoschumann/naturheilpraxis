// Copyright (c) 2026 Falko Schumann. MIT license.

import reactPlugin from "eslint-plugin-react";
import reactHooksPlugin from "eslint-plugin-react-hooks";
import { defineConfig } from "eslint/config";

export const react = defineConfig([
  // @ts-expect-error ESLint React plugin does not have TypeScript types
  reactPlugin.configs.flat["jsx-runtime"],
  reactHooksPlugin.configs.flat.recommended,
]);
