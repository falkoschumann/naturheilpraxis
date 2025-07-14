// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

import path from "node:path";

import { app, BrowserWindow, ipcMain } from "electron";
import {
  installExtension,
  REACT_DEVELOPER_TOOLS,
} from "electron-devtools-installer";
import started from "electron-squirrel-startup";

import { NaturheilpraxisService } from "./application/naturheilpraxis-service";
import type {
  NimmPatientAufCommand,
  PatientenkarteiQuery,
} from "./domain/naturheilpraxis";
import { NdjsonEventStore } from "./integration/event-store";
import icon from "../../resources/icon.png?asset";
import { ConfigurationGateway } from "./integration/configuration-gateway";

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (started) {
  app.quit();
}

const createWindow = () => {
  const mainWindow = new BrowserWindow({
    width: 1024,
    height: 2048,
    ...(process.platform === "linux" ? { icon } : {}),
    webPreferences: {
      preload: path.join(__dirname, "../preload/index.js"),
    },
  });

  // HMR for renderer base on electron-vite cli.
  // Load the remote URL for development or the local html file for production.
  if (!app.isPackaged && process.env["ELECTRON_RENDERER_URL"]) {
    void mainWindow.loadURL(process.env["ELECTRON_RENDERER_URL"]);
    setTimeout(() => mainWindow.reload(), 1000);
  } else {
    void mainWindow.loadFile(path.join(__dirname, "../renderer/index.html"));
  }

  if (!app.isPackaged) {
    mainWindow.webContents.openDevTools();
  }
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(async () => {
  const configurationGateway = new ConfigurationGateway(
    "./data/configuration.json",
  );
  const configuration = await configurationGateway.load();
  const eventStore = new NdjsonEventStore("./data/events.ndjson");
  const naturheilpraxisService = new NaturheilpraxisService(eventStore);

  ipcMain.on("getConfiguration", (event) => {
    event.returnValue = configuration;
  });
  ipcMain.handle(
    "nimmPatientAuf",
    async (_event, command: NimmPatientAufCommand) =>
      naturheilpraxisService.nimmPatientAuf(command),
  );
  ipcMain.handle(
    "patientenkartei",
    async (_event, query: PatientenkarteiQuery) =>
      naturheilpraxisService.patientenkartei(query),
  );
  createWindow();

  if (!app.isPackaged) {
    installExtension([REACT_DEVELOPER_TOOLS])
      .then(([redux, react]) =>
        console.log(`Added Extensions:  ${redux.name}, ${react.name}`),
      )
      .catch((err) => console.log("An error occurred: ", err));
  }
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// In this file, you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.
