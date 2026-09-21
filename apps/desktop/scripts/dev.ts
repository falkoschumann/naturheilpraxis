// Copyright (c) 2026 Falko Schumann. MIT license.

// Development runner: serves the renderer with HMR, rebuilds main and preload
// on change, and restarts Electron when they do. This is the one piece an
// Electron/Vite plugin would provide.

import { spawn, type ChildProcess } from "node:child_process";
import { createRequire } from "node:module";

import { createBuilder, createServer, type Rolldown } from "vite";

// Outside Electron the package resolves to the path of the Electron binary.
const electronPath = createRequire(import.meta.url)("electron") as string;

const electronProcesses = ["main", "preload"];

const server = await createServer();
await server.listen();
server.printUrls();

const devServerUrl = server.resolvedUrls?.local[0];
if (devServerUrl === undefined) {
  throw new Error("Vite dev server did not report a local URL.");
}

let electron: ChildProcess | undefined;

function startElectron(): void {
  electron = spawn(electronPath, ["."], {
    stdio: "inherit",
    env: { ...process.env, VITE_DEV_SERVER_URL: devServerUrl },
  });
  electron.once("exit", () => {
    electron = undefined;
    void shutdown(0);
  });
}

function restartElectron(): void {
  if (electron === undefined) {
    startElectron();
    return;
  }
  const running = electron;
  electron = undefined;
  running.removeAllListeners("exit");
  running.once("exit", startElectron);
  running.kill();
}

// The renderer is served by the dev server; only the Node bundles are built.
const builder = await createBuilder({
  build: { watch: {} },
  logLevel: "warn",
});

const watchers = await Promise.all(
  electronProcesses.map((name) => {
    const environment = builder.environments[name];
    if (environment === undefined) {
      throw new Error(`Environment "${name}" is missing in vite.config.ts.`);
    }
    return builder.build(environment) as Promise<Rolldown.RolldownWatcher>;
  }),
);

// Both bundles report an initial build; Electron starts once they are ready and
// restarts on every rebuild after that.
let pendingInitialBuilds = watchers.length;
let restart: ReturnType<typeof setTimeout> | undefined;

for (const watcher of watchers) {
  watcher.on("event", (event) => {
    if (event.code !== "END") {
      return;
    }
    if (pendingInitialBuilds > 0) {
      pendingInitialBuilds -= 1;
      if (pendingInitialBuilds === 0) {
        startElectron();
      }
      return;
    }
    clearTimeout(restart);
    restart = setTimeout(restartElectron, 100);
  });
}

async function shutdown(code: number): Promise<void> {
  clearTimeout(restart);
  electron?.removeAllListeners("exit");
  electron?.kill();
  await Promise.all(watchers.map((watcher) => watcher.close()));
  await server.close();
  process.exit(code);
}

process.on("SIGINT", () => void shutdown(0));
process.on("SIGTERM", () => void shutdown(0));
