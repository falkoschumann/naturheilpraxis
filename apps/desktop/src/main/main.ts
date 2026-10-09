// Copyright (c) 2026 Falko Schumann. MIT license.

import path from "node:path";

import { app, BrowserWindow, ipcMain } from "electron";

import { NaturheilpraxisService } from "./application/naturheilpraxis-service.ts";
import { SqliteEventStore } from "./infrastructure/event-store.ts";

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

// The renderer sends each command and query on the channel named after its
// type, see NaturheilpraxisApi.
function handleMessages(service: NaturheilpraxisService): void {
  ipcMain.handle("praxis-anlegen", (_event, command) =>
    service.praxisAnlegen(command),
  );
  ipcMain.handle("praxisdaten-aendern", (_event, command) =>
    service.praxisdatenAendern(command),
  );
  ipcMain.handle("praxen-ermitteln", (_event, query) =>
    service.praxenErmitteln(query),
  );
  ipcMain.handle("praxis-ermitteln", (_event, query) =>
    service.praxisErmitteln(query),
  );
  ipcMain.handle("gebuehr-anlegen", (_event, command) =>
    service.gebuehrAnlegen(command),
  );
  ipcMain.handle("gebuehr-aendern", (_event, command) =>
    service.gebuehrAendern(command),
  );
  ipcMain.handle("gebuehr-entfernen", (_event, command) =>
    service.gebuehrEntfernen(command),
  );
  ipcMain.handle("gebuehren-ermitteln", (_event, query) =>
    service.gebuehrenErmitteln(query),
  );
  ipcMain.handle("patient-aufnehmen", (_event, command) =>
    service.patientAufnehmen(command),
  );
  ipcMain.handle("patientendaten-aendern", (_event, command) =>
    service.patientendatenAendern(command),
  );
  ipcMain.handle("patienten-ermitteln", (_event, query) =>
    service.patientenErmitteln(query),
  );
  ipcMain.handle("patient-ermitteln", (_event, query) =>
    service.patientErmitteln(query),
  );
  ipcMain.handle("diagnose-stellen", (_event, command) =>
    service.diagnoseStellen(command),
  );
  ipcMain.handle("diagnose-aendern", (_event, command) =>
    service.diagnoseAendern(command),
  );
  ipcMain.handle("diagnose-loeschen", (_event, command) =>
    service.diagnoseLoeschen(command),
  );
  ipcMain.handle("behandlungen-ermitteln", (_event, query) =>
    service.behandlungenErmitteln(query),
  );
  ipcMain.handle("diagnosen-ermitteln", (_event, query) =>
    service.diagnosenErmitteln(query),
  );
  ipcMain.handle("leistung-erbringen", (_event, command) =>
    service.leistungErbringen(command),
  );
  ipcMain.handle("leistung-aendern", (_event, command) =>
    service.leistungAendern(command),
  );
  ipcMain.handle("leistung-loeschen", (_event, command) =>
    service.leistungLoeschen(command),
  );
  ipcMain.handle("rechnung-erstellen", (_event, command) =>
    service.rechnungErstellen(command),
  );
  ipcMain.handle("rechnung-aendern", (_event, command) =>
    service.rechnungAendern(command),
  );
  ipcMain.handle("entwurf-loeschen", (_event, command) =>
    service.entwurfLoeschen(command),
  );
  ipcMain.handle("nicht-abgerechnete-leistungen-ermitteln", (_event, query) =>
    service.nichtAbgerechneteLeistungenErmitteln(query),
  );
  ipcMain.handle("rechnungen-ermitteln", (_event, query) =>
    service.rechnungenErmitteln(query),
  );
  ipcMain.handle("rechnung-ermitteln", (_event, query) =>
    service.rechnungErmitteln(query),
  );
  ipcMain.handle("rechnung-versenden", (_event, command) =>
    service.rechnungVersenden(command),
  );
  ipcMain.handle("rechnung-zurueckstufen", (_event, command) =>
    service.rechnungZurueckstufen(command),
  );
  ipcMain.handle("zahlung-erfassen", (_event, command) =>
    service.zahlungErfassen(command),
  );
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

void app.whenReady().then(() => {
  const eventStore = SqliteEventStore.create(
    path.join(app.getPath("userData"), "naturheilpraxis.db"),
  );
  app.on("will-quit", () => eventStore.close());
  handleMessages(new NaturheilpraxisService(eventStore));
  createMainWindow();
});
