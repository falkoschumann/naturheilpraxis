// Copyright (c) 2026 Falko Schumann. MIT license.

import { fileURLToPath } from "node:url";

import { base } from "./base.js";

/** @type {import("stylelint").Config} */
export const scss = {
  ...base,
  extends: [
    fileURLToPath(import.meta.resolve("stylelint-config-standard-scss")),
  ],
};
