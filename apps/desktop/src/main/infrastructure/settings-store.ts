// Copyright (c) 2026 Falko Schumann. MIT license.

import fs from "node:fs";

export type Settings = Readonly<{
  // The databases opened last, the most recent first.
  recentDatabases: readonly string[];
}>;

export interface SettingsStore {
  load(): Settings;

  save(settings: Settings): void;
}

const defaultSettings: Settings = { recentDatabases: [] };

// Keeps the settings of the app as a JSON file. A missing or unreadable file
// yields the default settings, so the app still starts.
export class JsonSettingsStore implements SettingsStore {
  readonly #filename: string;

  constructor(filename: string) {
    this.#filename = filename;
  }

  load(): Settings {
    try {
      const settings: unknown = JSON.parse(
        fs.readFileSync(this.#filename, "utf-8"),
      );
      return isSettings(settings) ? settings : defaultSettings;
    } catch {
      return defaultSettings;
    }
  }

  save(settings: Settings): void {
    fs.writeFileSync(this.#filename, JSON.stringify(settings, undefined, 2));
  }
}

function isSettings(value: unknown): value is Settings {
  return (
    typeof value === "object" &&
    value !== null &&
    "recentDatabases" in value &&
    Array.isArray(value.recentDatabases) &&
    value.recentDatabases.every((entry) => typeof entry === "string")
  );
}
