// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

import { Settings } from "../../shared/domain/settings";
import { SettingsGateway } from "../infrastructure/settings_gateway";

// TODO convert to functions

export class SettingsService {
  static create() {
    return new SettingsService(SettingsGateway.create());
  }

  readonly settingsGateway: SettingsGateway;

  constructor(settingsGateway: SettingsGateway) {
    this.settingsGateway = settingsGateway;
  }

  async loadSettings(): Promise<Settings> {
    const settings = await this.settingsGateway.load();
    return settings ?? Settings.createDefault();
  }

  async storeSettings(settings: Settings): Promise<void> {
    await this.settingsGateway.store(settings);
  }
}
