// Copyright (c) 2026 Falko Schumann. MIT license.

import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

import {
  _electron as electron,
  expect,
  test as base,
  type ElectronApplication,
  type Page,
} from "@playwright/test";

import {
  coverageEnabled,
  createCoverageReport,
  mainCoverageDirectory,
} from "./coverage.ts";

const appDirectory = fileURLToPath(new URL("..", import.meta.url));

export interface AppFixtures {
  // The built app, started with an empty user data directory of its own.
  readonly app: ElectronApplication;
  // The main window of the app.
  readonly window: Page;
  // The violations of the Content Security Policy in the window. A test that
  // provokes one checks and removes it, every other one fails the test.
  readonly cspViolations: string[];
}

// The fixtures hand over their value with a function that Playwright calls
// "use" in its documentation; the name would be mistaken for the React hook.
export const test = base.extend<AppFixtures>({
  // Playwright requires the fixtures to be destructured, even when none is used.
  // eslint-disable-next-line no-empty-pattern
  app: async ({}, provide) => {
    const userDataDirectory = await createUserDataDirectory();
    const app = await launchApp(userDataDirectory);
    try {
      await provide(app);
    } finally {
      await app.close();
      await fs.rm(userDataDirectory, { recursive: true, force: true });
    }
  },
  // Playwright requires the fixtures to be destructured, even when none is used.
  // eslint-disable-next-line no-empty-pattern
  cspViolations: async ({}, provide) => {
    const violations: string[] = [];
    await provide(violations);
    expect(violations).toEqual([]);
  },
  window: async ({ app, cspViolations }, provide) => {
    const window = await app.firstWindow();
    if (coverageEnabled) {
      // Reloading measures the start of the renderer, too.
      await window.coverage.startJSCoverage({ resetOnNavigation: false });
      await window.reload();
    }
    // Each test starts with a new database next to the user data.
    const userDataDirectory = await app.evaluate(({ app }) =>
      app.getPath("userData"),
    );
    await chooseFiles(app, {
      newDatabase: path.join(userDataDirectory, "naturheilpraxis.db"),
    });
    await window
      .getByRole("button", { name: "Neue Datenbank anlegen…" })
      .click();
    await window.getByRole("navigation", { name: "Hauptnavigation" }).waitFor();
    // The Content Security Policy must not block anything the app needs.
    window.on("console", (message) => {
      if (message.text().includes("Content Security Policy")) {
        cspViolations.push(message.text());
      }
    });
    await provide(window);
    if (coverageEnabled) {
      await createCoverageReport().add(await window.coverage.stopJSCoverage());
    }
  },
});

export async function createUserDataDirectory(): Promise<string> {
  return fs.mkdtemp(path.join(os.tmpdir(), "naturheilpraxis-e2e-"));
}

// Starts the built app with the given user data directory.
export async function launchApp(
  userDataDirectory: string,
): Promise<ElectronApplication> {
  return electron.launch({
    args: [appDirectory, `--user-data-dir=${userDataDirectory}`],
    env: createEnvironment(),
  });
}

// Answers the next file dialogs of the system like a user who chooses the
// given files. The dialogs cannot be operated by Playwright.
export async function chooseFiles(
  app: ElectronApplication,
  {
    newDatabase,
    existingDatabase,
  }: { newDatabase?: string; existingDatabase?: string },
): Promise<void> {
  await app.evaluate(
    ({ dialog }, { newDatabase, existingDatabase }) => {
      if (newDatabase !== undefined) {
        dialog.showSaveDialog = () =>
          Promise.resolve({ canceled: false, filePath: newDatabase });
      }
      if (existingDatabase !== undefined) {
        dialog.showOpenDialog = () =>
          Promise.resolve({ canceled: false, filePaths: [existingDatabase] });
      }
    },
    { newDatabase, existingDatabase },
  );
}

// Clicks an item of the application menu, like the user does.
export async function clickMenuItem(
  app: ElectronApplication,
  id: string,
): Promise<void> {
  await app.evaluate(({ Menu }, id) => {
    const item = Menu.getApplicationMenu()?.getMenuItemById(id);
    if (item === null || item === undefined) {
      throw new Error(`The menu has no item ${id}.`);
    }
    item.click();
  }, id);
}

// The title of the window names the open database.
export async function windowTitle(app: ElectronApplication): Promise<string> {
  return app.evaluate(
    ({ BrowserWindow }) => BrowserWindow.getAllWindows()[0]?.getTitle() ?? "",
  );
}

export { expect } from "@playwright/test";

// The terminals of VS Code set ELECTRON_RUN_AS_NODE. With it Electron runs as
// plain Node and opens no window.
// The main process writes its coverage on exit, if requested.
function createEnvironment(): Record<string, string> {
  const environment = Object.fromEntries(
    Object.entries(process.env).filter(
      (entry): entry is [string, string] =>
        entry[0] !== "ELECTRON_RUN_AS_NODE" && entry[1] !== undefined,
    ),
  );
  return coverageEnabled
    ? { ...environment, NODE_V8_COVERAGE: mainCoverageDirectory }
    : environment;
}
