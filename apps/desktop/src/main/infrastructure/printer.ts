// Copyright (c) 2026 Falko Schumann. MIT license.

import { BrowserWindow } from "electron";

// Printed, or the user has cancelled the print dialog, or the page could not
// be loaded, or printing failed.
export type PrintResult = "printed" | "cancelled" | "not-loaded" | "failed";

export interface Printer {
  print(url: string): Promise<PrintResult>;
}

// Prints a page of the app with the print dialog of the system, which can also
// save it as PDF. The page is loaded in a hidden window of its own without
// JavaScript and without preload script, so that a template can neither run a
// script nor reach the app. A page answered with an error is not printed.
export class ElectronPrinter implements Printer {
  async print(url: string): Promise<PrintResult> {
    const window = new BrowserWindow({
      show: false,
      webPreferences: { javascript: false, sandbox: true },
    });
    try {
      let status: number | undefined;
      window.webContents.once("did-navigate", (_event, _url, code) => {
        status = code;
      });
      try {
        await window.loadURL(url);
      } catch {
        return "not-loaded";
      }
      if (status !== 200) {
        return "not-loaded";
      }

      return await new Promise<PrintResult>((resolve) =>
        window.webContents.print({}, (success, failureReason) =>
          resolve(
            success
              ? "printed"
              : failureReason === "cancelled"
                ? "cancelled"
                : "failed",
          ),
        ),
      );
    } finally {
      window.destroy();
    }
  }
}
