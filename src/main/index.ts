// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

import path from "node:path";

import { shell } from "electron/common";
import { app, BrowserWindow, ipcMain } from "electron/main";
import {
  installExtension,
  REACT_DEVELOPER_TOOLS,
} from "electron-devtools-installer";

import { NaturheilpraxisService } from "./application/naturheilpraxis-service";
import type {
  NimmPatientAufCommand,
  PatientenkarteiQuery,
} from "../shared/domain/naturheilpraxis";
import {
  CONFIGURATION_CHANNEL,
  NIMM_PATIENT_AUF_CHANNEL,
  QUERY_PATIENTENKARTEI_CHANNEL,
} from "../shared/infrastructur/channels";
import { NdjsonEventStore } from "./infrastructure/event-store";
import { ConfigurationGateway } from "./infrastructure/configuration-gateway";
import icon from "../../build/icon.png?asset";

// TODO Make the file paths configurable
const configurationGateway = new ConfigurationGateway(
  "./data/configuration.json",
);
const eventStore = new NdjsonEventStore("./data/events.ndjson");
const naturheilpraxisService = new NaturheilpraxisService(eventStore);

const isProduction = app.isPackaged;

app.whenReady().then(async () => {
  await installDevTools();
  createRendererToMainChannels();
  createWindow();
});

app.on("web-contents-created", (_event, contents) => {
  contents.setWindowOpenHandler((details) => {
    if (isSafeForExternalOpen(details.url)) {
      setTimeout(() => {
        void shell.openExternal(details.url);
      }, 0);
    }

    return { action: "deny" };
  });

  function isSafeForExternalOpen(url: string): boolean {
    return url.startsWith("mailto:");
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

async function installDevTools() {
  if (isProduction) {
    // No dev tools in production
    return;
  }

  try {
    const extensions = await installExtension([REACT_DEVELOPER_TOOLS]);
    console.info(
      `Added Extensions:  ${extensions.map((e) => e.name).join(", ")}`,
    );
  } catch (error) {
    console.error("An error occurred: ", error);
  }
}

function createRendererToMainChannels() {
  ipcMain.handle(CONFIGURATION_CHANNEL, async (_event) =>
    configurationGateway.load(),
  );
  ipcMain.handle(
    NIMM_PATIENT_AUF_CHANNEL,
    async (_event, command: NimmPatientAufCommand) =>
      naturheilpraxisService.nimmPatientAuf(command),
  );
  ipcMain.handle(
    QUERY_PATIENTENKARTEI_CHANNEL,
    async (_event, query: PatientenkarteiQuery) =>
      naturheilpraxisService.patientenkartei(query),
  );
}

export const createWindow = () => {
  const mainWindow = new BrowserWindow({
    width: 1024,
    height: 2048,
    ...(process.platform === "linux" ? { icon } : {}),
    webPreferences: {
      preload: path.join(__dirname, "../preload/index.js"),
    },
  });

  if (!isProduction && process.env["ELECTRON_RENDERER_URL"]) {
    void mainWindow.loadURL(process.env["ELECTRON_RENDERER_URL"]);
  } else {
    void mainWindow.loadFile(path.join(__dirname, "../renderer/index.html"));
  }
};
