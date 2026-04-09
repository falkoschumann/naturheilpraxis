// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

import path from "node:path";

import { shell } from "electron/common";
import { app, BrowserWindow, ipcMain } from "electron/main";
import {
  installExtension,
  REACT_DEVELOPER_TOOLS,
} from "electron-devtools-installer";

import { NimmPatientAufCommandHandler } from "./application/nimm_patient_auf_command_handler";
import { PatientenQueryHandler } from "./application/patienten_query_handler";
import { PatientQueryHandler } from "./application/patient_query_handler";
import {
  LADE_EINSTELLUNGEN_CHANNEL,
  NIMM_PATIENT_AUF_CHANNEL,
  SICHERE_EINSTELLUNGEN_CHANNEL,
  SUCHE_PATIENT_CHANNEL,
  SUCHE_PATIENTEN_CHANNEL,
} from "../shared/infrastructure/channels";
import { Einstellungen } from "../shared/domain/einstellungen";
import { NimmPatientAufCommand } from "../shared/domain/nimm_patient_auf_command";
import { PatientQuery } from "../shared/domain/suche_patient_query";
import { PatientenQuery } from "../shared/domain/suche_patienten_query";
import { EinstellungenProvider } from "./infrastructure/einstellungen_provider";
import { DatenbankProvider } from "./infrastructure/datenbank_provider";
import { PatientenRepository } from "./infrastructure/patienten_repository";
import { KalenderProvider } from "./infrastructure/kalender_provider";
import icon from "../../build/icon.png?asset";

// TODO Make the file paths configurable
const datenbankProvider = DatenbankProvider.create({
  datenbankPfad: "data/naturheilpraxis.sqlite",
});
const einstellungenProvider = EinstellungenProvider.create({
  datenbankProvider,
});
const uhrProvider = KalenderProvider.create();
const patientenRepository = PatientenRepository.create({ datenbankProvider });
const nimmPatientAufCommandHandler = NimmPatientAufCommandHandler.create({
  patientenRepository,
});
const suchePatientQueryHandler = PatientQueryHandler.create({
  patientenRepository,
  einstellungenProvider: einstellungenProvider,
  uhrProvider,
});
const suchePatientenQueryHandler = PatientenQueryHandler.create({
  patientenRepository,
});

const isProduction = app.isPackaged;

app.whenReady().then(async () => {
  // TODO await initializeApplication();
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

// On OS X it's common to re-create a window in the app when the
// dock icon is clicked and there are no other windows open.
app.on("activate", () => {
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
  ipcMain.handle(NIMM_PATIENT_AUF_CHANNEL, async (_event, json: string) => {
    const dto = JSON.parse(json);
    const command = NimmPatientAufCommand.create(dto);
    const status = await nimmPatientAufCommandHandler.handle(command);
    return JSON.stringify(status);
  });
  ipcMain.handle(SUCHE_PATIENT_CHANNEL, async (_event, json: string) => {
    const dto = JSON.parse(json);
    const query = PatientQuery.create(dto);
    const result = await suchePatientQueryHandler.handle(query);
    return JSON.stringify(result);
  });
  ipcMain.handle(SUCHE_PATIENTEN_CHANNEL, async (_event, json: string) => {
    const dto = JSON.parse(json);
    const query = PatientenQuery.create(dto);
    const result = await suchePatientenQueryHandler.handle(query);
    return JSON.stringify(result);
  });
  ipcMain.handle(LADE_EINSTELLUNGEN_CHANNEL, () => {
    const einstellungen = einstellungenProvider.lade();
    return JSON.stringify(einstellungen);
  });
  ipcMain.handle(SICHERE_EINSTELLUNGEN_CHANNEL, (_event, json: string) => {
    const dto = JSON.parse(json);
    const einstellungen = Einstellungen.create(dto);
    einstellungenProvider.sichere(einstellungen);
  });
}

function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 1440,
    height: 960,
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
}
