// Copyright (c) 2026 Falko Schumann. All rights reserved. MIT license.

import { useEffect, useState } from "react";

import { Einstellungen } from "../../../../shared/domain/einstellungen";
import { useMessageHandler } from "../../components/message_handler_context";

export function useEinstellungen() {
  const [einstellungen, setEinstellungen] = useState(Einstellungen.create());
  const messageHandler = useMessageHandler();

  async function sichereEinstellungen(einstellungen: Einstellungen) {
    await messageHandler.sichereEinstellungen(einstellungen);
    setEinstellungen(einstellungen);
  }

  useEffect(() => {
    async function runAsync() {
      const einstellungen = await messageHandler.ladeEinstellungen();
      setEinstellungen(einstellungen);
    }

    void runAsync();
  }, [messageHandler]);

  return [einstellungen, sichereEinstellungen] as const;
}
