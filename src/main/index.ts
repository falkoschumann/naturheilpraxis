// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

import path from "node:path";

import { shell } from "electron/common";
import { app, BrowserWindow, ipcMain } from "electron/main";
import {
  installExtension,
  REACT_DEVELOPER_TOOLS,
} from "electron-devtools-installer";

import "../shared/polyfill";
import { DiagnosenQueryHandler } from "./application/diagnosen_query_handler";
import { LeistungenQueryHandler } from "./application/leistungen_query_handler";
import { NimmPatientAufCommandHandler } from "./application/nimm_patient_auf_command_handler";
import { PatientenQueryHandler } from "./application/patienten_query_handler";
import { PatientQueryHandler } from "./application/patient_query_handler";
import { RechnungenQueryHandler } from "./application/rechnungen_query_handler";
import { LeistungenQuery } from "../shared/domain/leistungen_query";
import { NimmPatientAufCommand } from "../shared/domain/nimm_patient_auf_command";
import { PatientQuery } from "../shared/domain/patient_query";
import { PatientenQuery } from "../shared/domain/patienten_query";
import { RechnungenQuery } from "../shared/domain/rechnungen_query";
import {
  DIAGNOSEN_CHANNEL,
  LEISTUNGEN_CHANNEL,
  NIMM_PATIENT_AUF_CHANNEL,
  PATIENT_CHANNEL,
  PATIENTEN_CHANNEL,
  RECHNUNGEN_CHANNEL,
} from "../shared/infrastructure/channels";
import { DatenbankProvider } from "./infrastructure/datenbank_provider";
import { DiagnosenRepository } from "./infrastructure/diagnosen_repository";
import { EinstellungenRepository } from "./infrastructure/einstellungen_repository";
import { KalenderProvider } from "./infrastructure/kalender_provider";
import { LeistungenRepository } from "./infrastructure/leistungen_repository";
import { PatientenRepository } from "./infrastructure/patienten_repository";
import { RechnungenRepository } from "./infrastructure/rechnungen_repository";
import icon from "../../build/icon.png?asset";
import { DiagnosenQuery } from "../shared/domain/diagnosen_query";

// TODO Make the file paths configurable
const datenbankProvider = DatenbankProvider.create({
  datenbankPfad: "data/naturheilpraxis.sqlite",
});
const einstellungenRepository = EinstellungenRepository.create({
  datenbankProvider,
});
const uhrProvider = KalenderProvider.create();
const patientenRepository = PatientenRepository.create({ datenbankProvider });
const nimmPatientAufCommandHandler = NimmPatientAufCommandHandler.create({
  patientenRepository,
});
const patientQueryHandler = PatientQueryHandler.create({
  patientenRepository,
  einstellungenRepository,
  uhrProvider,
});
const patientenQueryHandler = PatientenQueryHandler.create({
  patientenRepository,
});
const diagnosenRepository = DiagnosenRepository.create({ datenbankProvider });
const diagnosenQueryHandler = DiagnosenQueryHandler.create({
  diagnosenRepository,
});
const leistungenRepository = LeistungenRepository.create({ datenbankProvider });
const leistungenQueryHandler = LeistungenQueryHandler.create({
  leistungenRepository,
});
const rechnungenRepository = RechnungenRepository.create({ datenbankProvider });
const rechnungenQueryHandler = RechnungenQueryHandler.create({
  rechnungenRepository,
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
  ipcMain.handle(PATIENT_CHANNEL, async (_event, json: string) => {
    const dto = JSON.parse(json);
    const query = PatientQuery.create(dto);
    const result = await patientQueryHandler.handle(query);
    return JSON.stringify(result);
  });
  ipcMain.handle(PATIENTEN_CHANNEL, async (_event, json: string) => {
    const dto = JSON.parse(json);
    const query = PatientenQuery.create(dto);
    const result = await patientenQueryHandler.handle(query);
    return JSON.stringify(result);
  });
  ipcMain.handle(DIAGNOSEN_CHANNEL, async (_event, json: string) => {
    const dto = JSON.parse(json);
    const query = DiagnosenQuery.create(dto);
    const result = await diagnosenQueryHandler.handle(query);
    return JSON.stringify(result);
  });
  ipcMain.handle(LEISTUNGEN_CHANNEL, async (_event, json: string) => {
    const dto = JSON.parse(json);
    const query = LeistungenQuery.create(dto);
    const result = await leistungenQueryHandler.handle(query);
    return JSON.stringify(result);
  });
  ipcMain.handle(RECHNUNGEN_CHANNEL, async (_event, json: string) => {
    const dto = JSON.parse(json);
    const query = RechnungenQuery.create(dto);
    const result = await rechnungenQueryHandler.handle(query);
    return JSON.stringify(result);
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
