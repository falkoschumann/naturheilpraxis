// Copyright (c) 2026 Falko Schumann. MIT license.

import { defineConfig } from "@playwright/test";

// The end-to-end tests start the built app with Electron, so they need no
// browser of Playwright. Run "bun run build" before them.
export default defineConfig({
  testDir: "e2e",
  testMatch: "**/*.e2e.ts",
  outputDir: "node_modules/.cache/playwright",
  fullyParallel: false,
  workers: 1,
  forbidOnly: process.env["CI"] !== undefined,
  retries: 0,
  timeout: 60_000,
  expect: { timeout: 10_000 },
  reporter: process.env["CI"] === undefined ? "list" : [["list"], ["github"]],
  use: {
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },
});
