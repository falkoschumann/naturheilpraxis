// Copyright (c) 2026 Falko Schumann. All rights reserved. MIT license.

import { useCallback } from "react";

import type { NimmPatientAufCommand } from "../../../../shared/domain/nimm_patient_auf_command";
import { useMessageHandler } from "../../components/message_handler_context";

export function useNimmPatientAuf() {
  const messageHandler = useMessageHandler();

  const nimmPatientAuf = useCallback(
    (command: NimmPatientAufCommand) => {
      return messageHandler.nimmPatientAuf(command);
    },
    [messageHandler],
  );

  return nimmPatientAuf;
}
