// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

import path from "node:path";

import { shell } from "electron/common";
import { app, BrowserWindow, ipcMain } from "electron/main";
import {
  installExtension,
  REACT_DEVELOPER_TOOLS,
} from "electron-devtools-installer";

import { suchePatienten } from "./application/suche_patienten_query_handler";
import { suchePatient } from "./application/suche_patient_query_handler";
import { nimmPatientAuf } from "./application/nimm_patient_auf_command_handler";
import { SettingsService } from "./application/settings_service";
import {
  LOAD_SETTINGS_CHANNEL,
  NIMM_PATIENT_AUF_CHANNEL,
  STORE_SETTINGS_CHANNEL,
  SUCHE_PATIENT_CHANNEL,
  SUCHE_PATIENTEN_CHANNEL,
} from "../shared/infrastructure/channels";
import {
  NimmPatientAufCommandDto,
  NimmPatientAufCommandStatusDto,
} from "../shared/infrastructure/nimm_patient_auf_command_dto";
import {
  SuchePatientQueryDto,
  SuchePatientQueryResultDto,
} from "../shared/infrastructure/suche_patient_query_dto";
import {
  SuchePatientenQueryDto,
  SuchePatientenQueryResultDto,
} from "../shared/infrastructure/suche_patienten_query_dto";
import { SettingsDto } from "../shared/infrastructure/settings_dto";
import { EventStore } from "./infrastructure/event_store";
import icon from "../../resources/icon.png?asset";

// TODO Make the file paths configurable
const settingsService = SettingsService.create();
const eventStore = EventStore.create();

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
  ipcMain.handle(
    NIMM_PATIENT_AUF_CHANNEL,
    async (_event, commandDto: NimmPatientAufCommandDto) => {
      const command = NimmPatientAufCommandDto.create(commandDto).validate();
      const status = await nimmPatientAuf(command, eventStore);
      return NimmPatientAufCommandStatusDto.fromModel(status);
    },
  );
  ipcMain.handle(
    SUCHE_PATIENT_CHANNEL,
    async (_event, queryDto: SuchePatientQueryDto) => {
      const query = SuchePatientQueryDto.create(queryDto).validate();
      const result = await suchePatient(query, eventStore);
      return SuchePatientQueryResultDto.fromModel(result);
    },
  );
  ipcMain.handle(
    SUCHE_PATIENTEN_CHANNEL,
    async (_event, queryDto: SuchePatientenQueryDto) => {
      const query = SuchePatientenQueryDto.create(queryDto).validate();
      const result = await suchePatienten(query, eventStore);
      return SuchePatientenQueryResultDto.fromModel(result);
    },
  );
  ipcMain.handle(LOAD_SETTINGS_CHANNEL, async (_event) => {
    const settings = await settingsService.loadSettings();
    return SettingsDto.fromModel(settings);
  });
  ipcMain.handle(
    STORE_SETTINGS_CHANNEL,
    async (_event, settingsDto: SettingsDto) => {
      const settings = SettingsDto.create(settingsDto).validate();
      await settingsService.storeSettings(settings);
    },
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
