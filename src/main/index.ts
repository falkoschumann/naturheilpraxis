// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

import path from "node:path";

import { shell } from "electron/common";
import { app, BrowserWindow, ipcMain } from "electron/main";
import {
  installExtension,
  REACT_DEVELOPER_TOOLS,
} from "electron-devtools-installer";

import { NimmPatientAufCommandHandler } from "./application/nimm_patient_auf_command_handler";
import { SuchePatientenQueryHandler } from "./application/suche_patienten_query_handler";
import { SuchePatientQueryHandler } from "./application/suche_patient_query_handler";
import {
  LADE_EINSTELLUNGEN_CHANNEL,
  NIMM_PATIENT_AUF_CHANNEL,
  SICHERE_EINSTELLUNGEN_CHANNEL,
  SUCHE_PATIENT_CHANNEL,
  SUCHE_PATIENTEN_CHANNEL,
} from "../shared/channels";
import {
  NimmPatientAufCommandDto,
  NimmPatientAufCommandStatusDto,
} from "../shared/infrastructure/nimm_patient_auf_command_dto";
import {
  PatientQueryDto,
  PatientQueryResultDto,
} from "../shared/infrastructure/suche_patient_query_dto";
import {
  PatientenQueryDto,
  PatientenQueryResultDto,
} from "../shared/infrastructure/suche_patienten_query_dto";
import { EinstellungenGateway } from "./infrastructure/einstellungen_gateway";
import { DatabaseProvider } from "./infrastructure/database_provider";
import { PatientenRepository } from "./infrastructure/patienten_repository";
import icon from "../../build/icon.png?asset";
import { EinstellungenDto } from "../shared/infrastructure/einstellungen_dto";

// TODO Make the file paths configurable
const databaseProvider = DatabaseProvider.create();
const einstellungenGateway = EinstellungenGateway.create({ databaseProvider });
const patientenRepository = PatientenRepository.create({ databaseProvider });
const nimmPatientAufCommandHandler = NimmPatientAufCommandHandler.create({
  patientenRepository,
});
const suchePatientQueryHandler = SuchePatientQueryHandler.create({
  patientenRepository,
});
const suchePatientenQueryHandler = SuchePatientenQueryHandler.create({
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
  ipcMain.handle(
    NIMM_PATIENT_AUF_CHANNEL,
    async (_event, commandDto: NimmPatientAufCommandDto) => {
      const command = NimmPatientAufCommandDto.create(commandDto).validate();
      const status = await nimmPatientAufCommandHandler.handle(command);
      return NimmPatientAufCommandStatusDto.fromModel(status);
    },
  );
  ipcMain.handle(
    SUCHE_PATIENT_CHANNEL,
    async (_event, queryDto: PatientQueryDto) => {
      const query = PatientQueryDto.create(queryDto).validate();
      const result = await suchePatientQueryHandler.handle(query);
      return PatientQueryResultDto.fromModel(result);
    },
  );
  ipcMain.handle(
    SUCHE_PATIENTEN_CHANNEL,
    async (_event, queryDto: PatientenQueryDto) => {
      const query = PatientenQueryDto.create(queryDto).validate();
      const result = await suchePatientenQueryHandler.handle(query);
      return PatientenQueryResultDto.fromModel(result);
    },
  );
  ipcMain.handle(LADE_EINSTELLUNGEN_CHANNEL, (_event) => {
    const einstellungen = einstellungenGateway.lade();
    return EinstellungenDto.fromModel(einstellungen);
  });
  ipcMain.handle(
    SICHERE_EINSTELLUNGEN_CHANNEL,
    (_event, settingsDto: EinstellungenDto) => {
      const einstellungen = EinstellungenDto.create(settingsDto).validate();
      einstellungenGateway.sichere(einstellungen);
    },
  );
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
