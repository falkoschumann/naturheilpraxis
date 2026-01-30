// Copyright (c) 2026 Falko Schumann. All rights reserved. MIT license.

import { useCallback, useState } from "react";

import {
  NimmPatientAufCommand,
  type NimmPatientAufCommandStatus,
} from "../../shared/domain/nimm_patient_auf_command";
import { useMessageHandler } from "./message_handler_context";

export function useNimmPatientAuf() {
  const [status, setStatus] = useState<NimmPatientAufCommandStatus>();
  const messageHandler = useMessageHandler();

  const nimmPatientAuf = useCallback(
    async (command: NimmPatientAufCommand) => {
      const result = await messageHandler.nimmPatientAuf(command);
      setStatus(result);
    },
    [messageHandler],
  );

  return [nimmPatientAuf, status] as const;
}
