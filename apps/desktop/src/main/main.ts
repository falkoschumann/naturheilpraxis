// Copyright (c) 2026 Falko Schumann. MIT license.

import path from "node:path";

import { app, BrowserWindow } from "electron";

// The development runner serves the renderer with HMR and announces its URL.
// Without it the window loads the files built next to this script.
const devServerUrl = process.env["VITE_DEV_SERVER_URL"];

// The app path is the directory with the package.json, in the packaged app the
// root of the archive.
const appPath = app.getAppPath();

function createMainWindow(): void {
  const window = new BrowserWindow({
    width: 1280,
    height: 800,
    show: false,
    webPreferences: {
      preload: path.join(appPath, "build", "preload", "preload.cjs"),
    },
  });

  // Showing the window only when it is painted avoids a white flash.
  window.once("ready-to-show", () => window.show());

  if (devServerUrl === undefined) {
    void window.loadFile(path.join(appPath, "build", "renderer", "index.html"));
  } else {
    void window.loadURL(devServerUrl);
  }
}

app.on("window-all-closed", () => {
  // On macOS an app keeps running without windows until the user quits it.
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  // On macOS a click on the dock icon opens a window again.
  if (BrowserWindow.getAllWindows().length === 0) {
    createMainWindow();
  }
});

void app.whenReady().then(createMainWindow);
