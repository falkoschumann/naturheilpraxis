// Copyright (c) 2026 Falko Schumann. All rights reserved. MIT license.

import { useEffect, useState } from "react";

import { Settings } from "../../../../shared/domain/settings";
import { useMessageHandler } from "../../components/message_handler_context";

export function useSettings() {
  const [settings, setSettings] = useState(Settings.create());
  const messageHandler = useMessageHandler();

  async function updateSettings(settings: Settings) {
    await messageHandler.storeSettings(settings);
    setSettings(settings);
  }

  useEffect(() => {
    async function runAsync() {
      const loadedSettings = await messageHandler.loadSettings();
      setSettings(loadedSettings);
    }

    void runAsync();
  }, [messageHandler]);

  return [settings, updateSettings] as const;
}
