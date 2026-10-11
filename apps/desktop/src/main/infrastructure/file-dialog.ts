// Copyright (c) 2026 Falko Schumann. MIT license.

import path from "node:path";

import { app, BrowserWindow, dialog } from "electron";

export interface FileDialog {
  // Returns undefined when the user cancels.
  chooseNewDatabase(): Promise<string | undefined>;

  // Returns undefined when the user cancels.
  chooseExistingDatabase(): Promise<string | undefined>;
}

export interface TemplateFileDialog {
  // Suggests the file name in the documents folder. Returns undefined when the
  // user cancels.
  chooseTemplateToExport(filename: string): Promise<string | undefined>;

  // Returns undefined when the user cancels.
  chooseTemplateToImport(): Promise<string | undefined>;
}

const filters = [{ name: "Naturheilpraxis-Datenbank", extensions: ["db"] }];

const templateFilters = [{ name: "HTML-Datei", extensions: ["html", "htm"] }];

// The file dialogs of the system, attached to the focused window.
export class ElectronFileDialog implements FileDialog, TemplateFileDialog {
  async chooseNewDatabase(): Promise<string | undefined> {
    const options: Electron.SaveDialogOptions = {
      title: "Neue Datenbank anlegen",
      buttonLabel: "Anlegen",
      // Windows and macOS always ask before overwriting a file.
      properties: ["showOverwriteConfirmation"],
      defaultPath: path.join(app.getPath("documents"), "Naturheilpraxis.db"),
      filters,
    };
    const window = BrowserWindow.getFocusedWindow();
    const result = await (window === null
      ? dialog.showSaveDialog(options)
      : dialog.showSaveDialog(window, options));
    return result.canceled ? undefined : result.filePath;
  }

  async chooseExistingDatabase(): Promise<string | undefined> {
    const options: Electron.OpenDialogOptions = {
      title: "Datenbank öffnen",
      buttonLabel: "Öffnen",
      properties: ["openFile"],
      filters,
    };
    const window = BrowserWindow.getFocusedWindow();
    const result = await (window === null
      ? dialog.showOpenDialog(options)
      : dialog.showOpenDialog(window, options));
    return result.canceled ? undefined : result.filePaths[0];
  }

  async chooseTemplateToExport(filename: string): Promise<string | undefined> {
    const options: Electron.SaveDialogOptions = {
      title: "Rechnungsvorlage exportieren",
      buttonLabel: "Exportieren",
      properties: ["showOverwriteConfirmation"],
      defaultPath: path.join(app.getPath("documents"), filename),
      filters: templateFilters,
    };
    const window = BrowserWindow.getFocusedWindow();
    const result = await (window === null
      ? dialog.showSaveDialog(options)
      : dialog.showSaveDialog(window, options));
    return result.canceled ? undefined : result.filePath;
  }

  async chooseTemplateToImport(): Promise<string | undefined> {
    const options: Electron.OpenDialogOptions = {
      title: "Rechnungsvorlage importieren",
      buttonLabel: "Importieren",
      properties: ["openFile"],
      filters: templateFilters,
    };
    const window = BrowserWindow.getFocusedWindow();
    const result = await (window === null
      ? dialog.showOpenDialog(options)
      : dialog.showOpenDialog(window, options));
    return result.canceled ? undefined : result.filePaths[0];
  }
}
