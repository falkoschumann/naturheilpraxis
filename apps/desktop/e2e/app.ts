// Copyright (c) 2026 Falko Schumann. MIT license.

import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

import {
  _electron as electron,
  test as base,
  type ElectronApplication,
  type Page,
} from "@playwright/test";

const appDirectory = fileURLToPath(new URL("..", import.meta.url));

export interface AppFixtures {
  // The built app, started with an empty user data directory of its own.
  readonly app: ElectronApplication;
  // The main window of the app.
  readonly window: Page;
}

// The fixtures hand over their value with a function that Playwright calls
// "use" in its documentation; the name would be mistaken for the React hook.
export const test = base.extend<AppFixtures>({
  // Playwright requires the fixtures to be destructured, even when none is used.
  // eslint-disable-next-line no-empty-pattern
  app: async ({}, provide) => {
    const userDataDirectory = await fs.mkdtemp(
      path.join(os.tmpdir(), "naturheilpraxis-e2e-"),
    );
    const app = await electron.launch({
      args: [appDirectory, `--user-data-dir=${userDataDirectory}`],
      env: createEnvironment(),
    });
    try {
      await provide(app);
    } finally {
      await app.close();
      await fs.rm(userDataDirectory, { recursive: true, force: true });
    }
  },
  window: async ({ app }, provide) => {
    const window = await app.firstWindow();
    await window.getByRole("navigation", { name: "Hauptnavigation" }).waitFor();
    await provide(window);
  },
});

export { expect } from "@playwright/test";

// The terminals of VS Code set ELECTRON_RUN_AS_NODE. With it Electron runs as
// plain Node and opens no window.
function createEnvironment(): Record<string, string> {
  return Object.fromEntries(
    Object.entries(process.env).filter(
      (entry): entry is [string, string] =>
        entry[0] !== "ELECTRON_RUN_AS_NODE" && entry[1] !== undefined,
    ),
  );
}
