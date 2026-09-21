// Copyright (c) 2026 Falko Schumann. MIT license.

import { defineConfig } from "eslint/config";

import { base, react, sheriff } from "@naturheilpraxis/eslint-config";

const config = defineConfig([base, react, sheriff]);

export default config;
