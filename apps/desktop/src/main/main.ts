// Copyright (c) 2026 Falko Schumann. MIT license.

import path from "node:path";
import { pathToFileURL } from "node:url";

import {
  app,
  BrowserWindow,
  dialog,
  ipcMain,
  Menu,
  net,
  protocol,
  session,
  type MenuItemConstructorOptions,
  type Session,
} from "electron";

import { DatabaseService } from "./application/database-service.ts";
import type { NaturheilpraxisService } from "./application/naturheilpraxis-service.ts";
import type { DatabaseStatus } from "../shared/application/database-api.ts";
import {
  appHost,
  appScheme,
  resolveAppFile,
} from "./infrastructure/app-protocol.ts";
import { ElectronFileDialog } from "./infrastructure/file-dialog.ts";
import { isTrustedSender } from "./infrastructure/ipc-sender.ts";
import { JsonSettingsStore } from "./infrastructure/settings-store.ts";

// The development runner serves the renderer with HMR and announces its URL.
// Without it the window loads the files built next to this script.
const devServerUrl = process.env["VITE_DEV_SERVER_URL"];

// The app path is the directory with the package.json, in the packaged app the
// root of the archive.
const appPath = app.getAppPath();

const rendererDirectory = path.join(appPath, "build", "renderer");

// The page the main window shows, the only one allowed to send messages.
const rendererUrl = devServerUrl ?? `${appScheme}://${appHost}/index.html`;

// The renderer runs only its own scripts and styles and sends nothing to other
// servers. Bootstrap embeds its icons for form controls as data URLs. The
// development server sets its own policy, see vite.config.ts.
const contentSecurityPolicy = [
  "default-src 'none'",
  "script-src 'self'",
  "style-src 'self'",
  "img-src 'self' data:",
  "font-src 'self'",
  "connect-src 'none'",
  "base-uri 'none'",
  "form-action 'none'",
  "object-src 'none'",
  "frame-ancestors 'none'",
].join("; ");

// A standard and secure scheme behaves like https, for example for relative
// URLs and module scripts. It must be registered before the app is ready.
protocol.registerSchemesAsPrivileged([
  { scheme: appScheme, privileges: { standard: true, secure: true } },
]);

// Serves the built renderer, nothing else, with the Content Security Policy.
function handleAppProtocol(): void {
  protocol.handle(appScheme, async (request) => {
    const file = resolveAppFile(request.url, rendererDirectory);
    if (file === undefined) {
      return new Response(null, { status: 404 });
    }
    const response = await net.fetch(pathToFileURL(file).href);
    const headers = new Headers(response.headers);
    headers.set("Content-Security-Policy", contentSecurityPolicy);
    return new Response(response.body, { status: response.status, headers });
  });
}

const database = new DatabaseService({
  settingsStore: new JsonSettingsStore(
    path.join(app.getPath("userData"), "settings.json"),
  ),
  fileDialog: new ElectronFileDialog(),
  defaultDatabase: path.join(app.getPath("userData"), "naturheilpraxis.db"),
});

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

  // The title names the open database instead of the title of the page.
  window.on("page-title-updated", (event) => event.preventDefault());
  showDatabase(window);

  if (devServerUrl === undefined) {
    void window.loadURL(rendererUrl);
  } else {
    void window.loadURL(devServerUrl);
  }
}

// Handles a message only from the main frame of the app. A frame embedded in
// it or a foreign page must not use the data of the Praxis.
function handle(
  channel: string,
  listener: Parameters<typeof ipcMain.handle>[1],
): void {
  ipcMain.handle(channel, (event, ...args) => {
    const frame = event.senderFrame;
    const sender =
      frame === null
        ? null
        : { url: frame.url, isMainFrame: frame.parent === null };
    if (!isTrustedSender(sender, rendererUrl)) {
      throw new Error(`The message ${channel} is not from the app.`);
    }
    return listener(event, ...args);
  });
}

// The windows show only the app. Links and scripts must neither lead to
// another page nor open a window.
app.on("web-contents-created", (_event, contents) => {
  contents.on("will-navigate", (event) => event.preventDefault());
  contents.setWindowOpenHandler(() => ({ action: "deny" }));
  contents.on("will-attach-webview", (event) => event.preventDefault());
});

// The app needs no permission like camera, microphone, location or
// notifications. The dictation of macOS is an input method of the system and
// needs none either.
function denyPermissions(session: Session): void {
  session.setPermissionRequestHandler((_contents, _permission, callback) =>
    callback(false),
  );
  session.setPermissionCheckHandler(() => false);
}

app.on("session-created", denyPermissions);

// The renderer sends each command and query on the channel named after its
// type, see NaturheilpraxisApi. They go to the open database.
function handleMessages(naturheilpraxis: () => NaturheilpraxisService): void {
  handle("praxis-anlegen", (_event, command) =>
    naturheilpraxis().praxisAnlegen(command),
  );
  handle("praxisdaten-aendern", (_event, command) =>
    naturheilpraxis().praxisdatenAendern(command),
  );
  handle("praxen-ermitteln", (_event, query) =>
    naturheilpraxis().praxenErmitteln(query),
  );
  handle("praxis-ermitteln", (_event, query) =>
    naturheilpraxis().praxisErmitteln(query),
  );
  handle("gebuehr-anlegen", (_event, command) =>
    naturheilpraxis().gebuehrAnlegen(command),
  );
  handle("gebuehr-aendern", (_event, command) =>
    naturheilpraxis().gebuehrAendern(command),
  );
  handle("gebuehr-entfernen", (_event, command) =>
    naturheilpraxis().gebuehrEntfernen(command),
  );
  handle("gebuehren-ermitteln", (_event, query) =>
    naturheilpraxis().gebuehrenErmitteln(query),
  );
  handle("patient-aufnehmen", (_event, command) =>
    naturheilpraxis().patientAufnehmen(command),
  );
  handle("patientendaten-aendern", (_event, command) =>
    naturheilpraxis().patientendatenAendern(command),
  );
  handle("patienten-ermitteln", (_event, query) =>
    naturheilpraxis().patientenErmitteln(query),
  );
  handle("patient-ermitteln", (_event, query) =>
    naturheilpraxis().patientErmitteln(query),
  );
  handle("diagnose-stellen", (_event, command) =>
    naturheilpraxis().diagnoseStellen(command),
  );
  handle("diagnose-aendern", (_event, command) =>
    naturheilpraxis().diagnoseAendern(command),
  );
  handle("diagnose-loeschen", (_event, command) =>
    naturheilpraxis().diagnoseLoeschen(command),
  );
  handle("behandlungen-ermitteln", (_event, query) =>
    naturheilpraxis().behandlungenErmitteln(query),
  );
  handle("diagnosen-ermitteln", (_event, query) =>
    naturheilpraxis().diagnosenErmitteln(query),
  );
  handle("leistung-erbringen", (_event, command) =>
    naturheilpraxis().leistungErbringen(command),
  );
  handle("leistung-aendern", (_event, command) =>
    naturheilpraxis().leistungAendern(command),
  );
  handle("leistung-loeschen", (_event, command) =>
    naturheilpraxis().leistungLoeschen(command),
  );
  handle("rechnung-erstellen", (_event, command) =>
    naturheilpraxis().rechnungErstellen(command),
  );
  handle("rechnung-aendern", (_event, command) =>
    naturheilpraxis().rechnungAendern(command),
  );
  handle("entwurf-loeschen", (_event, command) =>
    naturheilpraxis().entwurfLoeschen(command),
  );
  handle("nicht-abgerechnete-leistungen-ermitteln", (_event, query) =>
    naturheilpraxis().nichtAbgerechneteLeistungenErmitteln(query),
  );
  handle("rechnungen-ermitteln", (_event, query) =>
    naturheilpraxis().rechnungenErmitteln(query),
  );
  handle("kennzahlen-ermitteln", (_event, query) =>
    naturheilpraxis().kennzahlenErmitteln(query),
  );
  handle(
    "patienten-mit-nicht-abgerechneten-leistungen-ermitteln",
    (_event, query) =>
      naturheilpraxis().patientenMitNichtAbgerechnetenLeistungenErmitteln(
        query,
      ),
  );
  handle("rechnung-ermitteln", (_event, query) =>
    naturheilpraxis().rechnungErmitteln(query),
  );
  handle("rechnung-versenden", (_event, command) =>
    naturheilpraxis().rechnungVersenden(command),
  );
  handle("rechnung-zurueckstufen", (_event, command) =>
    naturheilpraxis().rechnungZurueckstufen(command),
  );
  handle("zahlung-erfassen", (_event, command) =>
    naturheilpraxis().zahlungErfassen(command),
  );
}

// The renderer chooses the database on the channels of DatabaseApi.
function handleDatabaseMessages(): void {
  handle("get-database-status", () => database.getStatus());
  handle("create-database", () => database.createDatabase());
  handle("open-database", () => database.openDatabase());
  handle("reopen-database", () => database.reopenDatabase());
}

// A database chosen from the menu replaces the open one, so the windows are
// reloaded to show its data. A failure keeps the open database.
async function switchDatabase(
  choose: () => Promise<DatabaseStatus>,
): Promise<void> {
  const before = database.getStatus().filename;
  const status = await choose();
  const window = BrowserWindow.getFocusedWindow();
  if (status.errorMessage !== undefined) {
    const options: Electron.MessageBoxOptions = {
      type: "error",
      message: "Die Datenbank konnte nicht geöffnet werden.",
      detail: status.errorMessage,
    };
    await (window === null
      ? dialog.showMessageBox(options)
      : dialog.showMessageBox(window, options));
    return;
  }
  if (status.filename !== before) {
    BrowserWindow.getAllWindows().forEach((window) => window.reload());
  }
}

function createMenu(): void {
  const isMac = process.platform === "darwin";
  const recent: MenuItemConstructorOptions[] = database.recentDatabases.map(
    (filename) => ({
      label: filename,
      click: () => void switchDatabase(() => database.openDatabase(filename)),
    }),
  );
  const template: MenuItemConstructorOptions[] = [
    ...(isMac ? [{ role: "appMenu" } as const] : []),
    {
      // The menu is named like the file menu of the system.
      label: isMac ? "Ablage" : "Datei",
      submenu: [
        {
          id: "create-database",
          label: "Neue Datenbank…",
          accelerator: "CmdOrCtrl+Shift+N",
          click: () => void switchDatabase(() => database.createDatabase()),
        },
        {
          id: "open-database",
          label: "Datenbank öffnen…",
          accelerator: "CmdOrCtrl+O",
          click: () => void switchDatabase(() => database.openDatabase()),
        },
        {
          label: "Zuletzt geöffnet",
          submenu:
            recent.length > 0
              ? recent
              : [{ label: "Keine Datenbanken", enabled: false }],
        },
        { type: "separator" },
        isMac ? { role: "close" } : { role: "quit" },
      ],
    },
    { role: "editMenu" },
    { role: "viewMenu" },
    { role: "windowMenu" },
  ];
  Menu.setApplicationMenu(Menu.buildFromTemplate(template));
}

// Shows the open database in the title of the window and, on macOS, as the
// document of the window.
function showDatabase(window: BrowserWindow): void {
  const { filename } = database.getStatus();
  window.setTitle(
    filename === undefined
      ? "Naturheilpraxis"
      : `${path.basename(filename)} – Naturheilpraxis`,
  );
  if (process.platform === "darwin") {
    window.setRepresentedFilename(filename ?? "");
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

void app.whenReady().then(() => {
  denyPermissions(session.defaultSession);
  handleAppProtocol();
  database.onOpened(() => {
    createMenu();
    BrowserWindow.getAllWindows().forEach(showDatabase);
  });
  database.start();
  app.on("will-quit", () => database.close());
  createMenu();
  handleMessages(() => database.naturheilpraxis);
  handleDatabaseMessages();
  createMainWindow();
});
