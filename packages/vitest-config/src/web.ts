// Copyright (c) 2026 Falko Schumann. MIT license.

import { defineConfig } from "vitest/config";

export const web = defineConfig({
  test: {
    environment: "jsdom",
    isolate: false,
  },
});
